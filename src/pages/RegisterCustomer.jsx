import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
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
import {
    getCustomerConfigs,
    getAllRegions,
    getAllZones,
    getBrandCategories,
    registerCustomer
} from '../services/customerService';
import { uploadImage } from '../services/bucketService';

const steps = ['Customer Info', 'Address Details', 'Customer Regn', 'Overview'];

const INITIAL_FORM_VALUES = {
    shopName: '',
    ownerName: '',
    CustomerTypeRefId: '',
    orderMode: '',
    mobileNo1: '',
    mobileNo2: '',
    landlineNo: '',
    loginEmail: '',
    businessEmail: '',
    gstType: 'Unregistered',
    gstNo: '',
    gstDoc: '',
    AadharCard: '',
    PANCard: '',
    address: [
        { address1: '', contactPerson: '', contactNumber: '', city: '', state: '', country: 'India', billingCurrency: 'INR', billingMode: 'CREDIT' }
    ],
    username: '',
    password: '',
    zoneRefId: '',
    hasFlatFitting: 'No',
    flatFittingEntries: [
        { type: '', index: '', price: '' }
    ],
    specificBrandRefId: '',
    specificCategoryRefId: '',
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
    mobileNo1: Yup.string().required('Mobile No. 1 is required'),
    loginEmail: Yup.string().email('Invalid email').required('Login Email is required'),
    gstType: Yup.string().required('GST Type is required'),
    gstNo: Yup.string().when('gstType', {
        is: 'Number',
        then: (schema) => schema.required('GST Number is required'),
        otherwise: (schema) => schema.notRequired()
    }),
    address: Yup.array().of(
        Yup.object().shape({
            address1: Yup.string().required('Address is required'),
            city: Yup.string().required('City is required'),
            state: Yup.string().required('State is required'),
            contactNumber: Yup.string().required('Contact Number is required'),
        })
    ),
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    AadharCard: Yup.string().when('gstType', {
        is: 'Unregistered',
        then: (schema) => schema.required('Aadhar Card is required'),
        otherwise: (schema) => schema.notRequired()
    }),
    PANCard: Yup.string().when('gstType', {
        is: 'Unregistered',
        then: (schema) => schema.required('PAN Card is required'),
        otherwise: (schema) => schema.notRequired()
    }),
});

export default function RegisterCustomer() {
    const dispatch = useDispatch();
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
        regions: [],
        cities: {},
        zones: [],
        brands: [],
        specificLabs: [],
        salesPersons: [],
    });

    const [uploading, setUploading] = useState({
        aadhar: false,
        pan: false,
        gst: false
    });

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [data, regions, zones] = await Promise.all([
                    getCustomerConfigs(),
                    getAllRegions(),
                    getAllZones()
                ]);
                setConfigs(prev => ({ ...prev, ...data, regions, zones }));
            } catch {
                toast.error('Failed to load form configurations');
            }
        };
        fetchConfigs();
    }, []);


    const [brandCategories, setBrandCategories] = useState([]);

    const formik = useFormik({
        initialValues: INITIAL_FORM_VALUES,
        validationSchema,
        validateOnChange: false, // Validate only on blur/submit, not every keystroke
        validateOnBlur: true,
        onSubmit: async (values) => {
            try {
                await toast.promise(
                    registerCustomer(values),
                    {
                        pending: 'Registering customer...',
                        success: 'Customer registered successfully! 👌',
                        error: 'Registration failed. Please try again. 🤯'
                    }
                );
            } catch (error) {
                console.error('Registration error:', error);
            }
        }
    });

    const handleFileUpload = async (e, fieldName, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const response = await uploadImage(file);
            const url = response.data?.url || response.url || response;
            formik.setFieldValue(fieldName, url);
            toast.success(`${fieldName.replace(/Card|Doc|Img/g, '')} uploaded!`);
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            if (formik.values.specificBrandRefId) {
                const data = await getBrandCategories(formik.values.specificBrandRefId);
                setBrandCategories(data || []);
            } else {
                setBrandCategories([]);
            }
        };
        fetchCategories();
    }, [formik.values.specificBrandRefId]);

    const wrapInput = (Component, props) => (
        <Component
            {...props}
            isVerificationMode={isVerificationMode}
            isRejected={rejectedFields[props.name]}
            onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
            error={formik.touched[props.name] && formik.errors[props.name] ? { message: formik.errors[props.name] } : null}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values[props.name] ?? ''}
        />
    );

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
            case 2: return <CustomerRegn wrapInput={wrapInput} configs={configs} brandCategories={brandCategories} formValues={formik.values} formik={formik} dispatch={dispatch} />;
            case 3: return <Overview formik={formik} />;
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
                            className="  "
                        >
                            Save As Draft
                        </Button>

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
                                    formik.handleSubmit();
                                }
                            }}
                            className=""
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

