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
    getDraftCustomerById
} from '../services/customerService';
import { uploadImage } from '../services/bucketService';
import { PATHS } from '../routes/paths';

const steps = ['Customer Info', 'Address Details', 'Customer Regn', 'Overview'];

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

// Defined OUTSIDE the component so it's never recreated on render
const validationSchema = Yup.object().shape({
    shopName: Yup.string().required('Shop Name is required'),
    ownerName: Yup.string().required('Owner Name is required'),
    CustomerTypeRefId: Yup.string().required('Customer Type is required'),
    mobileNo1: Yup.string().matches(/^\d{10}$/, 'Mobile No. must be 10 digits').required('Mobile No. 1 is required'),
    emailId: Yup.string().email('Invalid email').required('Email ID is required'),
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
    customerpassword: Yup.string().required('Password is required'),
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
    brandCategories: Yup.array().of(
        Yup.object().shape({
            brandId: Yup.string().required('Brand is required'),
            categories: Yup.array().of(
                Yup.object().shape({
                    categoryId: Yup.string().required('Category is required')
                })
            ).min(1, 'At least one category is required')
        })
    ).min(1, 'At least one brand is required')
});

export default function RegisterCustomer() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get active step from URL, default to 0
    const activeStep = useMemo(() => {
        const step = parseInt(searchParams.get('step'));
        return isNaN(step) ? 0 : Math.min(Math.max(0, step), steps.length - 1);
    }, [searchParams]);

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
        validateOnChange: false, // Validate only on blur/submit, not every keystroke
        validateOnBlur: true,
        onSubmit: async (values) => {
            const getLabel = (list, id, labelKey = 'name') => {
                const item = list.find(item => item._id === id);
                if (!item) return '';
                return item[labelKey] || item;
            };

            const payload = {
                ...values,
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

            try {
                await toast.promise(
                    registerCustomer(payload),
                    {
                        pending: 'Registering customer...',
                        success: 'Customer registered successfully! 👌',
                    }
                );
                navigate(PATHS.WELCOME, { state: { from: 'customer-register' } });
            } catch (error) {
                console.error('Registration error:', error);
                toast.error(error.error?.message || error.error.message || "Registration failed. Please try again. 🤯");
            }
        }
    });

    const loadDraftDataById = useCallback(async (draftId) => {
        setLoadingDraftData(true);
        try {
            const response = await getDraftCustomerById(draftId);
            const draft = response.data || response;

            const draftData = draft.data || draft;
            const formValues = {
                ...INITIAL_FORM_VALUES,
                ...draftData,
                address: draftData.address?.length ? draftData.address : INITIAL_FORM_VALUES.address,
                brandCategories: draftData.brandCategories?.length ? draftData.brandCategories : INITIAL_FORM_VALUES.brandCategories,
            };

            formik.setValues(formValues, false);
            toast.success('Draft loaded successfully');
        } catch (error) {
            console.error('Error loading draft data:', error);
            toast.error('Failed to load draft data');
        } finally {
            setLoadingDraftData(false);
        }
    }, [formik.setValues]);

    useEffect(() => {
        const draftId = searchParams.get('draftId');
        if (draftId) {
            loadDraftDataById(draftId);
        }
    }, [searchParams, loadDraftDataById]);

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

            await toast.promise(
                draftRegisterCustomer(draftPayload),
                {
                    pending: 'Saving draft...',
                    success: 'Draft saved successfully! 👌',
                }
            );
        } catch (error) {
            console.error('Draft save error:', error);
            toast.error(error.error?.message || error.message || "Failed to save draft.");
        } finally {
            setSavingDraft(false);
        }
    }, [formik.values, configs]);


    const [brandCategories, setBrandCategories] = useState([]); // This state is actually unused now but keeping for props compatibility if needed, or remove completely if prop is removed.
    // Actually, looking at the renderStep, brandCategories is passed to CustomerRegn.
    // But CustomerRegn doesn't use it anymore as BrandRow fetches its own.
    // Let's remove it from both.



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


    const wrapInput = (Component, props) => {
        const { onChange: customOnChange, ...rest } = props;
        return (
            <Component
                {...rest}
                isVerificationMode={isVerificationMode}
                isRejected={rejectedFields[props.name]}
                onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                error={formik.touched[props.name] && formik.errors[props.name] ? { message: formik.errors[props.name] } : null}
                onChange={(e) => {
                    if (customOnChange) customOnChange(e);
                    else formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                value={formik.values[props.name] ?? ''}
            />
        );
    };

    const isStepValid = () => {
        const { values, errors } = formik;

        switch (activeStep) {
            case 0: // Basic Info
                const basicFields = ['shopName', 'ownerName', 'CustomerTypeRefId', 'orderMode', 'mobileNo1', 'emailId', 'gstType'];
                const hasBasicFields = basicFields.every(field => !!values[field]);
                const basicErrors = basicFields.some(field => !!errors[field]);

                if (!hasBasicFields || basicErrors) return false;

                // Conditional identity docs
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

            case 2: // Customer Regn
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

            case 3: // Overview
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
                />
            );
            case 1: return <AddressDetails formik={formik} configs={configs} isVerificationMode={isVerificationMode} rejectedFields={rejectedFields} dispatch={dispatch} />;
            case 2: return <CustomerRegn wrapInput={wrapInput} configs={configs} formValues={formik.values} formik={formik} dispatch={dispatch} />;
            case 3: return <Overview formik={formik} configs={configs} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen  p-6">
            {/* Header Area */}


            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 mb-10 overflow-x-auto no-scrollbar py-2 text-center">
                {steps.map((label, idx) => (
                    <button
                        key={idx}
                        onClick={() => setStep(idx)}
                        className={`px-8 py-2 rounded-full border-2 transition-all min-w-[160px] font-semibold whitespace-nowrap
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
            <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-[40px] shadow-2xl p-12 border border-white/50 relative overflow-hidden">
                <div className="relative z-10">
                    <FormikProvider value={formik}>
                        {renderStep()}
                    </FormikProvider>

                    {/* Footer Actions */}
                    <div className="flex justify-center  gap-6 mt-16">
                        <Button
                            variant="outlined"
                            onClick={handleSaveDraft}
                            disabled={savingDraft || loadingDraftData}
                            className="  "
                        >
                            {savingDraft ? 'Saving...' : 'Save As Draft'}
                        </Button>
                        {loadingDraftData && (
                            <span className="text-orange-500 text-sm animate-pulse">Loading draft...</span>
                        )}

                        {!isVerificationMode ? (
                            <Button
                                variant="outlined"
                                onClick={() => dispatch(toggleVerificationMode())}
                                className="  "
                            >
                                Send Back To Sales
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => dispatch(toggleVerificationMode())}
                                    className="   "
                                >
                                    Exit Verification
                                </Button>
                                <Button
                                    onClick={() => {
                                        toast.info("Sending rejections back to sales...");
                                        // Specific logic for sending rejections would go here
                                    }}
                                    className="bg-red-500 text-white"
                                >
                                    Send Back
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={async () => {
                                if (activeStep < 3) {
                                    setStep(activeStep + 1);
                                } else {
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
                            disabled={!isStepValid()}
                            className={!isStepValid() ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            {activeStep === 3 ? 'Register' : 'Next'}
                        </Button>
                    </div>
                </div>

                {/* Background decorative circles */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gray-50 rounded-full opacity-50"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-gray-50 rounded-full opacity-50"></div>
            </div>
        </div>
    );
}

const FileUploadField = ({ label, name, placeholder, fileRef, onFileChange, uploading, currentValue, formik, wrapInput, imgFieldName }) => (
    <div className="flex flex-col gap-4 p-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex flex-col gap-2">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider ml-1">{label}</span>
            {wrapInput(Input, { label: '', name, placeholder, className: "bg-white" })}
        </div>

        <div className="flex flex-col gap-4">
            <input type="file" hidden ref={fileRef} onChange={onFileChange} />
            <Button
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                className="bg-[#F59E0B] text-white rounded-xl h-[52px] px-6 flex items-center justify-center gap-2 transition-all hover:bg-[#D97706] shadow-sm font-bold uppercase tracking-tighter text-xs"
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
                        <button
                            type="button"
                            onClick={() => {
                                if (imgFieldName) formik.setFieldValue(imgFieldName, '');
                            }}
                            className="bg-red-500/20 backdrop-blur-md p-3 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/30 transition-all scale-90 group-hover:scale-100 duration-300"
                        >
                            <Icon icon="mdi:trash-can-outline" className="text-2xl" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const CustomerInfo = ({ wrapInput, configs, formik, aadharRef, panRef, gstRef, handleFileUpload, uploading }) => (
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
        />}
    </div>
);

const AddressDetails = ({ formik, configs, isVerificationMode, rejectedFields, dispatch }) => (
    <div className="space-y-12">


        <FieldArray name="address">
            {({ push, remove }) => (
                <div className="space-y-12">
                    {formik.values.address.map((addr, index) => (
                        <div key={index} className="relative pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[#F59E0B] font-bold">Address {index + 1}*</h3>
                                {index > 0 && <button onClick={() => remove(index)} className="text-red-500 text-sm font-bold flex items-center gap-1"><Icon icon="mdi:delete" /> Remove</button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <Input
                                    label="Branch Address*"
                                    name={`address.${index}.branchAddress`}
                                    value={addr.branchAddress}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.branchAddress`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    error={formik.touched.address?.[index]?.branchAddress && formik.errors.address?.[index]?.branchAddress ? { message: formik.errors.address[index].branchAddress } : null}
                                />
                                <Input
                                    label="Contact Person Name*"
                                    name={`address.${index}.contactPerson`}
                                    value={addr.contactPerson}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.contactPerson`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                />
                                <Input
                                    label="Contact Number*"
                                    name={`address.${index}.contactNumber`}
                                    value={addr.contactNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.contactNumber`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    error={formik.touched.address?.[index]?.contactNumber && formik.errors.address?.[index]?.contactNumber ? { message: formik.errors.address[index].contactNumber } : null}
                                />
                                <Input
                                    label="City*"
                                    name={`address.${index}.city`}
                                    value={addr.city}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.city`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    error={formik.touched.address?.[index]?.city && formik.errors.address?.[index]?.city ? { message: formik.errors.address[index].city } : null}
                                />
                                <Select
                                    label="State*"
                                    name={`address.${index}.state`}
                                    value={addr.state}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.state`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    options={(Array.isArray(configs.states) ? configs.states : []).map(z => ({ value: z.name, label: z.name }))}
                                    error={formik.touched.address?.[index]?.state && formik.errors.address?.[index]?.state ? { message: formik.errors.address[index].state } : null}
                                />
                                <Select
                                    label="Country*"
                                    name={`address.${index}.country`}
                                    value={addr.country}
                                    onChange={formik.handleChange}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.country`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    options={[{ value: 'India', label: 'India' }]}
                                />
                                <Select
                                    label="Billing Currency*"
                                    name={`address.${index}.billingCurrency`}
                                    value={addr.billingCurrency}
                                    onChange={formik.handleChange}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.billingCurrency`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    options={[{ value: 'Indian Rupees', label: 'Indian Rupees' }]}
                                />
                                <Select
                                    label="Billing Mode*"
                                    name={`address.${index}.billingMode`}
                                    value={addr.billingMode}
                                    onChange={formik.handleChange}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.billingMode`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    options={[{ value: 'Credit', label: 'Credit' }, { value: 'Advance', label: 'Advance' }]}
                                />
                                <Input
                                    label="Pincode*"
                                    name={`address.${index}.zipCode`}
                                    value={addr.zipCode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    isVerificationMode={isVerificationMode}
                                    isRejected={rejectedFields[`address.${index}.zipCode`]}
                                    onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                    error={formik.touched.address?.[index]?.zipCode && formik.errors.address?.[index]?.zipCode ? { message: formik.errors.address[index].zipCode } : null}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center mt-4">
                        <Button
                            variant="outlined"
                            onClick={() => push({ branchAddress: '', contactPerson: '', contactNumber: '', city: '', state: '', country: 'India', billingCurrency: 'Indian Rupees', billingMode: 'Credit', zipCode: '' })}
                            className="bg-[#F59E0B] text-white rounded-full px-10 py-3 flex items-center gap-2 w-fit hover:text-black hover:bg-[#D97706]"
                        >
                            <Icon icon="mdi:plus" /> Add Address
                        </Button>
                    </div>
                </div>
            )}
        </FieldArray>
    </div>
);

const BrandRow = ({ index, bc, remove, configs, formik, wrapInput }) => {
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
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"
            >
                <Icon icon="mdi:close" className="text-lg" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Select Brand*"
                    name={`brandCategories.${index}.brandId`}
                    value={bc.brandId}
                    onChange={(e) => {
                        const brand = configs.brands.find(b => b._id === e.target.value);
                        formik.setFieldValue(`brandCategories.${index}.brandId`, e.target.value);
                        formik.setFieldValue(`brandCategories.${index}.brandName`, brand?.name || '');
                        formik.setFieldValue(`brandCategories.${index}.categories`, []); // Reset categories
                    }}
                    options={(configs.brands || []).map(b => ({ value: b._id, label: b.name }))}
                />

                <Select
                    label="Select Categories*"
                    multiple
                    disabled={!bc.brandId || loading}
                    value={(bc.categories || []).map(c => c.categoryId)}
                    onChange={(e) => {
                        const selectedIds = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                        const updatedCats = selectedIds.map(id => ({
                            categoryId: id,
                            categoryName: categories.find(cat => cat._id === id)?.name || ''
                        }));
                        formik.setFieldValue(`brandCategories.${index}.categories`, updatedCats);
                    }}
                    options={categories.map(c => ({ value: c._id, label: c.name }))}
                />
                {loading && <span className="text-[10px] text-orange-500 animate-pulse">Loading categories...</span>}
            </div>
        </div>
    );
};

const CustomerRegn = ({ wrapInput, configs, formValues, formik, dispatch }) => (
    <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <Input
                label="Login Email (Prefilled)"
                name="emailId"
                value={formik.values.emailId}
                disabled
                className="bg-gray-50"
            />
            {wrapInput(Input, { label: 'Password*', name: 'customerpassword', type: 'password', placeholder: 'Enter Password' })}
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
                            />
                        ))}
                        <Button
                            variant="outlined"
                            onClick={() => push({ brandId: '', brandName: '', categories: [] })}
                            className="bg-gray-50 border-dashed border-2 border-gray-200 text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B] w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:plus-circle" /> Add Another Brand
                        </Button>
                    </div>
                )}
            </FieldArray>
        </div>

        {/* <div className="flex justify-center py-4">
            <button
                type="button"
                onClick={() => {
                    const regFields = ['customerpassword', 'zoneRefId', 'salesPersonRefId', 'specificLabRefId', 'plantRefId', 'fittingCenterRefId', 'creditLimit', 'creditDaysRefId', 'courierNameRefId', 'courierTimeRefId'];
                    const hasRegFields = regFields.every(field => !!formik.values[field]);
                    const hasBrands = formik.values.brandCategories && formik.values.brandCategories.length > 0;

                    if (hasRegFields && hasBrands) {
                        setSearchParams({ step: 3 });
                    } else {
                        toast.error('Please fill all required fields and selection before proceeding.');
                    }
                }}
                className="px-10 py-3 rounded-full border-2 border-[#F59E0B] text-[#F59E0B] font-bold uppercase tracking-wide hover:bg-[#F59E0B] hover:text-white transition-all shadow-md active:scale-95"
            >
                Create DigiOptics Account
            </button>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {wrapInput(Select, {
                label: 'Zone*',
                name: 'zoneRefId',
                options: (Array.isArray(configs.zones) ? configs.zones : []).map(z => ({ value: z._id, label: z.zone }))
            })}
            {wrapInput(Select, {
                label: 'Select Sales Person*',
                name: 'salesPersonRefId',
                options: (configs.salesPersons || []).map(s => ({ value: s._id, label: s.employeeName }))
            })}
            {wrapInput(Select, {
                label: 'Specific Lab*',
                name: 'specificLabRefId',
                options: (configs.specificLabs || []).map(l => ({ value: l._id, label: l.name }))
            })}
            {wrapInput(Select, {
                label: 'Fitting Centre*',
                name: 'fittingCenterRefId',
                options: (configs.fittingCenters || []).map(f => ({ value: f._id, label: f.name }))
            })}
            {wrapInput(Select, {
                label: 'Plant*',
                name: 'plantRefId',
                options: (configs.plants || []).map(p => ({ value: p._id, label: p.name }))
            })}
            {wrapInput(Input, { label: 'Credit Limit*', name: 'creditLimit', placeholder: 'Enter Limit' })}
            {wrapInput(Select, {
                label: 'Credit Days*',
                name: 'creditDaysRefId',
                options: (configs.creditDays || []).map(d => ({ value: d._id, label: d.days.toString() }))
            })}
            {wrapInput(Select, {
                label: 'Courier Name*',
                name: 'courierNameRefId',
                options: (configs.courierNames || []).map(n => ({ value: n._id, label: n.name }))
            })}
            {wrapInput(Select, {
                label: 'Courier Time*',
                name: 'courierTimeRefId',
                options: (configs.courierTimes || []).map(t => ({ value: t._id, label: t.time }))
            })}
        </div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{label}</span>
        <span className="text-gray-700 font-semibold">{value || '---'}</span>
    </div>
);

const SummaryCard = ({ title, icon, color = "#F59E0B", children }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                <Icon icon={icon} className="text-xl" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
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

const Overview = ({ formik, configs = {} }) => {
    const { values } = formik;

    return (
        <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            <h2 className="text-2xl font-black text-[#F59E0B] mb-8 flex items-center gap-3">
                <Icon icon="mdi:file-find-outline" /> Review Application
            </h2>

            <SummaryCard title="Basic Info" icon="mdi:account-circle">
                <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                    <DetailItem label="Shop Name" value={values.shopName} />
                    <DetailItem label="Owner's Name" value={values.ownerName} />
                    <DetailItem label="Mobile 1" value={values.mobileNo1} />
                    <DetailItem label="Mobile 2" value={values.mobileNo2} />
                    <DetailItem label="Landline" value={values.landlineNo} />
                    <DetailItem label="Email ID" value={values.emailId} />
                    <DetailItem label="GST Type" value={values.gstType} />
                    {(values.gstType === 'Regular' || values.gstType === 'Composition') && <DetailItem label="GST Number" value={values.GSTNumber} />}
                </div>

                <div className="col-span-full border-t border-gray-50 pt-6 mt-2">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Identity Documents</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
        </div>
    );
};
