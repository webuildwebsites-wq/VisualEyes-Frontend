import React, { useState, useRef, useEffect } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updateFormValues } from '../store/slices/customerRegistrationSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { toast } from 'react-toastify';
import { uploadImage } from '../services/bucketService';
import { getCustomerConfigs, getBrandCategories, registerCustomer, getAllRegions, getCitiesByRegion, getAllZones } from '../services/customerService';

const steps = ['Basic Details', 'Address', 'Login Details', 'Documentation', 'Overview'];
const stepKeys = ['basic', 'address', 'login', 'documentation', 'overview'];

export default function RegisterCustomer() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    // Redux State
    const { activeStep: reduxStep, formValues: reduxValues } = useSelector(state => state.customerRegistration);
    const activeStep = reduxStep;

    const [images, setImages] = useState({
        gst: { file: null, preview: null, url: reduxValues.GSTCertificateImg || '', uploading: false },
        aadhar: { file: null, preview: null, url: reduxValues.AadharCardImg || '', uploading: false },
        pan: { file: null, preview: null, url: reduxValues.PANCardImg || '', uploading: false }
    });

    const [configs, setConfigs] = useState({
        customerTypes: [],
        gstTypes: [],
        plants: [],
        labs: [],
        fittingCenters: [],
        creditDays: [],
        courierNames: [],
        courierTimes: [],
        countries: [],
        regions: [],
        cities: {}, // Cache cities by region ID: { regionId: [cities] }
        zones: [],
        billingCurrencies: [],
        salesPersons: [],
        brands: [],
        categories: [],
        specificLabs: []
    });
    console.log(configs, "configs")
    const [brandCategories, setBrandCategories] = useState([]);
    console.log(brandCategories, "brandCategories");

    // Sync active step with URL query param
    useEffect(() => {
        const stepQuery = searchParams.get('step');
        if (stepQuery) {
            const stepIndex = stepKeys.indexOf(stepQuery);
            if (stepIndex !== -1 && stepIndex !== activeStep) {
                dispatch(setStep(stepIndex));
            }
        } else {
            // Initialize URL with current Redux step if missing
            setSearchParams({ step: stepKeys[activeStep] }, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, dispatch, setSearchParams]); // removed activeStep from deps to stop loop

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [data, regions, zones] = await Promise.all([
                    getCustomerConfigs(),
                    getAllRegions(),
                    getAllZones()
                ]);
                setConfigs(prev => ({
                    ...data,
                    regions,
                    zones,
                    cities: prev.cities
                }));
            } catch {
                toast.error('Failed to load form configurations');
            }
        };
        fetchConfigs();
    }, []);

    // Helper to fetch cities for a specific region
    const fetchCities = async (regionId) => {
        if (!regionId || configs.cities[regionId]) return;
        try {
            const cities = await getCitiesByRegion(regionId);
            setConfigs(prev => ({
                ...prev,
                cities: { ...prev.cities, [regionId]: cities }
            }));
        } catch {
            toast.error('Failed to load cities for the selected region');
        }
    };


    const formik = useFormik({
        initialValues: reduxValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            shopName: Yup.string().required('Shop Name is required'),
            ownerName: Yup.string().required('Owner Name is required'),
            emailId: Yup.string().email('Invalid email').required('Email is required'),
            mobileNo1: Yup.string().required('Mobile No. 1 is required'),
            CustomerTypeRefId: Yup.string().required('Customer Type is required'),
            address: Yup.array().of(
                Yup.object().shape({
                    address1: Yup.string().required('Address is required'),
                    city: Yup.string().required('City is required'),
                    stateRefId: Yup.string().required('State is required'),
                    country: Yup.string().required('Country is required'),
                    billingCurrency: Yup.string().required('Currency is required')
                })
            ),
            username: Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required'),
            zoneRefId: Yup.string().required('Zone is required'),
            selectType: Yup.array().when('hasFlatFitting', {
                is: 'yes',
                then: (schema) => schema.min(1, 'Select at least one type'),
                otherwise: (schema) => schema.notRequired()
            }),
            Price: Yup.string().when('hasFlatFitting', {
                is: 'yes',
                then: (schema) => schema.required('Price is required'),
                otherwise: (schema) => schema.notRequired()
            }),
        }),
        onSubmit: async (values) => {
            try {
                // Utility to find label/name from config list
                const findLabel = (list, id, labelKey = 'name') => {
                    const item = list.find(i => i._id === id);
                    return item ? item[labelKey] : '';
                };

                // Transform selectType for the API
                // Assuming selectType contains IDs
                const lensTypes = [
                    { value: 'SINGLE VISION', label: 'Single Vision' },
                    { value: 'PROGRESSIVE', label: 'Progressive' },
                    { value: 'BIFOCAL', label: 'Bifocal' }
                ];
                const selectTypePayload = (values.selectType || []).map(id => {
                    const type = lensTypes.find(t => t.value === id);
                    return { name: type?.label || id, refId: id }; // In this case refId is string id? User example has refId for these too.
                    // If these also come from API, we'd need them in configs.
                    // For now, let's treat them as static if they are not in configs.
                });

                // Transform data to match API expectations
                const payload = {
                    ...values,
                    CustomerType: findLabel(configs.customerTypes, values.CustomerTypeRefId),
                    zone: findLabel(configs.zones || [], values.zoneRefId), // Need to ensure zones is in configs
                    specificBrand: findLabel(configs.brands, values.specificBrandRefId),
                    specificCategory: findLabel(brandCategories, values.specificCategoryRefId),
                    specificLab: findLabel(configs.specificLabs, values.specificLabRefId),
                    salesPerson: findLabel(configs.salesPersons, values.salesPersonRefId, 'employeeName'),
                    gstType: findLabel(configs.gstTypes, values.gstTypeRefId),
                    plant: findLabel(configs.plants, values.plantRefId),
                    lab: findLabel(configs.labs, values.labRefId),
                    fittingCenter: findLabel(configs.fittingCenters, values.fittingCenterRefId),
                    creditDays: findLabel(configs.creditDays, values.creditDaysRefId, 'days'),
                    courierName: findLabel(configs.courierNames, values.courierNameRefId),
                    courierTime: findLabel(configs.courierTimes, values.courierTimeRefId, 'time'),

                    hasFlatFitting: values.hasFlatFitting === 'yes',
                    IsGSTRegistered: values.IsGSTRegistered === 'yes',
                    Price: Number(values.Price) || 0,
                    creditLimit: Number(values.creditLimit) || 0,
                    selectType: selectTypePayload,
                    selectTypeIndex: values.selectTypeIndex.map(Number),
                    address: values.address.map(addr => ({
                        ...addr,
                        zipCode: addr.zipCode // Ensure it's string as per schema
                    }))
                };

                const response = await registerCustomer(payload);
                if (response.success) {
                    toast.success('Customer Registered Successfully!');
                    navigate('/welcome', { state: { from: 'register' } });
                }
            } catch (error) {
                console.error('Registration Error:', error);
                toast.error(error?.error?.message || error?.message || 'Registration failed');
            }
        }
    });

    // Save form values to Redux on change
    useEffect(() => {
        dispatch(updateFormValues(formik.values));
    }, [formik.values, dispatch]);

    const handleNext = async () => {
        const stepFields = [
            ['shopName', 'ownerName', 'CustomerTypeRefId', 'orderMode', 'mobileNo1', 'emailId'], // Step 0
            ['address'], // Step 1
            ['username', 'password', 'selectType', 'Price', 'specificBrandRefId', 'zoneRefId'], // Step 2
            ['GSTNumber', 'creditLimit'] // Step 3
        ];

        const currentStepFields = stepFields[activeStep] || [];

        // Mark current step fields as touched
        const touched = {};
        currentStepFields.forEach(field => {
            touched[field] = true;
            if (field === 'address') {
                formik.values.address.forEach((_, idx) => {
                    touched[`address[${idx}].address1`] = true;
                    // ... mark other nested fields if needed, simplified here
                });
            }
        });
        await formik.setTouched({ ...formik.touched, ...touched });

        // Validate form
        const errors = await formik.validateForm();

        // Check if current step has errors
        const stepErrors = Object.keys(errors).filter(key => currentStepFields.includes(key));
        console.log(stepErrors, 'steperrors')
        if (stepErrors.length > 0) {
            toast.error('Please fill all required fields');
            return;
        }

        setSearchParams({ step: stepKeys[activeStep + 1] });
    };

    const handleBack = () => {
        setSearchParams({ step: stepKeys[activeStep - 1] });
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImages(prev => ({
                ...prev,
                [type]: { ...prev[type], file, preview: previewUrl, url: '' }
            }));
        }
    };

    const handleUpload = async (type) => {
        const imageData = images[type];
        if (!imageData.file) return;

        setImages(prev => ({ ...prev, [type]: { ...prev[type], uploading: true } }));

        try {
            const response = await uploadImage(imageData.file);
            const imageUrl = response.data?.url || response.url || response;
            setImages(prev => ({ ...prev, [type]: { ...prev[type], url: imageUrl, uploading: false } }));

            // Map type to formik field name
            if (type === 'gst') formik.setFieldValue('GSTCertificateImg', imageUrl);
            else if (type === 'aadhar') formik.setFieldValue('AadharCardImg', imageUrl);
            else if (type === 'pan') formik.setFieldValue('PANCardImg', imageUrl);

            toast.success(`${type.toUpperCase()} image uploaded!`);
        } catch {
            setImages(prev => ({ ...prev, [type]: { ...prev[type], uploading: false } }));
            toast.error('Upload failed');
        }
    };

    // Update categories when brand changes
    useEffect(() => {
        const fetchCategories = async () => {
            if (formik.values.specificBrandRefId) {
                const cats = await getBrandCategories(formik.values.specificBrandRefId);
                console.log(cats, 'cats')
                setBrandCategories(cats.categories || []); // Ensure we set the array directly if getBrandCategories returns it correctly
            } else {
                setBrandCategories([]);
            }
        };
        fetchCategories();
    }, [formik.values.specificBrandRefId]);

    const renderStepContent = (step) => {
        switch (step) {
            case 0: return <BasicDetails formik={formik} configs={configs} />;
            case 1: return <AddressDetails formik={formik} configs={configs} fetchCities={fetchCities} />;
            case 2: return <LoginDetails formik={formik} configs={configs} brandCategories={brandCategories} />;
            case 3: return <DocumentationDetails formik={formik} configs={configs} images={images} handleFileSelect={handleFileSelect} handleUpload={handleUpload} />;
            case 4: return <Overview formik={formik} configs={configs} brandCategories={brandCategories} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Header / Banner Area */}


            {/* Stepper Navigation */}
            <div className="flex gap-4 mb-8 overflow-x-auto w-full justify-center py-2 no-scrollbar">
                {steps.map((label, index) => (
                    <button
                        key={label}
                        onClick={() => setSearchParams({ step: stepKeys[index] })}
                        className={`px-6 py-2 rounded-full border-2 transition-all min-w-[150px] font-medium
                            ${activeStep === index
                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'}
                        `}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 w-full max-w-6xl border border-gray-100 min-h-[500px] transition-all">
                <form onSubmit={formik.handleSubmit}>
                    {renderStepContent(activeStep)}

                    <div className="flex justify-center flex-wrap gap-6 mt-12">
                        {activeStep > 0 && (
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                className="max-w-[180px]"
                            >
                                Back
                            </Button>
                        )}
                        {activeStep < steps.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                className="max-w-[180px] bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="max-w-[180px] bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                            >
                                Submit
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            onClick={() => formik.resetForm()}
                            className="max-w-[180px]"
                        >
                            Refresh
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Step Components ---

const BasicDetails = ({ formik, configs }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <Input label="Shop Name" name="shopName" placeholder="Enter Shop Name" value={formik.values.shopName} onChange={formik.handleChange} error={formik.touched.shopName && formik.errors.shopName ? { message: formik.errors.shopName } : null} />
        <Input label="Owner Name" name="ownerName" placeholder="Enter Owner Name" value={formik.values.ownerName} onChange={formik.handleChange} error={formik.touched.ownerName && formik.errors.ownerName ? { message: formik.errors.ownerName } : null} />
        <Select
            label="Customer Type"
            name="CustomerTypeRefId"
            placeholder="Select Customer Type"
            value={formik.values.CustomerTypeRefId}
            onChange={formik.handleChange}
            options={configs.customerTypes.map(c => ({ value: c._id, label: c.name }))}
            error={formik.touched.CustomerTypeRefId && formik.errors.CustomerTypeRefId ? { message: formik.errors.CustomerTypeRefId } : null}
        />
        <Select label="Order Mode" name="orderMode" placeholder="Select Order Mode" value={formik.values.orderMode} onChange={formik.handleChange} options={[{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }]} />
        <Input label="Mobile No. 1" name="mobileNo1" placeholder="Enter Mobile No. 1" value={formik.values.mobileNo1} onChange={formik.handleChange} error={formik.touched.mobileNo1 && formik.errors.mobileNo1 ? { message: formik.errors.mobileNo1 } : null} />
        <Input label="Mobile No. 2" name="mobileNo2" placeholder="Enter Mobile No. 2" value={formik.values.mobileNo2} onChange={formik.handleChange} />
        <Input label="Landline No." name="landlineNo" placeholder="Enter Landline No." value={formik.values.landlineNo} onChange={formik.handleChange} />
        <Input label="Email" name="emailId" placeholder="Enter Email Address" value={formik.values.emailId} onChange={formik.handleChange} error={formik.touched.emailId && formik.errors.emailId ? { message: formik.errors.emailId } : null} />
    </div>
);

const AddressDetails = ({ formik, configs, fetchCities }) => (
    <FormikProvider value={formik}>
        <FieldArray name="address">
            {({ push, remove }) => (
                <div className="space-y-12">
                    {formik.values.address.map((addr, index) => (
                        <div key={index} className="relative pt-4">
                            {index > 0 && (
                                <button type="button" onClick={() => remove(index)} className="absolute top-0 right-0 text-red-500 flex items-center gap-1 text-sm font-bold">
                                    <Icon icon="mdi:trash-can-outline" /> Remove
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <Input label="Address 1" name={`address.${index}.address1`} placeholder="Address 1" value={addr.address1} onChange={formik.handleChange} />
                                <Input label="Contact Person" name={`address.${index}.contactPerson`} placeholder="Contact Person" value={addr.contactPerson} onChange={formik.handleChange} />
                                <Input label="Contact Number" name={`address.${index}.contactNumber`} placeholder="Contact Number" value={addr.contactNumber} onChange={formik.handleChange} />
                                <Select
                                    label="State (Region)"
                                    name={`address.${index}.stateRefId`}
                                    placeholder="Select State"
                                    value={addr.stateRefId}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        fetchCities(e.target.value);
                                        const region = configs.regions.find(r => r._id === e.target.value);
                                        formik.setFieldValue(`address.${index}.state`, region?.name || '');
                                    }}
                                    options={configs.regions.map(r => ({ value: r._id, label: r.name }))}
                                />
                                <Select
                                    label="City"
                                    name={`address.${index}.city`}
                                    placeholder="Select City"
                                    value={addr.city}
                                    onChange={formik.handleChange}
                                    options={(configs.cities[addr.stateRefId] || []).map(c => ({ value: c.name, label: c.name }))}
                                    disabled={!addr.stateRefId}
                                />
                                <Input label="Zip Code" name={`address.${index}.zipCode`} placeholder="Zip Code" value={addr.zipCode} onChange={formik.handleChange} />
                                <Select
                                    label="Country"
                                    name={`address.${index}.country`}
                                    placeholder="Select Country"
                                    value={addr.country}
                                    onChange={formik.handleChange}
                                    options={configs.countries.map(c => ({ value: c.name, label: c.name }))}
                                />
                                <Select
                                    label="Billing Currency"
                                    name={`address.${index}.billingCurrency`}
                                    placeholder="Select Currency"
                                    value={addr.billingCurrency}
                                    onChange={formik.handleChange}
                                    options={configs.billingCurrencies.map(c => ({ value: c.name, label: c.name }))}
                                />
                                <Select
                                    label="Billing Mode"
                                    name={`address.${index}.billingMode`}
                                    placeholder="Select Mode"
                                    value={addr.billingMode}
                                    onChange={formik.handleChange}
                                    options={[{ value: 'CREDIT', label: 'Credit' }, { value: 'ADVANCE', label: 'Advance' }]}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center mt-8">
                        <button
                            type="button"
                            onClick={() => push({ address1: '', contactPerson: '', contactNumber: '', city: '', state: '', zipCode: '', country: '', billingCurrency: '', billingMode: '' })}
                            className="bg-amber-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
                        >
                            <Icon icon="mdi:plus" className="text-xl" /> Add Address
                        </button>
                    </div>
                </div>
            )}
        </FieldArray>
    </FormikProvider>
);

const LoginDetails = ({ formik, configs, brandCategories }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <Input label="Username" name="username" placeholder="Enter Username" value={formik.values.username} onChange={formik.handleChange} error={formik.touched.username && formik.errors.username ? { message: formik.errors.username } : null} />
        <Input label="Password" name="password" type="password" placeholder="Enter Password" value={formik.values.password} onChange={formik.handleChange} error={formik.touched.password && formik.errors.password ? { message: formik.errors.password } : null} />
        <Select
            label="Zone"
            name="zoneRefId"
            placeholder="Select Zone"
            value={formik.values.zoneRefId}
            onChange={formik.handleChange}
            options={configs.zones.map(z => ({ value: z._id, label: z.name }))}
        />
        <Select label="Has Flat Fitting" name="hasFlatFitting" placeholder="Select Option" value={formik.values.hasFlatFitting} onChange={formik.handleChange} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />

        {formik.values.hasFlatFitting === 'yes' && (
            <>
                <Select
                    label="Select Type"
                    name="selectType"
                    variant="orange"
                    placeholder="Select Type"
                    multiple
                    icon={<Icon icon="mdi:plus" />}
                    value={formik.values.selectType}
                    onChange={formik.handleChange}
                    options={[{ value: 'SINGLE VISION', label: 'Single Vision' }, { value: 'PROGRESSIVE', label: 'Progressive' }, { value: 'BIFOCAL', label: 'Bifocal' }]}
                    error={formik.touched.selectType && formik.errors.selectType ? { message: formik.errors.selectType } : null}
                />
                <Select
                    label="Index"
                    name="selectTypeIndex"
                    variant="orange"
                    placeholder="Select Index"
                    multiple
                    icon={<Icon icon="mdi:plus" />}
                    value={formik.values.selectTypeIndex}
                    onChange={formik.handleChange}
                    options={[{ value: '1.5', label: '1.5' }, { value: '1.56', label: '1.56' }, { value: '1.6', label: '1.6' }, { value: '1.67', label: '1.67' }, { value: '1.74', label: '1.74' }]}
                />
                <Input label="Price" name="Price" placeholder="Price" variant="orange" value={formik.values.Price} onChange={formik.handleChange} error={formik.touched.Price && formik.errors.Price ? { message: formik.errors.Price } : null} />
            </>
        )}

        <Select
            label="Specific Brand"
            name="specificBrandRefId"
            placeholder="Select Brand"
            value={formik.values.specificBrandRefId}
            onChange={formik.handleChange}
            options={configs.brands.map(b => ({ value: b._id, label: b.name }))}
        />
        <Select
            label="Specific Category"
            name="specificCategoryRefId"
            placeholder="Select Category"
            value={formik.values.specificCategoryRefId}
            onChange={formik.handleChange}
            options={brandCategories.map(c => ({ value: c._id, label: c.name }))}
            disabled={!formik.values.specificBrandRefId}
        />
        <Select
            label="Specific Lab"
            name="specificLabRefId"
            placeholder="Select Specific Lab"
            value={formik.values.specificLabRefId}
            onChange={formik.handleChange}
            options={configs.specificLabs.map(l => ({ value: l._id, label: l.name }))}
        />
        {console.log(configs.salesPersons, "salesPersons")}
        <Select
            label="Select Sales Person"
            name="salesPersonRefId"
            placeholder="Select Sales Person"
            value={formik.values.salesPersonRefId}
            onChange={formik.handleChange}
            options={configs.salesPersons.map(s => ({ value: s._id, label: s.employeeName }))}
        />
    </div>
);

const DocumentationDetails = ({ formik, configs, images, handleFileSelect, handleUpload }) => {
    const gstRef = useRef(null);
    const aadharRef = useRef(null);
    const panRef = useRef(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
            <Select label="Does this business have GST?" name="IsGSTRegistered" placeholder="Select Option" value={formik.values.IsGSTRegistered} onChange={formik.handleChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />

            {formik.values.IsGSTRegistered === 'yes' && (
                <>
                    <Select
                        label="GST Type"
                        name="gstTypeRefId"
                        placeholder="Select GST Type"
                        value={formik.values.gstTypeRefId}
                        onChange={formik.handleChange}
                        options={configs.gstTypes.map(t => ({ value: t._id, label: t.name }))}
                    />

                    <div className="flex gap-4 items-end">
                        <Input label="GST No." name="GSTNumber" placeholder="Enter GST No." value={formik.values.GSTNumber} onChange={formik.handleChange} />
                        <div className="flex flex-col items-center">
                            <input type="file" hidden ref={gstRef} onChange={(e) => handleFileSelect(e, 'gst')} />
                            <button type="button" onClick={() => gstRef.current.click()} className="bg-amber-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                                <Icon icon="mdi:plus" /> Add Image
                            </button>
                            {images.gst.file && !images.gst.url && (
                                <button type="button" onClick={() => handleUpload('gst')} className="text-[10px] text-amber-600 font-bold underline">Confirm</button>
                            )}
                            {images.gst.url && <Icon icon="mdi:check-circle" className="text-green-500" />}
                        </div>
                    </div>
                </>
            )}

            <div className="flex gap-4 items-end">
                <Input label="Aadhar Card No." name="AadharCard" placeholder="Enter Aadhar No." value={formik.values.AadharCard} onChange={formik.handleChange} />
                <div className="flex flex-col items-center">
                    <input type="file" hidden ref={aadharRef} onChange={(e) => handleFileSelect(e, 'aadhar')} />
                    <button type="button" onClick={() => aadharRef.current.click()} className="bg-amber-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                        <Icon icon="mdi:plus" /> Add Image
                    </button>
                    {images.aadhar.file && !images.aadhar.url && (
                        <button type="button" onClick={() => handleUpload('aadhar')} className="text-[10px] text-amber-600 font-bold underline">Confirm</button>
                    )}
                    {images.aadhar.url && <Icon icon="mdi:check-circle" className="text-green-500" />}
                </div>
            </div>

            <div className="flex gap-4 items-end">
                <Input label="PAN Card No." name="PANCard" placeholder="Enter PAN No." value={formik.values.PANCard} onChange={formik.handleChange} />
                <div className="flex flex-col items-center">
                    <input type="file" hidden ref={panRef} onChange={(e) => handleFileSelect(e, 'pan')} />
                    <button type="button" onClick={() => panRef.current.click()} className="bg-amber-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1 whitespace-nowrap">
                        <Icon icon="mdi:plus" /> Add Image
                    </button>
                    {images.pan.file && !images.pan.url && (
                        <button type="button" onClick={() => handleUpload('pan')} className="text-[10px] text-amber-600 font-bold underline">Confirm</button>
                    )}
                    {images.pan.url && <Icon icon="mdi:check-circle" className="text-green-500" />}
                </div>
            </div>

            <Select
                label="Plant"
                name="plantRefId"
                placeholder="Select Plant"
                value={formik.values.plantRefId}
                onChange={formik.handleChange}
                options={configs.plants.map(p => ({ value: p._id, label: p.name }))}
            />
            <Select
                label="Lab"
                name="labRefId"
                placeholder="Select Lab"
                value={formik.values.labRefId}
                onChange={formik.handleChange}
                options={configs.labs.map(l => ({ value: l._id, label: l.name }))}
            />
            <Select
                label="Fitting Centre"
                name="fittingCenterRefId"
                placeholder="Select Fitting Centre"
                value={formik.values.fittingCenterRefId}
                onChange={formik.handleChange}
                options={configs.fittingCenters.map(f => ({ value: f._id, label: f.name }))}
            />
            <Select
                label="Credit Days"
                name="creditDaysRefId"
                placeholder="Select Credit Days"
                value={formik.values.creditDaysRefId}
                onChange={formik.handleChange}
                options={configs.creditDays.map(d => ({ value: d._id, label: d.days }))}
            />
            <Input label="Credit Limit" name="creditLimit" placeholder="Credit Limit" value={formik.values.creditLimit} onChange={formik.handleChange} />
            <Select
                label="Courier Time"
                name="courierTimeRefId"
                placeholder="Select Time"
                value={formik.values.courierTimeRefId}
                onChange={formik.handleChange}
                options={configs.courierTimes.map(t => ({ value: t._id, label: t.time }))}
            />
            <Select
                label="Courier Name"
                name="courierNameRefId"
                placeholder="Select Courier"
                value={formik.values.courierNameRefId}
                onChange={formik.handleChange}
                options={configs.courierNames.map(n => ({ value: n._id, label: n.name }))}
            />
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-400 text-xs uppercase font-semibold">{label}</span>
        <span className="text-gray-700 font-medium">{value || '---'}</span>
    </div>
);

const Card = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Icon icon={icon} className="text-amber-500 text-2xl" />
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

const ImagePreview = ({ label, url, verified }) => (
    <div className="flex flex-col gap-2">
        <span className="text-gray-400 text-xs uppercase font-semibold">{label}</span>
        {url ? (
            <div className="relative group w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                {verified && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                        <Icon icon="mdi:check-bold" className="text-xs" />
                    </div>
                )}
            </div>
        ) : (
            <div className="w-32 h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-[10px] text-gray-400">No Image</span>
            </div>
        )}
    </div>
);

const Overview = ({ formik, configs, brandCategories }) => {
    const { values } = formik;

    const getName = (list, value, key = 'name', idKey = 'value') => {
        if (!value) return '---';
        const item = list.find(i => i._id === value || i.name === value || i[idKey] === value || i === value);
        return item ? (item[key] || item.name || item) : value;
    };

    return (
        <div className="space-y-8 h-[550px] overflow-y-auto pr-4 custom-scrollbar">
            <Card title="Basic Information" icon="mdi:account-details">
                <DetailItem label="Shop Name" value={values.shopName} />
                <DetailItem label="Owner Name" value={values.ownerName} />
                <DetailItem label="Customer Type" value={values.CustomerType} />
                <DetailItem label="Order Mode" value={values.orderMode} />
                <DetailItem label="Phone 1" value={values.mobileNo1} />
                <DetailItem label="Phone 2" value={values.mobileNo2} />
                <DetailItem label="Landline" value={values.landlineNo} />
                <DetailItem label="Email" value={values.emailId} />
            </Card>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 italic text-amber-800 text-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2 not-italic">
                    <Icon icon="mdi:map-marker" className="text-lg" /> Registered Addresses
                </h4>
                <div className="space-y-4">
                    {values.address.map((addr, i) => (
                        <div key={i} className="bg-white/50 p-4 rounded-xl border border-white/80 not-italic">
                            <p className="font-bold text-gray-800 mb-1">Address {i + 1}</p>
                            <p className="text-gray-600 line-clamp-2">{addr.address1}, {addr.city}, {addr.state}, {addr.country} - {addr.zipCode}</p>
                            <div className="mt-2 flex gap-4 text-xs">
                                <span><strong>Contact:</strong> {addr.contactPerson}</span>
                                <span><strong>Phone:</strong> {addr.contactNumber}</span>
                                <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-amber-700">{addr.billingCurrency}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card title="Business Configuration" icon="mdi:cog-box">
                <DetailItem label="Username" value={values.username} />
                <DetailItem label="Zone" value={values.zone} />
                <DetailItem label="Flat Fitting" value={values.hasFlatFitting} />
                {values.hasFlatFitting === 'yes' && (
                    <>
                        <DetailItem label="Lens Types" value={values.selectType.join(', ')} />
                        <DetailItem label="Indices" value={values.selectTypeIndex.join(', ')} />
                        <DetailItem label="Lens Price" value={values.Price} />
                    </>
                )}
                <DetailItem label="Brand" value={getName(configs.brands, values.specificBrandRefId)} />
                <DetailItem label="Category" value={getName(brandCategories, values.specificCategoryRefId)} />
                <DetailItem label="Specific Lab" value={getName(configs.specificLabs, values.specificLabRefId)} />
                <DetailItem label="Sales Person" value={getName(configs.salesPersons, values.salesPersonRefId, 'employeeName')} />
            </Card>

            <Card title="Documentation & Logistics" icon="mdi:file-certificate">
                <DetailItem label="GST Registered" value={values.IsGSTRegistered} />
                {values.IsGSTRegistered === 'yes' && (
                    <>
                        <DetailItem label="GST Type" value={getName(configs.gstTypes, values.gstTypeRefId)} />
                        <DetailItem label="GST No." value={values.GSTNumber} />
                    </>
                )}
                <DetailItem label="Aadhar No." value={values.AadharCard} />
                <DetailItem label="PAN No." value={values.PANCard} />
                <DetailItem label="Plant" value={getName(configs.plants, values.plantRefId)} />
                <DetailItem label="Lab" value={getName(configs.labs, values.labRefId)} />
                <DetailItem label="Fitting Centre" value={getName(configs.fittingCenters, values.fittingCenterRefId)} />
                <DetailItem label="Credit Days" value={getName(configs.creditDays, values.creditDaysRefId, 'days')} />
                <DetailItem label="Credit Limit" value={values.creditLimit} />
                <DetailItem label="Courier" value={`${getName(configs.courierNames, values.courierNameRefId)} (${getName(configs.courierTimes, values.courierTimeRefId, 'time')})`} />
                <div className="col-span-full pt-4 border-t border-gray-50 mt-2">
                    <div className="flex flex-wrap gap-8">
                        <ImagePreview label="GST Certificate" url={values.GSTCertificateImg} verified={!!values.GSTCertificateImg} />
                        <ImagePreview label="Aadhar Image" url={values.AadharCardImg} verified={!!values.AadharCardImg} />
                        <ImagePreview label="PAN Image" url={values.PANCardImg} verified={!!values.PANCardImg} />
                    </div>
                </div>
            </Card>
        </div>
    );
};

