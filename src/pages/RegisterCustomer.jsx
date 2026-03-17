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

import { INITIAL_FORM_VALUES } from '../components/CustomerRegistration/constants';
import { mapCustomerToFormValues } from '../components/CustomerRegistration/helpers';
import { CustomerInfo } from '../components/CustomerRegistration/CustomerInfo';
import { AddressDetails } from '../components/CustomerRegistration/AddressDetails';
import { CustomerRegn } from '../components/CustomerRegistration/CustomerRegn';
import { Overview } from '../components/CustomerRegistration/Overview';

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
        gstTypes: [],
        plants: [],
        fittingCenters: []
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

    const isStepValid = (stepIdx = activeStep) => {
        const { values, errors } = formik;

        switch (stepIdx) {
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

    const renderStepContent = (stepIdx) => {
        switch (stepIdx) {
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

            {/* Main Content Card with Accordion */}
            <div className="max-w-6xl mx-auto">
                <div className="space-y-6">
                    <FormikProvider value={formik}>
                        {steps.map((label, idx) => {
                            const isActive = activeStep === idx;
                            const isCompleted = idx < activeStep;

                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-[2rem] border transition-all duration-300 ${isActive ? 'shadow-2xl ring-1 ring-orange-100 border-orange-200' : 'shadow-sm border-gray-100'}`}
                                >
                                    {/* Accordion Header */}
                                    <button
                                        type="button"
                                        onClick={() => setStep(idx)}
                                        className="w-full flex items-center justify-between p-6 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                                                ? 'bg-orange-500 text-white shadow-lg rotate-12 scale-110'
                                                : isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-400 group-hover:bg-orange-50'
                                                }`}>
                                                {isCompleted ? <Icon icon="mdi:check" className="text-xl" /> : <span className="font-black italic text-lg">{idx + 1}</span>}
                                            </div>
                                            <div className="text-left">
                                                <h3 className={`font-black uppercase tracking-widest text-sm transition-colors ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>
                                                    {label}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {isActive ? 'Currently Editing' : isCompleted ? 'Verification Complete' : 'Pending Details'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-orange-50 rotate-180' : 'bg-gray-50'}`}>
                                            <Icon icon="mdi:chevron-down" className={`text-xl ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                                        </div>
                                    </button>

                                    {/* Accordion Content */}
                                    {isActive && (
                                        <div className="p-8 md:p-12 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-12" />
                                            {renderStepContent(idx)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </FormikProvider>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 mt-12 mx-auto ">
                    <Button
                        variant="outlined"
                        onClick={handleSaveDraft}
                        disabled={savingDraft || loadingDraftData || isApprovalMode}
                        className={`w-full md:w-auto ${isApprovalMode ? 'hidden' : ''}`}
                    >
                        {draftCustomerId ? 'Update Draft' : 'Save As Draft'}
                    </Button>

                    {loadingDraftData && (
                        <div className="flex items-center">
                            <span className="text-orange-500 text-sm animate-pulse flex items-center">
                                <Icon icon="mdi:loading" className="animate-spin mr-2" />
                                Loading Details...
                            </span>
                        </div>
                    )}

                    {isFinanceUser && isApprovalMode && (
                        <div className="flex gap-4">
                            {!isVerificationMode ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => dispatch(toggleVerificationMode())}
                                    className="nowrap w-full"
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