const CustomerInfo = ({ wrapInput, configs, formik, aadharRef, panRef, gstRef, handleFileUpload, uploading }) => (
    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
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
        {wrapInput(Input, { label: 'Login Email*', name: 'loginEmail', placeholder: 'Enter Login Email' })}
        {wrapInput(Input, { label: 'Business Email', name: 'businessEmail', placeholder: 'Enter Business Email' })}

        {/* GST Selection */}
        {wrapInput(Select, {
            label: 'GST For Invoicing*',
            name: 'gstType',
            options: [{ value: 'Number', label: 'Number' }, { value: 'Unregistered', label: 'Unregistered' }]
        })}

        {/* Scenario 1: Registered (Number) - Show GST only */}
        {formik.values.gstType === 'Number' && (
            <div className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                {wrapInput(Input, { label: 'GST Number*', name: 'gstNo', placeholder: 'Enter GST No.' })}
                <input type="file" hidden ref={gstRef} onChange={(e) => handleFileUpload(e, 'gstDoc', 'gst')} />
                <Button
                    onClick={() => gstRef.current.click()}
                    disabled={uploading.gst}
                    className="bg-[#F59E0B] text-white rounded-lg h-[56px] px-6 flex items-center gap-2 whitespace-nowrap w-fit"
                >
                    <Icon icon={uploading.gst ? "mdi:loading" : "mdi:plus"} className={uploading.gst ? "animate-spin" : ""} />
                    {uploading.gst ? 'Uploading...' : 'Upload Doc.'}
                </Button>
            </div>
        )}

        {/* Scenario 2: Unregistered - Show Aadhar and PAN only */}
        {formik.values.gstType === 'Unregistered' && (
            <>
                <div className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                    {wrapInput(Input, { label: 'Aadhar Card No.*', name: 'AadharCard', placeholder: 'Enter Aadhar No.' })}
                    <input type="file" hidden ref={aadharRef} onChange={(e) => handleFileUpload(e, 'AadharCard', 'aadhar')} />
                    <Button
                        onClick={() => aadharRef.current.click()}
                        disabled={uploading.aadhar}
                        className="bg-[#F59E0B] text-white rounded-lg h-[56px] px-6 flex items-center gap-2 whitespace-nowrap w-fit"
                    >
                        <Icon icon={uploading.aadhar ? "mdi:loading" : "mdi:plus"} className={uploading.aadhar ? "animate-spin" : ""} />
                        {uploading.aadhar ? 'Uploading...' : 'Upload Doc.'}
                    </Button>
                </div>
                <div className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                    {wrapInput(Input, { label: 'PAN Card No.*', name: 'PANCard', placeholder: 'Enter PAN No.' })}
                    <input type="file" hidden ref={panRef} onChange={(e) => handleFileUpload(e, 'PANCard', 'pan')} />
                    <Button
                        onClick={() => panRef.current.click()}
                        disabled={uploading.pan}
                        className="bg-[#F59E0B] text-white rounded-lg h-[56px] px-6 flex items-center gap-2 whitespace-nowrap w-fit"
                    >
                        <Icon icon={uploading.pan ? "mdi:loading" : "mdi:plus"} className={uploading.pan ? "animate-spin" : ""} />
                        {uploading.pan ? 'Uploading...' : 'Upload Doc.'}
                    </Button>
                </div>
            </>
        )}
    </div>
);

