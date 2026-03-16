import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import {
    toggleVerificationMode,
    toggleFieldRejection
} from '../store/slices/customerRegistrationSlice';
import * as locationService from '../services/locationService';
import {
    getCustomerConfigs,
    getBrandCategories,
    registerCustomer,
    draftRegisterCustomer,
    updateDraftCustomer,
    getDraftCustomerById,
    getCustomerById,
    resubmitCustomerCorrection,
    approveCustomerFinance,
    sendCustomerForCorrection
} from '../services/customerService';
import { uploadImage } from '../services/bucketService';
import { PATHS } from '../routes/paths';
import CorrectionRequestModal from '../components/ui/CorrectionRequestModal';

const INITIAL_FORM_VALUES = {
    shopName: '',
    ownerName: '',
    CustomerTypeRefId: '',
    orderMode: '',
    mobileNo1: '',
    mobileNo2: '',
    landlineNo: '',
    emailId: '',
    businessEmail: '',
    gstType: 'unregistered',
    gstTypeRefId: '',
    GSTNumber: '',
    GSTCertificateImg: '',
    AadharCard: '',
    AadharCardImg: '',
    PANCard: '',
    PANCardImg: '',
    address: [
        { branchAddress: '', contactPerson: '', contactNumber: '', city: '', state: '', country: 'India', billingCurrency: 'Indian Rupees', billingMode: 'Credit', zipCode: '' }
    ],
    customerpassword: '',
    zoneRefId: '',
    brandCategories: [{ brandId: '', brandName: '', categories: [] }],
    specificLabRefId: '',
    salesPersonRefId: '',
    plantRefId: '',
    fittingCenterRefId: '',
    creditLimit: '',
    creditDaysRefId: '',
    courierNameRefId: '',
    courierTimeRefId: ''
};

const mapCustomerToFormValues = (customer, configs = {}) => {
    if (!customer) return INITIAL_FORM_VALUES;

    // Helper to find ID by label in a config list
    const findId = (list, val, labelKey = 'name') => {
        if (!val) return '';
        if (!list || !Array.isArray(list)) return val;

        const searchVal = String(val).toLowerCase();
        const item = list.find(i =>
            String(i._id).toLowerCase() === searchVal ||
            String(i[labelKey] || i).toLowerCase() === searchVal
        );
        return item?._id || val;
    };

    // Helper to get Label from object or string
    const getLabel = (obj, list, labelKey = 'name') => {
        if (!obj) return '';
        if (typeof obj === 'string') {
            // If it's already an ID, try to get the label from list
            const item = (list || []).find(i => i._id === obj);
            return item ? (item[labelKey] || item) : obj;
        }
        return obj.name || obj.employeeName || obj.zone || obj.days || obj.time || '';
    };

    const getRefId = (obj, list, labelKey = 'name') => {
        if (!obj) return '';
        const baseId = (typeof obj === 'object') ? (obj._id || obj.refId || '') : obj;
        return findId(list, baseId, labelKey);
    };

    return {
        ...INITIAL_FORM_VALUES,
        ...customer,
        CustomerType: getLabel(customer.CustomerType, configs.customerTypes),
        CustomerTypeRefId: getRefId(customer.CustomerType, configs.customerTypes),
        gstType: getLabel(customer.gstType, configs.gstTypes) || (customer.IsGSTRegistered ? 'Regular' : 'Unregistered'),
        gstTypeRefId: getRefId(customer.gstType || (customer.IsGSTRegistered ? 'Regular' : 'Unregistered'), configs.gstTypes),
        zoneRefId: getRefId(customer.zone, configs.zones, 'zone'),
        salesPersonRefId: getRefId(customer.salesPerson, configs.salesPersons, 'employeeName'),
        specificLabRefId: getRefId(customer.specificLab, configs.specificLabs),
        plantRefId: getRefId(customer.plant, configs.plants),
        fittingCenterRefId: getRefId(customer.fittingCenter, configs.fittingCenters),
        creditDaysRefId: getRefId(customer.creditDays, configs.creditDays, 'days'),
        courierNameRefId: getRefId(customer.courierName, configs.courierNames),
        courierTimeRefId: getRefId(customer.courierTime, configs.courierTimes, 'time'),
        address: customer.address?.length ? customer.address : INITIAL_FORM_VALUES.address,
        brandCategories: (customer.brandCategories?.length) ? customer.brandCategories.map(bc => ({
            brandId: getRefId(bc.brandId, configs.brands),
            brandName: getLabel(bc.brandId, configs.brands),
            categories: (bc.categories || []).map(cat => ({
                categoryId: getRefId(cat.categoryId),
                categoryName: getLabel(cat.categoryId)
            }))
        })) : INITIAL_FORM_VALUES.brandCategories,
    };
};



