import React, { useState, useRef } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { toast } from 'react-toastify';
import { uploadImage } from '../services/bucketService';

const steps = ['Basic Details', 'Address', 'Login Details', 'Documentation', 'Overview'];

export default function RegisterCustomer() {
    const [activeStep, setActiveStep] = useState(0);
    const [images, setImages] = useState({
        gst: { file: null, preview: null, url: '', uploading: false },
        aadhar: { file: null, preview: null, url: '', uploading: false },
        pan: { file: null, preview: null, url: '', uploading: false }
    });


    const formik = useFormik({
        initialValues: {
            // Step 1: Basic Details
            shopName: '',
            ownerName: '',
            customerType: '',
            orderMode: '',
            phone1: '',
            phone2: '',
            landline: '',
            email: '',
            // Step 2: Address
            addresses: [
                { address1: '', name: '', contact: '', city: '', state: '', country: '', billingCurrency: '' }
            ],
            // Step 3: Login Details
            username: '',
            zone: '',
            flatFitting: 'no',
            types: [],
            indices: [],
            price: '',
            brand: '',
            category: '',
            lab: '',
            salesPerson: '',
            // Step 4: Documentation
            hasGST: 'no',
            gstType: '',
            gstNo: '',
            gstImage: '',
            aadharNo: '',
            aadharImage: '',
            panNo: '',
            panImage: '',
            plant: '',
            labDoc: '',
            fittingCentre: '',
            creditDays: '',
            creditLimit: '',
            courierTime: '',
            courierName: ''
        },
        validationSchema: Yup.object({
            shopName: Yup.string().required('Shop Name is required'),
            ownerName: Yup.string().required('Owner Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            phone1: Yup.string().required('Mobile No. 1 is required'),
        }),
        onSubmit: async (values) => {
            console.log('Final Values:', values);
            toast.success('Customer Registered Successfully!');
        }
    });

    const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

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
            formik.setFieldValue(`${type === 'gst' ? 'gstImage' : type === 'aadhar' ? 'aadharImage' : 'panImage'}`, imageUrl);
            toast.success(`${type.toUpperCase()} image uploaded!`);
        } catch {
            setImages(prev => ({ ...prev, [type]: { ...prev[type], uploading: false } }));
            toast.error('Upload failed');
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0: return <BasicDetails formik={formik} />;
            case 1: return <AddressDetails formik={formik} />;
            case 2: return <LoginDetails formik={formik} />;
            case 3: return <DocumentationDetails formik={formik} images={images} handleFileSelect={handleFileSelect} handleUpload={handleUpload} />;
            case 4: return <Overview formik={formik} />;
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
                        onClick={() => setActiveStep(index)}
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

const BasicDetails = ({ formik }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <Input label="Shop Name" name="shopName" placeholder="Enter Shop Name" value={formik.values.shopName} onChange={formik.handleChange} error={formik.touched.shopName && formik.errors.shopName ? { message: formik.errors.shopName } : null} />
        <Input label="Owner Name" name="ownerName" placeholder="Enter Owner Name" value={formik.values.ownerName} onChange={formik.handleChange} error={formik.touched.ownerName && formik.errors.ownerName ? { message: formik.errors.ownerName } : null} />
        <Select label="Customer Type" name="customerType" placeholder="Select Customer Type" value={formik.values.customerType} onChange={formik.handleChange} options={[{ value: 'RETAIL', label: 'Retail' }, { value: 'WHOLESALE', label: 'Wholesale' }]} />
        <Select label="Order Mode" name="orderMode" placeholder="Select Order Mode" value={formik.values.orderMode} onChange={formik.handleChange} options={[{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }]} />
        <Input label="Mobile No. 1" name="phone1" placeholder="Enter Mobile No. 1" value={formik.values.phone1} onChange={formik.handleChange} />
        <Input label="Mobile No. 2" name="phone2" placeholder="Enter Mobile No. 2" value={formik.values.phone2} onChange={formik.handleChange} />
        <Input label="Landline No." name="landline" placeholder="Enter Landline No." value={formik.values.landline} onChange={formik.handleChange} />
        <Input label="Email" name="email" placeholder="Enter Email Address" value={formik.values.email} onChange={formik.handleChange} />
    </div>
);

const AddressDetails = ({ formik }) => (
    <FormikProvider value={formik}>
        <FieldArray name="addresses">
            {({ push, remove }) => (
                <div className="space-y-12">
                    {formik.values.addresses.map((address, index) => (
                        <div key={index} className="relative pt-4">
                            {index > 0 && (
                                <button type="button" onClick={() => remove(index)} className="absolute top-0 right-0 text-red-500 flex items-center gap-1 text-sm font-bold">
                                    <Icon icon="mdi:trash-can-outline" /> Remove
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <Input label="Address 1" name={`addresses.${index}.address1`} placeholder="Address 1" value={address.address1} onChange={formik.handleChange} />
                                <Input label="Name" name={`addresses.${index}.name`} placeholder="Name" value={address.name} onChange={formik.handleChange} />
                                <Input label="Contact" name={`addresses.${index}.contact`} placeholder="Contact" value={address.contact} onChange={formik.handleChange} />
                                <Input label="City" name={`addresses.${index}.city`} placeholder="City" value={address.city} onChange={formik.handleChange} />
                                <Select label="State" name={`addresses.${index}.state`} placeholder="Select State" value={address.state} onChange={formik.handleChange} options={[{ value: 'WB', label: 'West Bengal' }, { value: 'MH', label: 'Maharashtra' }]} />
                                <Select label="Country" name={`addresses.${index}.country`} placeholder="Select Country" value={address.country} onChange={formik.handleChange} options={[{ value: 'IN', label: 'India' }]} />
                                <Select label="Billing Currency" name={`addresses.${index}.billingCurrency`} placeholder="Select Currency" value={address.billingCurrency} onChange={formik.handleChange} options={[{ value: 'INR', label: 'INR' }, { value: 'USD', label: 'USD' }]} />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center mt-8">
                        <button
                            type="button"
                            onClick={() => push({ address1: '', name: '', contact: '', city: '', state: '', country: '', billingCurrency: '' })}
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

const LoginDetails = ({ formik }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <Input label="Username" name="username" placeholder="Enter Username" value={formik.values.username} onChange={formik.handleChange} />
        <Input label="Zone" name="zone" placeholder="Enter Zone" value={formik.values.zone} onChange={formik.handleChange} />
        <Input label="Has Flat Fitting : Yes" name="flatFitting" placeholder="Yes/No" value={formik.values.flatFitting} onChange={formik.handleChange} />
        <Select
            label="Select Type"
            name="types"
            variant="orange"
            placeholder="Select Type"
            multiple
            icon={<Icon icon="mdi:plus" />}
            value={formik.values.types}
            onChange={formik.handleChange}
            options={[{ value: 'T1', label: 'Type 1' }, { value: 'T2', label: 'Type 2' }]}
        />
        <Select
            label="Index"
            name="indices"
            variant="orange"
            placeholder="Select Index"
            multiple
            icon={<Icon icon="mdi:plus" />}
            value={formik.values.indices}
            onChange={formik.handleChange}
            options={[{ value: '1.5', label: '1.5' }, { value: '1.6', label: '1.6' }]}
        />
        <Input label="Price" name="price" placeholder="Price" variant="orange" value={formik.values.price} onChange={formik.handleChange} />
        <Input label="Specific Brand" name="brand" placeholder="Specific Brand" value={formik.values.brand} onChange={formik.handleChange} />
        <Input label="Specific Category" name="category" placeholder="Specific Category" value={formik.values.category} onChange={formik.handleChange} />
        <Input label="Specific Lab" name="lab" placeholder="Specific Lab" value={formik.values.lab} onChange={formik.handleChange} />
        <Select label="Select Sales Person" name="salesPerson" placeholder="Select Sales Person" value={formik.values.salesPerson} onChange={formik.handleChange} options={[{ value: 'S1', label: 'Sales 1' }]} />
    </div>
);

const DocumentationDetails = ({ formik, images, handleFileSelect, handleUpload }) => {
    const gstRef = useRef(null);
    const aadharRef = useRef(null);
    const panRef = useRef(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
            <Select label="Does this business have GST?" name="hasGST" placeholder="Select Option" value={formik.values.hasGST} onChange={formik.handleChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
            <Select label="GST Type" name="gstType" placeholder="Select GST Type" value={formik.values.gstType} onChange={formik.handleChange} options={[{ value: 'R', label: 'Registered' }]} />

            <div className="flex gap-4 items-end">
                <Input label="GST No." name="gstNo" placeholder="Enter GST No." value={formik.values.gstNo} onChange={formik.handleChange} />
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

            <div className="flex gap-4 items-end">
                <Input label="Aadhar Card No." name="aadharNo" placeholder="Enter Aadhar No." value={formik.values.aadharNo} onChange={formik.handleChange} />
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
                <Input label="PAN Card No." name="panNo" placeholder="Enter PAN No." value={formik.values.panNo} onChange={formik.handleChange} />
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

            <Input label="Plant" name="plant" placeholder="Plant" value={formik.values.plant} onChange={formik.handleChange} />
            <Select label="Lab" name="labDoc" placeholder="Select Lab" value={formik.values.labDoc} onChange={formik.handleChange} options={[{ value: 'L1', label: 'Lab 1' }]} />
            <Select label="Fitting Centre" name="fittingCentre" placeholder="Select Fitting Centre" value={formik.values.fittingCentre} onChange={formik.handleChange} options={[{ value: 'F1', label: 'Fitting 1' }]} />
            <Input label="Credit Days" name="creditDays" placeholder="Credit Days" value={formik.values.creditDays} onChange={formik.handleChange} />
            <Input label="Credit Limit" name="creditLimit" placeholder="Credit Limit" value={formik.values.creditLimit} onChange={formik.handleChange} />
            <Select label="Courier Time" name="courierTime" placeholder="Select Time" value={formik.values.courierTime} onChange={formik.handleChange} options={[{ value: 'AM', label: 'Morning' }]} />
            <Select label="Courier Name" name="courierName" placeholder="Select Name" value={formik.values.courierName} onChange={formik.handleChange} options={[{ value: 'C1', label: 'Courier 1' }]} />
        </div>
    );
};

const Overview = ({ formik }) => {
    const { values } = formik;
    return (
        <div className="space-y-12 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            <section>
                <h3 className="text-amber-500 font-bold uppercase mb-4 text-center border-b pb-2">Basic Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Shop Name:</strong> {values.shopName}</p>
                    <p><strong>Owner Name:</strong> {values.ownerName}</p>
                    <p><strong>Customer Type:</strong> {values.customerType}</p>
                    <p><strong>Order Mode:</strong> {values.orderMode}</p>
                    <p><strong>Mobile 1:</strong> {values.phone1}</p>
                    <p><strong>Mobile 2:</strong> {values.phone2}</p>
                    <p><strong>Landline:</strong> {values.landline}</p>
                    <p><strong>Email:</strong> {values.email}</p>
                </div>
            </section>

            <section>
                <h3 className="text-amber-500 font-bold uppercase mb-4 text-center border-b pb-2">Address Details</h3>
                {values.addresses.map((addr, i) => (
                    <div key={i} className="mb-4 text-sm border-l-4 border-amber-200 pl-4 py-2 bg-gray-50 rounded-r-lg">
                        <p><strong>Address {i + 1}:</strong> {addr.address1}, {addr.city}, {addr.state}, {addr.country}</p>
                        <p><strong>Contact Person:</strong> {addr.name} ({addr.contact})</p>
                    </div>
                ))}
            </section>

            <section>
                <h3 className="text-amber-500 font-bold uppercase mb-4 text-center border-b pb-2">Login & Config</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Username:</strong> {values.username}</p>
                    <p><strong>Zone:</strong> {values.zone}</p>
                    <p><strong>Flat Fitting:</strong> {values.flatFitting}</p>
                    <p><strong>Types:</strong> {values.types.join(', ')}</p>
                    <p><strong>Indices:</strong> {values.indices.join(', ')}</p>
                    <p><strong>Sales Person:</strong> {values.salesPerson}</p>
                </div>
            </section>

            <section>
                <h3 className="text-amber-500 font-bold uppercase mb-4 text-center border-b pb-2">Documentation</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>GST No:</strong> {values.gstNo} {values.gstImage ? '✅' : '❌'}</p>
                    <p><strong>Aadhar No:</strong> {values.aadharNo} {values.aadharImage ? '✅' : '❌'}</p>
                    <p><strong>PAN No:</strong> {values.panNo} {values.panImage ? '✅' : '❌'}</p>
                    <p><strong>Credit Days:</strong> {values.creditDays}</p>
                    <p><strong>Credit Limit:</strong> {values.creditLimit}</p>
                </div>
            </section>
        </div>
    );
};

