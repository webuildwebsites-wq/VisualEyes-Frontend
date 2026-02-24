import React, { useState, useEffect, useRef } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { toast } from 'react-toastify';
import { getAllCustomers, addShipTo, getAllRegions, getCitiesByRegion } from '../services/customerService';
import { uploadImage } from '../services/bucketService';

const ShipTo = () => {
    const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'docs'
    const [customers, setCustomers] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState({}); // { regionId: [cities] }
    const [uploading, setUploading] = useState({ aadhar: false, pan: false });
    const [previews, setPreviews] = useState({ aadhar: null, pan: null });

    const aadharInputRef = useRef(null);
    const panInputRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [custRes, regionRes] = await Promise.all([
                    getAllCustomers(1, 100),
                    getAllRegions()
                ]);
                if (custRes.success) setCustomers(custRes.data.customers || []);
                setRegions(regionRes || []);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        fetchInitialData();
    }, []);

    const fetchCities = async (regionId) => {
        if (!regionId || cities[regionId]) return;
        try {
            const data = await getCitiesByRegion(regionId);
            setCities(prev => ({ ...prev, [regionId]: data }));
        } catch {
            toast.error('Failed to load cities');
        }
    };

    const formik = useFormik({
        initialValues: {
            customerId: '',
            shipToCustomerName: '',
            emailId: '',
            contactNo: '',
            branches: [
                {
                    billingAddress: '',
                    shipToAddress: '',
                    city: '',
                    state: '',
                    stateRefId: '',
                    zipCode: '',
                }
            ],
            // Docs tab
            selectedAddressIndex: 0,
            docName: '',
            docContact: '',
            aadharNo: '',
            aadharImage: '',
            panNo: '',
            panImage: ''
        },
        validationSchema: Yup.object({
            customerId: Yup.string().required('Customer is required'),
            shipToCustomerName: Yup.string().required('Required'),
            emailId: Yup.string().email('Invalid email').required('Required'),
            contactNo: Yup.string().required('Required'),
            branches: Yup.array().of(
                Yup.object().shape({
                    billingAddress: Yup.string().required('Required'),
                    shipToAddress: Yup.string().required('Required'),
                    city: Yup.string().required('Required'),
                    stateRefId: Yup.string().required('Required'),
                    zipCode: Yup.string().required('Required'),
                })
            ),
            // Docs tab validation
            docName: Yup.string().when('activeTabValue', {
                is: 'docs',
                then: () => Yup.string().required('Required')
            }),
            docContact: Yup.string().when('activeTabValue', {
                is: 'docs',
                then: () => Yup.string().required('Required')
            }),
        }),
        onSubmit: async (values) => {
            try {
                const response = await addShipTo(values);
                if (response.success) {
                    toast.success('Ship To details added successfully!');
                    formik.resetForm();
                    setPreviews({ aadhar: null, pan: null });
                }
            } catch {
                toast.error('Failed to submit details');
            }
        }
    });

    // Helper to bypass yup "when" restriction with external state
    formik.values.activeTabValue = activeTab;

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [type]: reader.result }));
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const response = await uploadImage(file);
            const imageUrl = response.data?.url || response.url || response;
            formik.setFieldValue(`${type}Image`, imageUrl);
            toast.success(`${type.toUpperCase()} image uploaded`);
        } catch {
            toast.error(`Failed to upload ${type} image`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleNext = async () => {
        const basicFields = ['customerId', 'shipToCustomerName', 'emailId', 'contactNo', 'branches'];
        const touched = {};
        basicFields.forEach(field => {
            touched[field] = true;
            if (field === 'branches') {
                formik.values.branches.forEach((_, i) => {
                    touched[`branches[${i}].billingAddress`] = true;
                    touched[`branches[${i}].shipToAddress`] = true;
                    touched[`branches[${i}].city`] = true;
                    touched[`branches[${i}].state`] = true;
                    touched[`branches[${i}].zipCode`] = true;
                });
            }
        });
        formik.setTouched(touched);
        const errors = await formik.validateForm();
        const hasBasicErrors = basicFields.some(key => errors[key]);

        if (hasBasicErrors) {
            toast.error('Please fix errors in Basic Details');
            return;
        }
        setActiveTab('docs');
    };

    return (
        <div className="flex flex-col items-center py-8">
            {/* Tabs */}
            <div className="flex gap-6 mb-10">
                <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className={`px-10 py-3 rounded-full border-2 font-bold transition-all min-w-[180px]
                        ${activeTab === 'basic'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-amber-200'}`}
                >
                    Basic Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('docs')}
                    className={`px-10 py-3 rounded-full border-2 font-bold transition-all min-w-[180px]
                        ${activeTab === 'docs'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-amber-200'}`}
                >
                    Documentation
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl p-12 border border-gray-100">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit}>
                        {activeTab === 'basic' ? (
                            <div className="space-y-10">
                                {/* Ship To Details */}
                                <div className="space-y-6">
                                    <h3 className="text-amber-500 font-bold text-lg flex items-center gap-2">
                                        Ship To Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <Select
                                            label="Customer"
                                            name="customerId"
                                            value={formik.values.customerId}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            options={customers.map(c => ({ value: c._id, label: c.shopName }))}
                                            placeholder="Select Customer"
                                            error={formik.touched.customerId && formik.errors.customerId ? { message: formik.errors.customerId } : null}
                                        />
                                        <Input
                                            label="Ship To Customer Name"
                                            name="shipToCustomerName"
                                            value={formik.values.shipToCustomerName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Enter Customer Name"
                                            error={formik.touched.shipToCustomerName && formik.errors.shipToCustomerName ? { message: formik.errors.shipToCustomerName } : null}
                                        />
                                        <Input
                                            label="Email ID"
                                            name="emailId"
                                            type="email"
                                            value={formik.values.emailId}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Enter Email ID"
                                            error={formik.touched.emailId && formik.errors.emailId ? { message: formik.errors.emailId } : null}
                                        />
                                        <Input
                                            label="Contact No."
                                            name="contactNo"
                                            value={formik.values.contactNo}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Enter Contact No."
                                            error={formik.touched.contactNo && formik.errors.contactNo ? { message: formik.errors.contactNo } : null}
                                        />
                                    </div>
                                </div>

                                {/* Address Details */}
                                <FieldArray name="branches">
                                    {({ push, remove }) => (
                                        <div className="space-y-8">
                                            {formik.values.branches.map((branch, index) => (
                                                <div key={index} className="space-y-6 pt-4 border-t border-gray-50 first:border-t-0 relative">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-amber-500 font-bold text-lg flex items-center gap-2">
                                                            Address Details {formik.values.branches.length > 1 ? `#${index + 1}` : ''}
                                                        </h3>
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-semibold"
                                                            >
                                                                <Icon icon="mdi:trash-can-outline" /> Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                        <Input
                                                            label="Billing Address"
                                                            name={`branches[${index}].billingAddress`}
                                                            value={branch.billingAddress}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            placeholder="Enter Billing Address"
                                                            error={formik.touched.branches?.[index]?.billingAddress && formik.errors.branches?.[index]?.billingAddress ? { message: formik.errors.branches[index].billingAddress } : null}
                                                        />
                                                        <Input
                                                            label="Ship To Address"
                                                            name={`branches[${index}].shipToAddress`}
                                                            value={branch.shipToAddress}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            placeholder="Enter Ship To Address"
                                                            error={formik.touched.branches?.[index]?.shipToAddress && formik.errors.branches?.[index]?.shipToAddress ? { message: formik.errors.branches[index].shipToAddress } : null}
                                                        />
                                                        <Select
                                                            label="State (Region)"
                                                            name={`branches[${index}].stateRefId`}
                                                            value={branch.stateRefId}
                                                            onChange={(e) => {
                                                                formik.handleChange(e);
                                                                fetchCities(e.target.value);
                                                                const region = regions.find(r => r._id === e.target.value);
                                                                formik.setFieldValue(`branches[${index}].state`, region?.name || '');
                                                            }}
                                                            onBlur={formik.handleBlur}
                                                            options={regions.map(r => ({ value: r._id, label: r.name }))}
                                                            placeholder="Select State"
                                                            error={formik.touched.branches?.[index]?.stateRefId && formik.errors.branches?.[index]?.stateRefId ? { message: formik.errors.branches[index].stateRefId } : null}
                                                        />
                                                        <Select
                                                            label="City"
                                                            name={`branches[${index}].city`}
                                                            value={branch.city}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            options={(cities[branch.stateRefId] || []).map(c => ({ value: c.name, label: c.name }))}
                                                            placeholder="Select City"
                                                            disabled={!branch.stateRefId}
                                                            error={formik.touched.branches?.[index]?.city && formik.errors.branches?.[index]?.city ? { message: formik.errors.branches[index].city } : null}
                                                        />
                                                        <Input
                                                            label="Zip Code"
                                                            name={`branches[${index}].zipCode`}
                                                            value={branch.zipCode}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            placeholder="Enter Zip Code"
                                                            error={formik.touched.branches?.[index]?.zipCode && formik.errors.branches?.[index]?.zipCode ? { message: formik.errors.branches[index].zipCode } : null}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => push({ billingAddress: '', shipToAddress: '', city: '', state: '', stateRefId: '', zipCode: '' })}
                                                    className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors shadow-md"
                                                >
                                                    <Icon icon="mdi:plus" className="text-xl" />
                                                    Add Branch
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </FieldArray>

                                {/* Actions */}
                                <div className="flex flex-col items-center gap-8 pt-6">
                                    <div className="flex gap-4 w-full justify-center">
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="rounded-full px-16 py-3 font-bold shadow-lg"
                                        >
                                            Next
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => formik.resetForm()}
                                            className="px-16 py-3 rounded-full border-2 border-amber-500 text-amber-500 font-bold hover:bg-amber-50 transition-colors"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <Select
                                        label="Select Address"
                                        name="selectedAddressIndex"
                                        value={formik.values.selectedAddressIndex}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        options={formik.values.branches.map((b, i) => ({ value: i, label: b.shipToAddress || `Branch ${i + 1}` }))}
                                        placeholder="Select Address"
                                    />
                                    <Input
                                        label="Name"
                                        name="docName"
                                        value={formik.values.docName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Name"
                                        error={formik.touched.docName && formik.errors.docName ? { message: formik.errors.docName } : null}
                                    />
                                    <Input
                                        label="Contact"
                                        name="docContact"
                                        value={formik.values.docContact}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Contact No."
                                        error={formik.touched.docContact && formik.errors.docContact ? { message: formik.errors.docContact } : null}
                                    />

                                    <div className="flex items-end gap-4 relative">
                                        <div className="flex-1">
                                            <Input
                                                label="Aadhar Card No."
                                                name="aadharNo"
                                                value={formik.values.aadharNo}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter Aadhar No."
                                            />
                                        </div>
                                        <input type="file" ref={aadharInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'aadhar')} />
                                        <button
                                            type="button"
                                            disabled={uploading.aadhar}
                                            onClick={() => aadharInputRef.current?.click()}
                                            className="mb-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors h-[50px] whitespace-nowrap disabled:opacity-50"
                                        >
                                            {uploading.aadhar ? (
                                                <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                            ) : (
                                                <Icon icon="mdi:plus" className="text-xl" />
                                            )}
                                            {formik.values.aadharImage ? 'Change Image' : 'Add Image'}
                                        </button>
                                        {previews.aadhar && (
                                            <div className="absolute -bottom-16 left-0 w-20 h-14 rounded-lg overflow-hidden border border-amber-200">
                                                <img src={previews.aadhar} alt="Aadhar Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-end gap-4 relative">
                                        <div className="flex-1">
                                            <Input
                                                label="PAN Card No."
                                                name="panNo"
                                                value={formik.values.panNo}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter PAN No."
                                            />
                                        </div>
                                        <input type="file" ref={panInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'pan')} />
                                        <button
                                            type="button"
                                            disabled={uploading.pan}
                                            onClick={() => panInputRef.current?.click()}
                                            className="mb-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors h-[50px] whitespace-nowrap disabled:opacity-50"
                                        >
                                            {uploading.pan ? (
                                                <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                            ) : (
                                                <Icon icon="mdi:plus" className="text-xl" />
                                            )}
                                            {formik.values.panImage ? 'Change Image' : 'Add Image'}
                                        </button>
                                        {previews.pan && (
                                            <div className="absolute -bottom-16 left-0 w-20 h-14 rounded-lg overflow-hidden border border-amber-200">
                                                <img src={previews.pan} alt="PAN Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center pt-16">
                                    <Button
                                        type="submit"
                                        className="rounded-full px-20 py-4 font-bold text-lg shadow-xl"
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('basic')}
                                        className="ml-4 px-10 py-4 rounded-full border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </FormikProvider>
            </div>
        </div>
    );
};

export default ShipTo;