export default function RegisterCustomer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useSelector((state) => state.auth.user);
    const isSalesUser = user?.Department?.name?.toUpperCase() === 'SALES';
    const isFinanceUser = ['FINANCE', 'F&A', 'F&A CFO', 'ACCOUNTING', 'SUPERADMIN', 'ADMIN'].includes(user?.Department?.name?.toUpperCase()) || user?.EmployeeType === 'SUPERADMIN';

    const steps = useMemo(() => {
        const baseSteps = ['Customer Info', 'Address Details', 'Customer Regn', 'Overview'];
        if (isSalesUser) {
            return baseSteps.filter(step => step !== 'Customer Regn');
        }
        return baseSteps;
    }, [isSalesUser]);

    const activeStep = useMemo(() => {
        const step = parseInt(searchParams.get('step'));
        return isNaN(step) ? 0 : Math.min(Math.max(0, step), steps.length - 1);
    }, [searchParams, steps]);

    const validationSchema = useMemo(() => Yup.object().shape({
        shopName: Yup.string().required('Shop Name is required'),
        ownerName: Yup.string().required('Owner Name is required'),
        CustomerTypeRefId: Yup.string().required('Customer Type is required'),
        mobileNo1: Yup.string().matches(/^\d{10}$/, 'Mobile No. must be 10 digits').required('Mobile No. 1 is required'),
        mobileNo2: Yup.string().matches(/^\d{10}$/, 'Mobile No. must be 10 digits').nullable(),
        landlineNo: Yup.string().matches(/^\d{8,12}$/, 'Landline No. must be between 8 and 12 digits').nullable(),
        emailId: Yup.string().email('Invalid email').required('Email ID is required'),
        businessEmail: Yup.string().email('Invalid business email').nullable(),
        gstType: Yup.string().required('GST Type is required'),
        GSTNumber: Yup.string().when('gstType', {
            is: (val) => val?.toLowerCase() !== 'unregistered',
            then: (schema) => schema.required('GST Number is required'),
            otherwise: (schema) => schema.notRequired()
        }),
        address: Yup.array().of(
            Yup.object().shape({
                branchAddress: Yup.string().required('Branch Address is required'),
                city: Yup.string().required('City is required'),
                state: Yup.string().required('State is required'),
                contactNumber: Yup.string().required('Contact Number is required'),
                zipCode: Yup.string().required('Pincode is required'),
            })
        ),
        customerpassword: isSalesUser ? Yup.string().notRequired() : Yup.string().required('Password is required'),
        AadharCard: Yup.string().when('gstType', {
            is: (val) => val?.toLowerCase() === 'unregistered',
            then: (schema) => schema.matches(/^\d{12}$/, 'Aadhar No. must be 12 digits').required('Aadhar Card No. is required'),
            otherwise: (schema) => schema.notRequired()
        }),
        PANCard: Yup.string().when('gstType', {
            is: (val) => val?.toLowerCase() === 'unregistered',
            then: (schema) => schema.matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)').required('PAN Card No. is required'),
            otherwise: (schema) => schema.notRequired()
        }),
        brandCategories: isSalesUser ? Yup.array().notRequired() : Yup.array().of(
            Yup.object().shape({
                brandId: Yup.string().required('Brand is required'),
                categories: Yup.array().of(
                    Yup.object().shape({
                        categoryId: Yup.string().required('Category is required')
                    })
                ).min(1, 'At least one category is required')
            })
        ).min(1, 'At least one brand is required')
    }), [isSalesUser]);

    const setStep = (step) => {
        setSearchParams({ step: step.toString() });
    };

    const isVerificationMode = useSelector((state) => state.customerRegistration.isVerificationMode);
    const rejectedFields = useSelector((state) => state.customerRegistration.rejectedFields);

    const aadharInputRef = useRef(null);
    const panInputRef = useRef(null);
    const gstInputRef = useRef(null);

    const [configs, setConfigs] = useState({
        customerTypes: [],
        creditDays: [],
        courierNames: [],
        courierTimes: [],
        zones: [],
        cities: {},
        brands: [],
        specificLabs: [],
        salesPersons: [],
        gstTypes: []
    });

    const [uploading, setUploading] = useState({
        aadhar: false,
        pan: false,
        gst: false
    });

    const [savingDraft, setSavingDraft] = useState(false);
    const [loadingDraftData, setLoadingDraftData] = useState(false);
    const [draftCustomerId, setDraftCustomerId] = useState('');
    const [correctionCustomerId, setCorrectionCustomerId] = useState('');
    const [approvalId, setApprovalId] = useState('');
    const [correctionRequest, setCorrectionRequest] = useState(null);
    const [isApprovalMode, setIsApprovalMode] = useState(false);
    const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [data, zoneRes] = await Promise.all([
                    getCustomerConfigs(),
                    locationService.getAllZones()
                ]);

                // Robustly extract zones array
                let zones = zoneRes?.data || zoneRes || [];
                if (!Array.isArray(zones) && zones && typeof zones === 'object') {
                    zones = zones.locations || zones.data || Object.values(zones).find(Array.isArray) || [];
                }

                // Robustly extract all arrays from data (handles nested objects like salesPersons)
                Object.keys(data).forEach(key => {
                    if (data[key] && !Array.isArray(data[key]) && typeof data[key] === 'object') {
                        data[key] = data[key][key] || Object.values(data[key]).find(Array.isArray) || [];
                    }
                });

                setConfigs(prev => {
                    const next = { ...prev, ...data };
                    next.zones = Array.isArray(zones) ? zones : [];
                    // Ensure everything is an array
                    Object.keys(next).forEach(key => {
                        if (key !== 'cities' && !Array.isArray(next[key])) {
                            next[key] = [];
                        }
                    });
                    return next;
                });
            } catch {
                toast.error('Failed to load form configurations');
            }
        };
        fetchConfigs();
    }, []);
    const formik = useFormik({
        initialValues: INITIAL_FORM_VALUES,
        validationSchema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values) => {
            const getLabel = (list, id, labelKey = 'name') => {
                const item = list.find(item => item._id === id);
                if (!item) return '';
                return item[labelKey] || item;
            };

            const payload = {
                ...values,
                draftEmployeeId: draftCustomerId || undefined,
                CustomerType: getLabel(configs.customerTypes, values.CustomerTypeRefId),
                salesPerson: getLabel(configs.salesPersons, values.salesPersonRefId, 'employeeName'),
                gstType: getLabel(configs.gstTypes, values.gstTypeRefId),
                zone: getLabel(configs.zones, values.zoneRefId, 'zone'),
                specificLab: getLabel(configs.specificLabs, values.specificLabRefId),
                plant: getLabel(configs.plants, values.plantRefId),
                fittingCenter: getLabel(configs.fittingCenters, values.fittingCenterRefId),
                creditDays: getLabel(configs.creditDays, values.creditDaysRefId, 'days').toString(),
                courierName: getLabel(configs.courierNames, values.courierNameRefId),
                courierTime: getLabel(configs.courierTimes, values.courierTimeRefId, 'time'),
                creditLimit: Number(values.creditLimit) || 0,
                IsGSTRegistered: values.gstType !== 'Unregistered',
                brandCategories: values.brandCategories.map(bc => ({
                    brandId: bc.brandId,
                    brandName: getLabel(configs.brands, bc.brandId),
                    categories: bc.categories.map(cat => ({
                        categoryId: cat.categoryId,
                        categoryName: cat.categoryName
                    }))
                }))
            };

            const getObj = (list, refId, labelKey = 'name') => {
                if (!refId) return undefined;
                return {
                    name: getLabel(list, refId, labelKey),
                    refId: refId
                };
            };

            let finalPayload = payload;
            if (approvalId) {
                finalPayload = {
                    ...payload,
                    password: values.customerpassword,
                    CustomerType: getObj(configs.customerTypes, values.CustomerTypeRefId),
                    salesPerson: getObj(configs.salesPersons, values.salesPersonRefId, 'employeeName'),
                    gstType: getObj(configs.gstTypes, values.gstTypeRefId),
                    zone: getObj(configs.zones, values.zoneRefId, 'zone'),
                    specificLab: getObj(configs.specificLabs, values.specificLabRefId),
                    plant: getObj(configs.plants, values.plantRefId),
                    fittingCenter: getObj(configs.fittingCenters, values.fittingCenterRefId),
                    creditDays: getObj(configs.creditDays, values.creditDaysRefId, 'days'),
                    courierName: getObj(configs.courierNames, values.courierNameRefId),
                    courierTime: getObj(configs.courierTimes, values.courierTimeRefId, 'time'),
                };
                delete finalPayload.customerpassword;
                delete finalPayload.CustomerTypeRefId;
                delete finalPayload.salesPersonRefId;
                delete finalPayload.gstTypeRefId;
                delete finalPayload.zoneRefId;
                delete finalPayload.specificLabRefId;
                delete finalPayload.plantRefId;
                delete finalPayload.fittingCenterRefId;
                delete finalPayload.creditDaysRefId;
                delete finalPayload.courierNameRefId;
                delete finalPayload.courierTimeRefId;
            }

            try {
                if (correctionCustomerId) {
                    // Filter payload to only include fields listed in correctionRequest.fieldsToCorrect
                    const correctionFields = correctionRequest?.fieldsToCorrect || [];
                    const filteredPayload = {};

                    correctionFields.forEach(field => {
                        const topKey = field.split(/[.[\]]+/)[0];
                        if (['address', 'brandCategories'].includes(topKey)) {
                            // Send the entire array for complex nested structures
                            filteredPayload[topKey] = values[topKey];
                        } else if (values[field] !== undefined) {
                            filteredPayload[field] = values[field];
                        } else if (payload[field] !== undefined) {
                            filteredPayload[field] = payload[field];
                        }
                    });

                    // Relationship mapping: if RefId is rejected, ensure Label is sent, and vice-versa
                    const mappings = [
                        { id: 'CustomerTypeRefId', label: 'CustomerType' },
                        { id: 'salesPersonRefId', label: 'salesPerson' },
                        { id: 'gstTypeRefId', label: 'gstType' },
                        { id: 'zoneRefId', label: 'zone' },
                        { id: 'specificLabRefId', label: 'specificLab' },
                        { id: 'plantRefId', label: 'plant' },
                        { id: 'fittingCenterRefId', label: 'fittingCenter' },
                        { id: 'creditDaysRefId', label: 'creditDays' },
                        { id: 'courierNameRefId', label: 'courierName' },
                        { id: 'courierTimeRefId', label: 'courierTime' }
                    ];

                    mappings.forEach(({ id, label }) => {
                        if (correctionFields.includes(id) || correctionFields.includes(label)) {
                            filteredPayload[id] = values[id];
                            filteredPayload[label] = payload[label];
                        }
                    });

                    // Calculated fields
                    if (correctionFields.includes('gstType') || correctionFields.includes('gstTypeRefId') || correctionFields.includes('IsGSTRegistered')) {
                        filteredPayload.IsGSTRegistered = payload.IsGSTRegistered;
                    }

                    // Calculated fields
                    if (correctionFields.includes('gstType') || correctionFields.includes('gstTypeRefId') || correctionFields.includes('IsGSTRegistered')) {
                        filteredPayload.IsGSTRegistered = payload.IsGSTRegistered;
                    }

                    await toast.promise(
                        resubmitCustomerCorrection(correctionCustomerId, filteredPayload),
                        {
                            pending: 'Resubmitting corrections...',
                            success: 'Corrections resubmitted successfully! 👌',
                        }
                    );
                } else {
                    await toast.promise(
                        registerCustomer(finalPayload),
                        {
                            pending: 'Registering customer...',
                            success: 'Customer registered successfully! 👌',
                        }
                    );
                }
                navigate(PATHS.APPROVALS);
            } catch (error) {
                console.error('Registration error:', error);
                toast.error(error.error?.message || error.message || "Operation failed. Please try again. 🤯");
            }
        }
    });

    const loadDraftDataById = useCallback(async (draftId) => {
        setLoadingDraftData(true);
        try {
            const response = await getDraftCustomerById(draftId);
            const draft = response.data || response;
            const draftData = draft.data || draft;
            const formValues = mapCustomerToFormValues(draftData, configs);

            formik.setValues(formValues, false);
            setDraftCustomerId(draftId);
            toast.success('Draft loaded successfully');
        } catch (error) {
            console.error('Error loading draft data:', error);
            toast.error('Failed to load draft data');
        } finally {
            setLoadingDraftData(false);
        }
    }, [formik.setValues, configs]);

    useEffect(() => {
        const draftId = searchParams.get('draftId');
        if (draftId) {
            loadDraftDataById(draftId);
        }

        const correctionId = searchParams.get('correctionId');
        if (correctionId) {
            const fetchCorrectionData = async () => {
                setLoadingDraftData(true);
                try {
                    const response = await getCustomerById(correctionId);
                    const customer = response.data?.customer || response.data || response;
                    const formValues = mapCustomerToFormValues(customer, configs);

                    formik.setValues(formValues, false);
                    setCorrectionCustomerId(correctionId);
                    setCorrectionRequest(customer.correctionRequest);
                    toast.info('Correction details loaded. Please update the highlighted fields.');
                } catch (error) {
                    console.error('Error loading correction data:', error);
                    toast.error('Failed to load correction data');
                } finally {
                    setLoadingDraftData(false);
                }
            };
            fetchCorrectionData();
        }

        const approvalIdFromUrl = searchParams.get('approvalId');
        if (approvalIdFromUrl) {
            const fetchApprovalData = async () => {
                setLoadingDraftData(true);
                try {
                    const response = await getCustomerById(approvalIdFromUrl);
                    const customer = response.data?.customer || response.data || response;

                    const formValues = mapCustomerToFormValues(customer, configs);
                    // Ensure password is reset for finance to fill
                    formValues.customerpassword = '';

                    formik.setValues(formValues, false);

                    setApprovalId(approvalIdFromUrl);
                    if (isFinanceUser) {
                        setIsApprovalMode(true);
                    } else {
                        setIsReadOnlyMode(true);
                    }
                    toast.info(isFinanceUser ? 'Approval data loaded. Please complete the registration.' : 'Application details loaded (View Only).');
                } catch (error) {
                    console.error('Error loading approval data:', error);
                    toast.error('Failed to load approval data');
                } finally {
                    setLoadingDraftData(false);
                }
            };
            fetchApprovalData();
        }
    }, [searchParams, loadDraftDataById, configs, isFinanceUser]);

    const handleSaveDraft = useCallback(async () => {
        setSavingDraft(true);
        try {
            const values = formik.values;
            const getLabel = (list, id, labelKey = 'name') => {
                if (!list || !id) return '';
                const item = list.find(item => item._id === id);
                if (!item) return '';
                return item[labelKey] || item;
            };

            const draftPayload = {
                ...values,
                draftEmployeeId: draftCustomerId || undefined,
                CustomerType: getLabel(configs.customerTypes, values.CustomerTypeRefId),
                salesPerson: getLabel(configs.salesPersons, values.salesPersonRefId, 'employeeName'),
                gstType: getLabel(configs.gstTypes, values.gstTypeRefId),
                zone: getLabel(configs.zones, values.zoneRefId, 'zone'),
                specificLab: getLabel(configs.specificLabs, values.specificLabRefId),
                plant: getLabel(configs.plants, values.plantRefId),
                fittingCenter: getLabel(configs.fittingCenters, values.fittingCenterRefId),
                creditDays: getLabel(configs.creditDays, values.creditDaysRefId, 'days'),
                courierName: getLabel(configs.courierNames, values.courierNameRefId),
                courierTime: getLabel(configs.courierTimes, values.courierTimeRefId, 'time'),
                creditLimit: Number(values.creditLimit) || 0,
                IsGSTRegistered: values.gstType !== 'Unregistered',
                brandCategories: values.brandCategories.map(bc => ({
                    brandId: bc.brandId,
                    brandName: getLabel(configs.brands, bc.brandId),
                    categories: bc.categories.map(cat => ({
                        categoryId: cat.categoryId,
                        categoryName: cat.categoryName
                    }))
                }))
            };

            const response = await toast.promise(
                draftCustomerId
                    ? updateDraftCustomer(draftCustomerId, draftPayload)
                    : draftRegisterCustomer(draftPayload),
                {
                    pending: draftCustomerId ? 'Updating draft...' : 'Saving draft...',
                    success: draftCustomerId ? 'Draft updated successfully! 👌' : 'Draft saved successfully! 👌',
                    error: draftCustomerId ? 'Failed to update draft' : 'Failed to save draft'
                }
            );

            if (response.success && !draftCustomerId) {
                const newId = response.data?._id || response.data?.customer?._id;
                if (newId) setDraftCustomerId(newId);
            }
        } catch (error) {
            console.error('Draft error:', error);
            toast.error(error.error?.message || error.message || "Failed to save draft.");
        } finally {
            setSavingDraft(false);
        }
    }, [formik.values, configs, draftCustomerId]);

    const handleSendForCorrection = async (correctionData) => {
        if (!approvalId) return;
        try {
            await toast.promise(
                sendCustomerForCorrection(approvalId, correctionData),
                {
                    pending: 'Sending for correction...',
                    success: 'Customer sent back for correction! 📝',
                }
            );
            navigate(PATHS.APPROVALS);
        } catch (error) {
            console.error('Correction error:', error);
            toast.error(error.message || "Failed to send for correction");
        }
    };

    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

    const handleFileUpload = async (e, fieldName, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const response = await uploadImage(file);
            const url = response.data?.url || response.url || response;
            formik.setFieldValue(fieldName, url);
            toast.success("Document uploaded successfully!");
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const wrapInput = (Component, props, hideVerify = false) => {
        const { onChange: customOnChange, disabled: customDisabled, ...rest } = props;
        const isCorrectionField = correctionRequest?.fieldsToCorrect?.includes(props.name);

        const getIn = (obj, path) => {
            if (!obj || !path) return undefined;
            const keys = path.split(/[.[\]]+/).filter(Boolean);
            let current = obj;
            for (const key of keys) {
                if (!current || typeof current !== 'object') return undefined;
                current = current[key];
            }
            return current;
        };

        const fieldError = getIn(formik.errors, props.name);
        const fieldTouched = getIn(formik.touched, props.name);
        const fieldValue = getIn(formik.values, props.name);

        return (
            <div className={`relative ${isCorrectionField ? 'p-1 rounded-2xl bg-red-50/50 border border-red-100 ring-2 ring-red-500/20' : ''}`}>
                <Component
                    {...rest}
                    disabled={isReadOnlyMode || customDisabled}
                    isVerificationMode={hideVerify ? false : isVerificationMode}
                    isRejected={rejectedFields[props.name]}
                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                    error={fieldTouched && fieldError ? { message: fieldError } : null}
                    onChange={(e) => {
                        if (customOnChange) customOnChange(e);
                        else formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    value={fieldValue ?? ''}
                />
                {isCorrectionField && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg animate-bounce z-20">
                        <Icon icon="mdi:alert-circle" className="text-sm" />
                    </div>
                )}
            </div>
        );
    };

    const isStepValid = () => {
        const { values, errors } = formik;

        switch (activeStep) {
            case 0: // Basic Info
                const reqFields = ['shopName', 'ownerName', 'CustomerTypeRefId', 'orderMode', 'mobileNo1', 'emailId', 'gstType'];
                const optFields = ['mobileNo2', 'landlineNo', 'businessEmail'];
                const hasReqFields = reqFields.every(field => !!values[field]);
                const hasErrors = [...reqFields, ...optFields].some(field => !!errors[field]);

                if (!hasReqFields || hasErrors) return false;

                if (values.gstType?.toLowerCase() !== 'unregistered') {
                    return !!values.GSTNumber && !!values.GSTCertificateImg && !errors.GSTNumber;
                } else {
                    return !!values.AadharCard && !!values.AadharCardImg && !!values.PANCard && !!values.PANCardImg && !errors.AadharCard && !errors.PANCard;
                }

            case 1: // Address Details
                if (!values.address || values.address.length === 0) return false;
                const addrFields = ['branchAddress', 'contactPerson', 'contactNumber', 'city', 'state', 'zipCode'];
                return values.address.every((addr, idx) => {
                    const hasFields = addrFields.every(f => !!addr[f]);
                    const hasErrors = errors.address?.[idx] && addrFields.some(f => !!errors.address[idx][f]);
                    return hasFields && !hasErrors;
                });

            case 2: // Customer Regn (or Overview for Sales)
                if (isSalesUser) return true;
                const regFields = ['customerpassword', 'zoneRefId', 'salesPersonRefId', 'specificLabRefId', 'plantRefId', 'fittingCenterRefId', 'creditLimit', 'creditDaysRefId', 'courierNameRefId', 'courierTimeRefId'];
                const hasRegFields = regFields.every(field => !!values[field]);
                const regErrors = regFields.some(field => !!errors[field]);
                const hasBrands = values.brandCategories && values.brandCategories.length > 0;
                const brandsValid = hasBrands && values.brandCategories.every((bc, idx) => {
                    const hasId = !!bc.brandId;
                    const hasCats = bc.categories && bc.categories.length > 0;
                    const catsValid = hasCats && bc.categories.every(cat => !!cat.categoryId);
                    return hasId && catsValid;
                });
                return hasRegFields && !regErrors && brandsValid;

            case 3:
                return true;
            default: return false;
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0: return (
                <CustomerInfo
                    wrapInput={wrapInput}
                    configs={configs}
                    formik={formik}
                    aadharRef={aadharInputRef}
                    panRef={panInputRef}
                    gstRef={gstInputRef}
                    handleFileUpload={handleFileUpload}
                    uploading={uploading}
                    isReadOnlyMode={isReadOnlyMode}
                />
            );
            case 1: return <AddressDetails formik={formik} wrapInput={wrapInput} configs={configs} isVerificationMode={isVerificationMode} rejectedFields={rejectedFields} dispatch={dispatch} isReadOnlyMode={isReadOnlyMode} />;
            case 2:
                if (isSalesUser) return <Overview formik={formik} configs={configs} isSalesUser={isSalesUser} />;
                return <CustomerRegn wrapInput={wrapInput} configs={configs} formValues={formik.values} formik={formik} dispatch={dispatch} isReadOnlyMode={isReadOnlyMode} />;
            case 3: return <Overview formik={formik} configs={configs} isSalesUser={isSalesUser} />;
            default: return null;
        }
    };

    const customerName = formik.values.shopName || 'this customer';

    return (
        <div className="min-h-screen p-6">
            {/* Correction Header */}
            {correctionRequest && (
                <div className="max-w-6xl mx-auto mb-8 bg-red-50 border border-red-100 rounded-[2rem] p-8 flex items-start gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                        <Icon icon="mdi:comment-alert" className="text-2xl" />
                    </div>
                    <div>
                        <h4 className="text-red-800 font-black uppercase tracking-widest text-xs mb-1">Correction Required</h4>
                        <p className="text-red-700 font-bold text-sm leading-relaxed">{correctionRequest.remark}</p>
                        <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2 flex items-center gap-2">
                            Requested By: {correctionRequest.requestedBy?.employeeName || 'Finance'} • {correctionRequest.requestedAt ? new Date(correctionRequest.requestedAt).toLocaleDateString() : 'Recent'}
                        </p>
                    </div>
                </div>
            )}

            {/* Approval Mode Banner */}
            {isApprovalMode && (
                <div className="max-w-6xl mx-auto mb-8 bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        <Icon icon="mdi:shield-check" className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-amber-800 font-black uppercase tracking-widest text-xs mb-1">Finance Approval Mode</h4>
                        <p className="text-amber-700 font-bold text-sm leading-relaxed">
                            You are reviewing a customer registration submitted by Sales. Please verify all details, provide the mandatory <span className="underline">Login Details</span>, and click Approve to finalize.
                        </p>
                    </div>
                    {isFinanceUser && (activeStep === 0 || activeStep === 1 || activeStep === steps.length - 1) && (
                        <Button
                            variant="outlined"
                            className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100 flex gap-2 align-center justify-center"
                            onClick={() => setIsCorrectionModalOpen(true)}
                        >
                            {/* <Icon icon="mdi:keyboard-backspace" className="mr-2" /> */}
                            Send for Correction
                        </Button>
                    )}
                </div>
            )}

            {isReadOnlyMode && (
                <div className="max-w-6xl mx-auto mb-8 bg-gray-50 border border-gray-100 rounded-[2rem] p-8 flex items-start gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gray-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-gray-400/20">
                        <Icon icon="mdi:eye" className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-gray-800 font-black uppercase tracking-widest text-xs mb-1">View Only Mode</h4>
                        <p className="text-gray-600 font-bold text-sm leading-relaxed">
                            This registration is currently <span className="text-amber-600">Pending Finance Approval</span>. You can review the submitted details, but modifications are restricted at this stage.
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        READ ONLY
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-2 md:gap-4 mb-6 md:mb-10 overflow-x-auto no-scrollbar py-2 text-center">
                {steps.map((label, idx) => (
                    <button
                        key={idx}
                        onClick={() => setStep(idx)}
                        className={`px-4 md:px-8 py-2 rounded-full border-2 transition-all min-w-[120px] md:min-w-[160px] font-semibold whitespace-nowrap text-xs md:text-sm
                            ${activeStep === idx
                                ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-md'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-[#F59E0B]/50'
                            }
                        `}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl md:rounded-[40px] shadow-2xl p-4 md:p-12 border border-white/50 relative overflow-hidden">
                <div className="relative z-10">
                    <FormikProvider value={formik}>
                        {renderStep()}
                    </FormikProvider>

                    {/* Footer Actions */}
                    <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 mt-8 md:mt-16 mx-auto ">
                        <Button
                            variant="outlined"
                            onClick={handleSaveDraft}
                            disabled={savingDraft || loadingDraftData || isApprovalMode}
                            className={`w-full md:w-auto ${isApprovalMode ? 'hidden' : ''}`}
                        >
                            {draftCustomerId ? 'Update Draft' : 'Save As Draft'}
                        </Button>

                        {loadingDraftData && (
                            <span className="text-orange-500 text-sm animate-pulse flex items-center">
                                <Icon icon="mdi:loading" className="animate-spin mr-2" />
                                Loading Details...
                            </span>
                        )}

                        {isFinanceUser && isApprovalMode && (
                            <div className="flex gap-4 ">
                                {!isVerificationMode ? (
                                    <Button
                                        variant="outlined"
                                        onClick={() => dispatch(toggleVerificationMode())}
                                        className="nowrap w-full "
                                    >

                                        Send Back To Sales
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outlined"
                                            onClick={() => dispatch(toggleVerificationMode())}
                                        >
                                            Exit Verification
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const fields = Object.keys(rejectedFields).filter(k => rejectedFields[k]);
                                                if (fields.length === 0) {
                                                    toast.warning("Please select at least one field to reject");
                                                    return;
                                                }
                                                // Re-use the existing modal logic but as the final submission
                                                setCorrectionRequest({ fields, remarks: '' });
                                                setIsCorrectionModalOpen(true);
                                            }}
                                            className="bg-red-500 text-white"
                                        >
                                            Submit Rejection
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}

                        <Button
                            variant="contained"
                            onClick={async () => {
                                if (activeStep < steps.length - 1) {
                                    setStep(activeStep + 1);
                                } else {
                                    if (isReadOnlyMode) {
                                        navigate(PATHS.APPROVALS);
                                        return;
                                    }
                                    const errors = await formik.validateForm();
                                    if (Object.keys(errors).length > 0) {
                                        toast.warning('Please fill all required fields correctly before submitting.');
                                        formik.setTouched(
                                            Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                                        );
                                    } else {
                                        formik.handleSubmit();
                                    }
                                }
                            }}
                            disabled={(!isReadOnlyMode && !isStepValid()) || isVerificationMode}
                            className={`w-full md:w-auto ${((!isReadOnlyMode && !isStepValid()) || isVerificationMode) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {activeStep === steps.length - 1
                                ? (isReadOnlyMode ? 'Close' : (isApprovalMode ? 'Approve' : (correctionCustomerId ? 'Resubmit' : ((user?.EmployeeType === 'SUPERADMIN' || isFinanceUser) ? 'Register' : 'Submit For Approval'))))
                                : 'Next'}
                        </Button>
                    </div>
                </div>

                {/* Background decorative circles */}
                {/* <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gray-50 rounded-full opacity-50"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-gray-50 rounded-full opacity-50"></div> */}
            </div>

            <CorrectionRequestModal
                isOpen={isCorrectionModalOpen}
                onClose={() => setIsCorrectionModalOpen(false)}
                onSubmit={handleSendForCorrection}
                customerName={formik.values.shopName}
                initialFields={correctionRequest?.fields || correctionRequest?.fieldsToCorrect || []}
                loading={false}
            />
        </div>
    );
}

const FileUploadField = ({ label, name, placeholder, fileRef, onFileChange, uploading, currentValue, formik, wrapInput, imgFieldName, isReadOnlyMode }) => (
    <div className="flex flex-col gap-4 p-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex flex-col gap-2">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider ml-1">{label}</span>
            {wrapInput(Input, { label: '', name, placeholder, className: "bg-white" })}
        </div>

        <div className="flex flex-col gap-4">
            <input type="file" hidden ref={fileRef} onChange={onFileChange} />
            <Button
                onClick={() => fileRef.current.click()}
                disabled={uploading || isReadOnlyMode}
                className={(uploading || isReadOnlyMode) ? "bg-gray-400 text-white rounded-xl h-[52px] px-6 flex items-center justify-center gap-2 cursor-not-allowed opacity-50" : "bg-[#F59E0B] text-white rounded-xl h-[52px] px-6 flex items-center justify-center gap-2 transition-all hover:bg-[#D97706] shadow-sm font-bold uppercase tracking-tighter text-xs"}
            >
                <Icon icon={uploading ? "mdi:loading" : "mdi:cloud-upload"} className={uploading ? "animate-spin text-xl" : "text-xl"} />
                {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>

            {currentValue && (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-white flex items-center justify-center shadow-inner">
                    <img src={currentValue} alt={label} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <a href={currentValue} target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/30 transition-all scale-90 group-hover:scale-100 duration-300">
                            <Icon icon="mdi:eye" className="text-2xl" />
                        </a>
                        {!isReadOnlyMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (imgFieldName) formik.setFieldValue(imgFieldName, '');
                                }}
                                className="bg-red-500/20 backdrop-blur-md p-3 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/30 transition-all scale-90 group-hover:scale-100 duration-300"
                            >
                                <Icon icon="mdi:trash-can-outline" className="text-2xl" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);

const CustomerInfo = ({ wrapInput, configs, formik, aadharRef, panRef, gstRef, handleFileUpload, uploading, isReadOnlyMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {wrapInput(Input, { label: 'Shop Name*', name: 'shopName', placeholder: 'Enter Shop Name' })}
        {wrapInput(Input, { label: "Owner's Name*", name: 'ownerName', placeholder: "Enter Owner's Name" })}
        {wrapInput(Select, {
            label: 'Customer Type*',
            name: 'CustomerTypeRefId',
            options: configs.customerTypes.map(c => ({ value: c._id, label: c.name }))
        })}
        {wrapInput(Select, {
            label: 'Order Mode*',
            name: 'orderMode',
            options: [{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }]
        })}
        {wrapInput(Input, { label: 'Mobile No. 1*', name: 'mobileNo1', placeholder: 'Enter Mobile No. 1' })}
        {wrapInput(Input, { label: 'Mobile No. 2', name: 'mobileNo2', placeholder: 'Enter Mobile No. 2' })}
        {wrapInput(Input, { label: 'Landline No.', name: 'landlineNo', placeholder: 'Enter Landline No.' })}
        {wrapInput(Input, { label: 'Email ID*', name: 'emailId', placeholder: 'Enter Email ID' })}
        {wrapInput(Input, { label: 'Business Email', name: 'businessEmail', placeholder: 'Enter Business Email' })}

        {/* GST Selection */}
        {wrapInput(Select, {
            label: 'GST For Invoicing*',
            name: 'gstTypeRefId',
            options: (configs.gstTypes || []).map(g => ({ value: g._id, label: g.name })),
            onChange: (e) => {
                const selected = configs.gstTypes.find(g => g._id === e.target.value);
                const prevType = formik.values.gstType?.toLowerCase();
                const nextType = (selected?.name || '').toLowerCase();

                formik.setFieldValue('gstTypeRefId', e.target.value);
                formik.setFieldValue('gstType', selected?.name || '');

                // Reset fields if switching context
                if (prevType !== nextType) {
                    if (nextType === 'unregistered') {
                        formik.setFieldValue('GSTNumber', '');
                        formik.setFieldValue('GSTCertificateImg', '');
                    } else {
                        formik.setFieldValue('AadharCard', '');
                        formik.setFieldValue('AadharCardImg', '');
                        formik.setFieldValue('PANCard', '');
                        formik.setFieldValue('PANCardImg', '');
                    }
                }
            }
        })}
        {/* Scenario: If unregistered show Aadhar and PAN, else show GST */}
        {formik.values.gstType?.toLowerCase() === 'unregistered' ? (
            <>
                <FileUploadField
                    label="Aadhar Card No.*"
                    name="AadharCard"
                    placeholder="Enter Aadhar No."
                    fileRef={aadharRef}
                    onFileChange={(e) => handleFileUpload(e, 'AadharCardImg', 'aadhar')}
                    uploading={uploading.aadhar}
                    currentValue={formik.values.AadharCardImg}
                    formik={formik}
                    wrapInput={wrapInput}
                    imgFieldName="AadharCardImg"
                    isReadOnlyMode={isReadOnlyMode}
                />
                <FileUploadField
                    label="PAN Card No.*"
                    name="PANCard"
                    placeholder="Enter PAN No."
                    fileRef={panRef}
                    onFileChange={(e) => handleFileUpload(e, 'PANCardImg', 'pan')}
                    uploading={uploading.pan}
                    currentValue={formik.values.PANCardImg}
                    formik={formik}
                    wrapInput={wrapInput}
                    imgFieldName="PANCardImg"
                    isReadOnlyMode={isReadOnlyMode}
                />
            </>
        ) : <FileUploadField
            label="GST Number*"
            name="GSTNumber"
            placeholder="Enter GST No."
            fileRef={gstRef}
            onFileChange={(e) => handleFileUpload(e, 'GSTCertificateImg', 'gst')}
            uploading={uploading.gst}
            currentValue={formik.values.GSTCertificateImg}
            formik={formik}
            wrapInput={wrapInput}
            imgFieldName="GSTCertificateImg"
            isReadOnlyMode={isReadOnlyMode}
        />}
    </div>
);

const AddressDetails = ({ formik, wrapInput, configs, isVerificationMode, rejectedFields, dispatch, isReadOnlyMode }) => {
    useEffect(() => {
        if (!isReadOnlyMode && formik.values.address.length === 1) {
            const firstAddr = formik.values.address[0];
            if (!firstAddr.contactPerson && !firstAddr.contactNumber) {
                formik.setFieldValue('address[0].contactPerson', formik.values.ownerName || '');
                formik.setFieldValue('address[0].contactNumber', formik.values.mobileNo1 || '');
            }
        }
    }, [isReadOnlyMode, formik.values.ownerName, formik.values.mobileNo1]);

    return (
        <div className="space-y-12">
            <FieldArray name="address">
                {({ push, remove }) => (
                    <div className="space-y-12">
                        {formik.values.address.map((addr, index) => (
                            <div key={index} className="relative pt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[#F59E0B] font-bold">Address {index + 1}*</h3>
                                    {index > 0 && !isReadOnlyMode && <button onClick={() => remove(index)} className="text-red-500 text-sm font-bold flex items-center gap-1"><Icon icon="mdi:delete" /> Remove</button>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {wrapInput(Input, {
                                        label: "Branch Address*",
                                        name: `address[${index}].branchAddress`,
                                        value: addr.branchAddress,
                                        placeholder: "Enter Branch Address"
                                    })}
                                    {wrapInput(Input, {
                                        label: "Contact Person Name*",
                                        name: `address[${index}].contactPerson`,
                                        value: addr.contactPerson,
                                        placeholder: "Enter Contact Person"
                                    })}
                                    {wrapInput(Input, {
                                        label: "Contact Number*",
                                        name: `address[${index}].contactNumber`,
                                        value: addr.contactNumber,
                                        placeholder: "Enter Contact Number"
                                    })}
                                    {wrapInput(Input, {
                                        label: "City*",
                                        name: `address[${index}].city`,
                                        value: addr.city,
                                        placeholder: "Enter City"
                                    })}
                                    {wrapInput(Select, {
                                        label: "State*",
                                        name: `address[${index}].state`,
                                        value: addr.state,
                                        options: (Array.isArray(configs.states) ? configs.states : []).map(z => ({ value: z.name, label: z.name }))
                                    })}
                                    {wrapInput(Select, {
                                        label: "Country*",
                                        name: `address[${index}].country`,
                                        value: addr.country,
                                        options: [{ value: 'India', label: 'India' }]
                                    })}
                                    {wrapInput(Select, {
                                        label: "Billing Currency*",
                                        name: `address[${index}].billingCurrency`,
                                        value: addr.billingCurrency,
                                        options: [{ value: 'Indian Rupees', label: 'Indian Rupees' }]
                                    })}
                                    {wrapInput(Select, {
                                        label: "Billing Mode*",
                                        name: `address[${index}].billingMode`,
                                        value: addr.billingMode,
                                        options: [{ value: 'Credit', label: 'Credit' }, { value: 'Advance', label: 'Advance' }]
                                    })}
                                    {wrapInput(Input, {
                                        label: "Pincode*",
                                        name: `address[${index}].zipCode`,
                                        value: addr.zipCode,
                                        placeholder: "Enter Pincode"
                                    })}
                                </div>
                            </div>
                        ))}
                        {!isReadOnlyMode && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    variant="outlined"
                                    onClick={() => push({
                                        branchAddress: '',
                                        contactPerson: formik.values.ownerName || '',
                                        contactNumber: formik.values.mobileNo1 || '',
                                        city: '',
                                        state: '',
                                        country: 'India',
                                        billingCurrency: 'Indian Rupees',
                                        billingMode: 'Credit',
                                        zipCode: ''
                                    })}
                                    className="bg-[#F59E0B] text-white rounded-full px-10 py-3 flex items-center gap-2 w-fit hover:text-black hover:bg-[#D97706]"
                                >
                                    <Icon icon="mdi:plus" /> Add Address
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </FieldArray>
        </div>
    );
};

const BrandRow = ({ index, bc, remove, configs, formik, wrapInput, isReadOnlyMode }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            if (bc.brandId) {
                setLoading(true);
                try {
                    const data = await getBrandCategories(bc.brandId);
                    // The API returns { data: { categories: [...] } } or just the array depending on the helper
                    // getBrandCategories looks like it returns response.data?.data || [] but our previous fetch logic showed categories nested.
                    // Let's check getBrandCategories implementation again.
                    setCategories(Array.isArray(data) ? data : data.categories || []);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setCategories([]);
            }
        };
        fetchCats();
    }, [bc.brandId]);



    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
            {!isReadOnlyMode && (
                <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"
                >
                    <Icon icon="mdi:close" className="text-lg" />
                </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wrapInput(Select, {
                    label: "Select Brand*",
                    name: `brandCategories[${index}].brandId`,
                    value: bc.brandId,
                    options: (configs.brands || []).map(b => ({ value: b._id, label: b.name })),
                    onChange: (e) => {
                        const brand = configs.brands.find(b => b._id === e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandId`, e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandName`, brand?.name || '');
                        formik.setFieldValue(`brandCategories[${index}].categories`, []); // Reset categories
                    }
                })}

                {wrapInput(Select, {
                    label: "Select Categories*",
                    name: `brandCategories[${index}].categories`,
                    multiple: true,
                    placeholder: "Select Categories",
                    disabled: !bc.brandId || loading,
                    value: (bc.categories || []).map(c => c.categoryId),
                    options: categories.map(c => ({ value: c._id, label: c.name })),
                    onChange: (e) => {
                        const selectedIds = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                        const updatedCats = selectedIds.map(id => ({
                            categoryId: id,
                            categoryName: categories.find(cat => cat._id === id)?.name || ''
                        }));
                        formik.setFieldValue(`brandCategories[${index}].categories`, updatedCats);
                    }
                })}
                {loading && <span className="text-[10px] text-orange-500 animate-pulse">Loading categories...</span>}
            </div>
        </div>
    );
};

const CustomerRegn = ({ wrapInput, configs, formValues, formik, dispatch, isReadOnlyMode }) => {
    const noVerifyWrap = (Component, props) => wrapInput(Component, props, true);

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <Input
                    label="Login Email (Prefilled)"
                    name="emailId"
                    value={formik.values.emailId}
                    disabled
                    className="bg-gray-50"
                />
                {noVerifyWrap(Input, { label: 'Password*', name: 'customerpassword', type: 'password', placeholder: 'Enter Password' })}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <Icon icon="mdi:tag-multiple" className="text-[#F59E0B]" /> Brand & Category Selection*
                    </h3>
                </div>

                <FieldArray name="brandCategories">
                    {({ push, remove }) => (
                        <div className="space-y-4">
                            {formik.values.brandCategories.map((bc, index) => (
                                <BrandRow
                                    key={index}
                                    index={index}
                                    bc={bc}
                                    remove={remove}
                                    configs={configs}
                                    formik={formik}
                                    wrapInput={wrapInput}
                                    isReadOnlyMode={isReadOnlyMode}
                                />
                            ))}
                            {!isReadOnlyMode && (
                                <Button
                                    variant="outlined"
                                    onClick={() => push({ brandId: '', brandName: '', categories: [] })}
                                    className="bg-gray-50 border-dashed border-2 border-gray-200 text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B] w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    <Icon icon="mdi:plus-circle" /> Add Another Brand
                                </Button>
                            )}
                        </div>
                    )}
                </FieldArray>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {noVerifyWrap(Select, {
                    label: 'Zone*',
                    name: 'zoneRefId',
                    options: (Array.isArray(configs.zones) ? configs.zones : []).map(z => ({ value: z._id, label: z.zone }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Select Sales Person*',
                    name: 'salesPersonRefId',
                    options: (configs.salesPersons || []).map(s => ({ value: s._id, label: s.employeeName }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Specific Lab*',
                    name: 'specificLabRefId',
                    options: (configs.specificLabs || []).map(l => ({ value: l._id, label: l.name }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Fitting Centre*',
                    name: 'fittingCenterRefId',
                    options: (configs.fittingCenters || []).map(f => ({ value: f._id, label: f.name }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Plant*',
                    name: 'plantRefId',
                    options: (configs.plants || []).map(p => ({ value: p._id, label: p.name }))
                })}
                {noVerifyWrap(Input, { label: 'Credit Limit*', name: 'creditLimit', placeholder: 'Enter Limit' })}
                {noVerifyWrap(Select, {
                    label: 'Credit Days*',
                    name: 'creditDaysRefId',
                    options: (configs.creditDays || []).map(d => ({ value: d._id, label: d.days.toString() }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Courier Name*',
                    name: 'courierNameRefId',
                    options: (configs.courierNames || []).map(n => ({ value: n._id, label: n.name }))
                })}
                {noVerifyWrap(Select, {
                    label: 'Courier Time*',
                    name: 'courierTimeRefId',
                    options: (configs.courierTimes || []).map(t => ({ value: t._id, label: t.time }))
                })}
            </div>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{label}</span>
        <span className="text-gray-700 font-semibold">{value || '---'}</span>
    </div>
);

const SummaryCard = ({ title, icon, color = "#F59E0B", children }) => (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4 md:mb-8">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                <Icon icon={icon} className="text-lg md:text-xl" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm md:text-base lg:text-lg uppercase tracking-tight">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
            {children}
        </div>
    </div>
);

const DocPreview = ({ label, src }) => (
    <div className="flex flex-col gap-2">
        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{label}</span>
        {src ? (
            <div className="relative group overflow-hidden rounded-2xl border border-gray-100 aspect-video bg-gray-50 flex items-center justify-center">
                <img
                    src={src}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={src} target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white">
                        <Icon icon="mdi:eye" className="text-xl" />
                    </a>
                </div>
            </div>
        ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 aspect-video bg-gray-50/50 flex flex-col items-center justify-center text-gray-300">
                <Icon icon="mdi:image-off" className="text-2xl mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">No Document</span>
            </div>
        )}
    </div>
);

const Overview = ({ formik, configs = {}, isSalesUser }) => {
    const { values } = formik;

    return (
        <div className="space-y-6 md:space-y-8 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
            <h2 className="text-xl md:text-2xl font-black text-[#F59E0B] mb-4 md:mb-8 flex items-center gap-3">
                <Icon icon="mdi:file-find-outline" /> Review Application
            </h2>

            <SummaryCard title="Basic Info" icon="mdi:account-circle">
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <DetailItem label="Shop Name" value={values.shopName} />
                    <DetailItem label="Owner's Name" value={values.ownerName} />
                    <DetailItem label="Mobile 1" value={values.mobileNo1} />
                    <DetailItem label="Mobile 2" value={values.mobileNo2} />
                    <DetailItem label="Landline" value={values.landlineNo} />
                    {!isSalesUser && <DetailItem label="Email ID" value={values.emailId} />}
                    <DetailItem label="GST Type" value={values.gstType} />
                    {(values.gstType === 'Regular' || values.gstType === 'Composition') && <DetailItem label="GST Number" value={values.GSTNumber} />}
                </div>

                <div className="col-span-full border-t border-gray-50 pt-4 md:pt-6 mt-2">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Identity Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                        {(values.gstType === 'Regular' || values.gstType === 'Composition') ? (
                            <DocPreview label="GST Document" src={values.GSTCertificateImg} />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <DetailItem label="Aadhar No." value={values.AadharCard} />
                                    <DocPreview label="Aadhar Card" src={values.AadharCardImg} />
                                </div>
                                <div className="space-y-4">
                                    <DetailItem label="PAN No." value={values.PANCard} />
                                    <DocPreview label="PAN Card" src={values.PANCardImg} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SummaryCard>

            <div className="space-y-6">
                {values.address.map((addr, idx) => (
                    <SummaryCard key={idx} title={`Address ${idx + 1} `} icon="mdi:map-marker">
                        <DetailItem label="Branch Address" value={addr.branchAddress} />
                        <DetailItem label="Contact Person" value={addr.contactPerson} />
                        <DetailItem label="Contact No." value={addr.contactNumber} />
                        <DetailItem label="City" value={addr.city} />
                        <DetailItem label="State" value={addr.state} />
                        <DetailItem label="Currency" value={addr.billingCurrency} />
                        <DetailItem label="Mode" value={addr.billingMode} />
                        <DetailItem label="Pincode" value={addr.zipCode} />
                    </SummaryCard>
                ))}
            </div>

            {!isSalesUser && (
                <SummaryCard title="Registration Details" icon="mdi:cog">
                    <DetailItem label="Zone" value={configs.zones.find(z => z._id === values.zoneRefId)?.zone} />
                    <DetailItem label="Sales Person" value={configs.salesPersons.find(s => s._id === values.salesPersonRefId)?.employeeName} />
                    <DetailItem label="Specific Lab" value={configs.specificLabs.find(l => l._id === values.specificLabRefId)?.name} />
                    <DetailItem label="Plant" value={configs.plants.find(p => p._id === values.plantRefId)?.name} />
                    <DetailItem label="Fitting Centre" value={configs.fittingCenters.find(f => f._id === values.fittingCenterRefId)?.name} />
                    <DetailItem label="Credit Limit" value={values.creditLimit} />
                    <DetailItem label="Credit Days" value={configs.creditDays.find(d => d._id === values.creditDaysRefId)?.days} />
                    <DetailItem label="Courier Name" value={configs.courierNames.find(c => c._id === values.courierNameRefId)?.name} />
                    <DetailItem label="Courier Time" value={configs.courierTimes.find(t => t._id === values.courierTimeRefId)?.time} />
                </SummaryCard>
            )}

            {!isSalesUser && (
                <SummaryCard title="Selected Brands & Categories" icon="mdi:tag-multiple">
                    <div className="col-span-full space-y-4">
                        {values.brandCategories.map((bc, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">{bc.brandName || 'Unknown Brand'}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(bc.categories || []).map((cat, cIdx) => (
                                        <span key={cIdx} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                                            {cat.categoryName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SummaryCard>
            )}
        </div>
    );
};