const AddressDetails = ({ formik, configs, isVerificationMode, rejectedFields, dispatch }) => (
    <FieldArray name="address">
        {({ push, remove }) => (
            <div className="space-y-12">
                {formik.values.address.map((addr, index) => (
                    <div key={index} className="relative pt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#F59E0B] font-bold">Address {index + 1}*</h3>
                            {index > 0 && <button onClick={() => remove(index)} className="text-red-500 text-sm font-bold flex items-center gap-1"><Icon icon="mdi:delete" /> Remove</button>}
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                            <Input
                                label="Branch Address*"
                                name={`address.${index}.address1`}
                                value={addr.address1}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isVerificationMode={isVerificationMode}
                                isRejected={rejectedFields[`address.${index}.address1`]}
                                onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                error={formik.touched.address?.[index]?.address1 && formik.errors.address?.[index]?.address1 ? { message: formik.errors.address[index].address1 } : null}
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
                                options={configs.regions.map(r => ({ value: r.name, label: r.name }))}
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
                                options={[{ value: 'INR', label: 'INR' }]}
                            />
                            <Select
                                label="Billing Mode*"
                                name={`address.${index}.billingMode`}
                                value={addr.billingMode}
                                onChange={formik.handleChange}
                                isVerificationMode={isVerificationMode}
                                isRejected={rejectedFields[`address.${index}.billingMode`]}
                                onToggleRejection={(fieldName) => dispatch(toggleFieldRejection({ fieldName }))}
                                options={[{ value: 'CREDIT', label: 'Credit' }, { value: 'ADVANCE', label: 'Advance' }]}
                            />
                        </div>
                    </div>
                ))}
                <div className="flex justify-center mt-4">
                    <Button
                        variant="outlined"
                        onClick={() => push({ address1: '', contactPerson: '', contactNumber: '', city: '', state: '', country: 'India', billingCurrency: 'INR', billingMode: 'CREDIT' })}
                        className="bg-[#F59E0B] text-white rounded-full px-10 py-3 flex items-center gap-2 w-fit hover:text-black hover:bg-[#D97706]"
                    >
                        <Icon icon="mdi:plus" /> Add Address
                    </Button>
                </div>
            </div>
        )}
    </FieldArray>
);

const CustomerRegn = ({ wrapInput, configs, brandCategories, formValues, formik, dispatch }) => (
    <div className="space-y-12">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {wrapInput(Input, { label: 'Login Email*', name: 'username', placeholder: 'Enter Username' })}
            {wrapInput(Input, { label: 'Password*', name: 'password', type: 'password', placeholder: 'Enter Password' })}
            {wrapInput(Select, {
                label: 'Zone*',
                name: 'zoneRefId',
                options: configs.zones.map(z => ({ value: z._id, label: z.name }))
            })}
            {wrapInput(Select, {
                label: 'Has Flat Fitting*',
                name: 'hasFlatFitting',
                options: [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]
            })}
        </div>

        {formik.values.hasFlatFitting === 'Yes' && (
            <FieldArray name="flatFittingEntries">
                {({ push, remove }) => (
                    <div className="space-y-4">
                        {formik.values.flatFittingEntries.map((entry, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 animate-in fade-in duration-300 group">
                                <div className="flex-1 bg-[#F59E0B] rounded-full p-1.5 flex gap-2 items-center shadow-inner relative">
                                    <Select
                                        name={`flatFittingEntries.${index}.type`}
                                        variant="orange"
                                        placeholder="Select Type"
                                        containerClassName="flex-1"
                                        value={entry.type}
                                        onChange={formik.handleChange}
                                        options={[{ value: 'SINGLE VISION', label: 'Single Vision' }, { value: 'PROGRESSIVE', label: 'Progressive' }, { value: 'BIFOCAL', label: 'Bifocal' }]}
                                    />
                                    <Select
                                        name={`flatFittingEntries.${index}.index`}
                                        variant="orange"
                                        placeholder="Index"
                                        containerClassName="flex-1"
                                        value={entry.index}
                                        onChange={formik.handleChange}
                                        options={[{ value: '1.5', label: '1.5' }, { value: '1.56', label: '1.56' }, { value: '1.6', label: '1.6' }]}
                                    />
                                    <input
                                        name={`flatFittingEntries.${index}.price`}
                                        placeholder="Price"
                                        value={entry.price}
                                        onChange={formik.handleChange}
                                        containerClassName="flex-[0.5]"
                                        className="bg-transparent text-white italic placeholder:text-white/50 border-none h-[40px] px-4 rounded-full"
                                    />
                                </div>
                                {index === formik.values.flatFittingEntries.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => push({ type: '', index: '', price: '' })}
                                        className="bg-[#F59E0B] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-[#D97706] transition-transform active:scale-95 shrink-0"
                                    >
                                        <Icon icon="mdi:plus" className="text-2xl" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-red-600 transition-transform active:scale-95 shrink-0"
                                    >
                                        <Icon icon="mdi:close" className="text-2xl" />
                                    </button>
                                )}
                                <div className="flex flex-col min-w-[150px]">
                                    <span className="text-sm font-bold text-gray-700">Additional Entry</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter line-clamp-1">Flat Fitting {index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </FieldArray>
        )}

        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {wrapInput(Select, {
                label: 'Specific Brand*',
                name: 'specificBrandRefId',
                icon: <Icon icon="mdi:plus" />,
                options: configs.brands.map(b => ({ value: b._id, label: b.name }))
            })}
            {wrapInput(Select, {
                label: 'Specific Category*',
                name: 'specificCategoryRefId',
                icon: <Icon icon="mdi:plus" />,
                options: brandCategories.map(c => ({ value: c._id, label: c.name })),
                disabled: !formValues.specificBrandRefId
            })}
            {wrapInput(Select, {
                label: 'Specific Lab*',
                name: 'specificLabRefId',
                options: configs.specificLabs.map(l => ({ value: l._id, label: l.name }))
            })}
            {wrapInput(Select, {
                label: 'Select Sales Person*',
                name: 'salesPersonRefId',
                options: configs.salesPersons.map(s => ({ value: s._id, label: s.employeeName }))
            })}
            {wrapInput(Select, {
                label: 'Plant*',
                name: 'plantRefId',
                options: configs.plants?.map(p => ({ value: p._id, label: p.name })) || []
            })}
            {wrapInput(Select, {
                label: 'Fitting Centre*',
                name: 'fittingCenterRefId',
                options: configs.fittingCenters?.map(f => ({ value: f._id, label: f.name })) || []
            })}
            {wrapInput(Input, { label: 'Credit Limit*', name: 'creditLimit', placeholder: 'Enter Limit' })}
            {wrapInput(Select, {
                label: 'Credit Days*',
                name: 'creditDaysRefId',
                options: configs.creditDays?.map(d => ({ value: d._id, label: d.days.toString() })) || []
            })}
            {wrapInput(Select, {
                label: 'Courier Name*',
                name: 'courierNameRefId',
                options: configs.courierNames?.map(n => ({ value: n._id, label: n.name })) || []
            })}
            {wrapInput(Select, {
                label: 'Courier Time*',
                name: 'courierTimeRefId',
                options: configs.courierTimes?.map(t => ({ value: t._id, label: t.time })) || []
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

const Overview = ({ formik }) => {
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
                    <DetailItem label="Mobile" value={values.mobileNo1} />
                    <DetailItem label="Login Email" value={values.loginEmail} />
                    <DetailItem label="GST Type" value={values.gstType} />
                    {values.gstType === 'Number' && <DetailItem label="GST Number" value={values.gstNo} />}
                </div>

                <div className="col-span-full border-t border-gray-50 pt-6 mt-2">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Identity Documents</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {values.gstType === 'Number' ? (
                            <DocPreview label="GST Document" src={values.gstDoc} />
                        ) : (
                            <>
                                <DocPreview label="Aadhar Card" src={values.AadharCard} />
                                <DocPreview label="PAN Card" src={values.PANCard} />
                            </>
                        )}
                    </div>
                </div>
            </SummaryCard>

            <div className="space-y-6">
                {values.address.map((addr, idx) => (
                    <SummaryCard key={idx} title={`Address ${idx + 1} `} icon="mdi:map-marker">
                        <DetailItem label="Branch Address" value={addr.address1} />
                        <DetailItem label="Contact Person" value={addr.contactPerson} />
                        <DetailItem label="Contact No." value={addr.contactNumber} />
                        <DetailItem label="City" value={addr.city} />
                        <DetailItem label="State" value={addr.state} />
                        <DetailItem label="Currency" value={addr.billingCurrency} />
                    </SummaryCard>
                ))}
            </div>

            <SummaryCard title="Configuration" icon="mdi:cog">
                <DetailItem label="Username" value={values.username} />
                <DetailItem label="Has Flat Fitting" value={values.hasFlatFitting} />
                {values.hasFlatFitting === 'Yes' && values.flatFittingEntries.map((entry, idx) => (
                    <React.Fragment key={idx}>
                        <DetailItem label={`Fitting ${idx + 1} Type`} value={entry.type} />
                        <DetailItem label={`Fitting ${idx + 1} Index`} value={entry.index} />
                        <DetailItem label={`Fitting ${idx + 1} Price`} value={entry.price} />
                    </React.Fragment>
                ))}
                <DetailItem label="Credit Limit" value={values.creditLimit} />
                <DetailItem label="Sales Person" value={values.salesPersonRefId} />
            </SummaryCard>
        </div>
    );
};

