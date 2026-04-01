import React, { useState, useEffect, useMemo } from 'react';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';
import CustomToggle from '../components/ui/CustomToggle';

import { getAllCustomers, getCustomerById, getCustomerConfigs } from '../services/customerService';

const OrderWizard = () => {
    const user = useSelector((state) => state.auth.user);
    const [activeStep, setActiveStep] = useState(0);
    const [customers, setCustomers] = useState([]);
    const [configs, setConfigs] = useState({});
    const [loadingConfigs, setLoadingConfigs] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [shipToAddresses, setShipToAddresses] = useState([]);

    const steps = ['Customer Details', 'Product Details', 'Advanced Details'];

    // Initial Form Values
    const initialValues = {
        // Customer Details
        customerId: '',
        shipToId: '',
        labId: '',
        orderReference: '',
        consumerCardName: '',
        opticianName: '',
        customerBalance: '0.00',

        // Product Details
        powerMode: 'both', // single | both
        productMode: 'rx', // stock | rx
        hasPrism: 'no', // yes | no
        powerTable: {
            R: { sph: '', cyl: '', axis: '', add: '', dia: '' },
            L: { sph: '', cyl: '', axis: '', add: '', dia: '' }
        },
        prismTable: {
            R: { prism: '', base: '' },
            L: { prism: '', base: '' }
        },
        brandId: '',
        categoryId: '',
        treatmentId: '',
        indexId: '',
        lensTypeId: '',
        coatingId: '',
        tintId: '',
        tintDetails: '',
        remarks: '',
        hasMirror: 'no', // yes | no
        centrationData: {
            R: { pd: '', corridor: '', fittingHeight: '' },
            L: { pd: '', corridor: '', fittingHeight: '' }
        },

        // Advanced Details
        hasFlatFitting: 'no', // yes | no
        dbl: '',
        frameType: '',
        frameLength: '',
        frameHeight: '',
        pantoscopicAngle: '',
        bowAngle: '',
        bvd: '',
        directCustomer: '',
        shippingCharges: '',
        otherCharges: ''
    };

    const validationSchema = Yup.object().shape({
        customerId: Yup.string().required('Customer is required'),
        // Add more validations as needed
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            console.log('Order Submitted:', values);
            toast.success('Order submitted successfully!');
        }
    });

    // Load initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [custRes, configRes] = await Promise.all([
                    getAllCustomers(1, 1000),
                    getCustomerConfigs()
                ]);
                if (custRes.success) setCustomers(custRes.data.customers || []);
                setConfigs(configRes);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast.error('Failed to initialize page');
            } finally {
                setLoadingConfigs(false);
            }
        };
        fetchInitialData();
    }, []);

    // Handle Customer Change
    const handleCustomerChange = async (customerId) => {
        formik.setFieldValue('customerId', customerId);
        if (!customerId) {
            setSelectedCustomer(null);
            setShipToAddresses([]);
            return;
        }

        try {
            const res = await getCustomerById(customerId);
            if (res.success) {
                const customer = res.data;
                setSelectedCustomer(customer);
                setShipToAddresses(customer.customerShipToDetails || []);
            }
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
        }
    };

    const customerOptions = useMemo(() =>
        customers.map(c => ({ value: c._id, label: `${c.shopName} (${c.customerCode || 'N/A'})` }))
        , [customers]);

    const shipToOptions = useMemo(() =>
        shipToAddresses.map(addr => ({
            value: addr._id,
            label: `${addr.branchName} - ${addr.city}`
        }))
        , [shipToAddresses]);

    // Simplified wrapInput for OrderWizard
    const wrapInput = (Component, props) => {
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
            <Component
                {...props}
                error={fieldTouched && fieldError ? { message: fieldError } : null}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={fieldValue ?? ''}
            />
        );
    };

    const isStepValid = (idx) => {
        // Simple logic for now, can be expanded
        return true;
    };

    const toggleAccordion = (idx) => {
        if (activeStep === idx) setActiveStep(-1);
        else setActiveStep(idx);
    };

    const renderCustomerDetails = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 p-10 bg-white rounded-b-2xl border-t border-gray-50">
            <div className="col-span-1">
                <SearchableSelect
                    label="Select Customer"
                    name="customerId"
                    value={formik.values.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    options={customerOptions}
                    placeholder="Search by Shop Name or Code"
                />
            </div>
            {wrapInput(Select, {
                label: "Select Ship To",
                name: "shipToId",
                placeholder: "Select Ship To Address",
                options: shipToOptions,
                disabled: !formik.values.customerId
            })}

            <div className="col-span-full py-2">
                <p className="text-sm font-black text-[#fe9a00] uppercase tracking-widest bg-orange-50/50 px-4 py-2 rounded-xl border border-orange-100/50 inline-block">
                    Customer Balance: <span className="text-gray-900 ml-2">₹ {selectedCustomer?.creditLimit || '0.00'}</span>
                </p>
            </div>

            {wrapInput(Select, {
                label: "Select Lab",
                name: "labId",
                options: (configs.labs || []).map(l => ({ value: l._id, label: l.name })),
                placeholder: "Select Lab"
            })}
            {wrapInput(Input, {
                label: "Order Reference",
                name: "orderReference",
                placeholder: "Enter Order Reference"
            })}
            {wrapInput(Input, {
                label: "Consumer Card Name",
                name: "consumerCardName",
                placeholder: "Enter Consumer Card Name"
            })}
            {wrapInput(Input, {
                label: "Optician's Name",
                name: "opticianName",
                placeholder: "Enter Optician's Name"
            })}
        </div>
    );

    const renderProductDetails = () => (
        <div className="p-10 space-y-12 bg-white rounded-b-2xl border-t border-gray-50">
            {/* Toggles Row */}
            <div className="flex flex-wrap gap-10 items-end">
                <CustomToggle
                    label="Power Details"
                    value={formik.values.powerMode}
                    onChange={(v) => formik.setFieldValue('powerMode', v)}
                    options={[{ label: 'Single', value: 'single' }, { label: 'Both', value: 'both' }]}
                    containerClassName="w-64"
                />
                <CustomToggle
                    label="Product Details"
                    value={formik.values.productMode}
                    onChange={(v) => formik.setFieldValue('productMode', v)}
                    options={[{ label: 'Stock Lens', value: 'stock' }, { label: 'Rx', value: 'rx' }]}
                    containerClassName="w-64"
                />
                <CustomToggle
                    label="Has Prism"
                    value={formik.values.hasPrism}
                    onChange={(v) => formik.setFieldValue('hasPrism', v)}
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                    containerClassName="w-64"
                />
            </div>

            {/* Power Tables Row */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Power Table */}
                <div className="flex-1 bg-gray-50/50 border border-gray-200/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-6 bg-gray-100/80 border-b border-gray-200">
                        {['SIDE', 'SPH', 'CYLD', 'AXIS', 'ADD', 'DIAMETER'].map(h => (
                            <div key={h} className="py-2.5 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center border-r border-gray-200 last:border-r-0 italic">{h}</div>
                        ))}
                    </div>
                    {['R', 'L'].map((side, sIdx) => {
                        if (side === 'L' && formik.values.powerMode === 'single') return null;
                        return (
                            <div key={side} className={`grid grid-cols-6 border-b border-gray-100 last:border-b-0 items-center ${side === 'L' ? 'bg-orange-50/20' : ''}`}>
                                <div className="py-4 font-black text-gray-500 text-center border-r border-gray-100 italic">{side}</div>
                                {['sph', 'cyl', 'axis', 'add', 'dia'].map(field => (
                                    <div key={field} className="p-1 border-r border-gray-100 last:border-r-0">
                                        <input
                                            type="text"
                                            name={`powerTable.${side}.${field}`}
                                            value={formik.values.powerTable[side][field]}
                                            onChange={formik.handleChange}
                                            className="w-full h-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none focus:bg-white transition-colors"
                                            placeholder="..."
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Prism Table */}
                {formik.values.hasPrism === 'yes' && (
                    <div className="w-full lg:w-72 bg-gray-50/50 border border-gray-200/50 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-3 bg-gray-100/80 border-b border-gray-200">
                            {['SIDE', 'PRISM', 'BASE SEL.'].map(h => (
                                <div key={h} className="py-2.5 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center border-r border-gray-200 last:border-r-0 italic">{h}</div>
                            ))}
                        </div>
                        {['R', 'L'].map((side) => {
                            if (side === 'L' && formik.values.powerMode === 'single') return null;
                            return (
                                <div key={side} className="grid grid-cols-3 border-b border-gray-100 last:border-b-0 items-center">
                                    <div className="py-4 font-black text-gray-500 text-center border-r border-gray-100 italic">{side}</div>
                                    <div className="p-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            name={`prismTable.${side}.prism`}
                                            value={formik.values.prismTable[side].prism}
                                            onChange={formik.handleChange}
                                            className="w-full h-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none focus:bg-white transition-colors"
                                            placeholder="..."
                                        />
                                    </div>
                                    <div className="p-1">
                                        <input
                                            type="text"
                                            name={`prismTable.${side}.base`}
                                            value={formik.values.prismTable[side].base}
                                            onChange={formik.handleChange}
                                            className="w-full h-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none focus:bg-white transition-colors"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rest of the Product Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                {wrapInput(Select, {
                    label: "Select Brand",
                    name: "brandId",
                    options: (configs.brands || []).map(b => ({ value: b._id, label: b.name })),
                    placeholder: "Select Brand"
                })}
                {wrapInput(Select, {
                    label: "Select Category",
                    name: "categoryId",
                    options: (configs.categories || []).map(c => ({ value: c._id, label: c.name })),
                    placeholder: "Select Category"
                })}
                {wrapInput(Select, {
                    label: "Treatment",
                    name: "treatmentId",
                    placeholder: "Treatment",
                    options: [] // To be filled from configs
                })}
                {wrapInput(Select, {
                    label: "Index",
                    name: "indexId",
                    placeholder: "Index",
                    options: [] // To be filled from configs
                })}
                {wrapInput(Select, {
                    label: "Lens Type",
                    name: "lensTypeId",
                    placeholder: "Lens Type",
                    options: [] // To be filled from configs
                })}
                {wrapInput(Select, {
                    label: "Coating",
                    name: "coatingId",
                    placeholder: "Coating",
                    options: [] // To be filled from configs
                })}
                {wrapInput(Select, {
                    label: "Tint",
                    name: "tintId",
                    placeholder: "Tint",
                    options: [] // To be filled from configs
                })}
                {wrapInput(Input, {
                    label: "Tint Details",
                    name: "tintDetails",
                    placeholder: "Tint Details"
                })}
                {wrapInput(Input, {
                    label: "Remarks",
                    name: "remarks",
                    placeholder: "Enter Remarks"
                })}
            </div>

            {/* Mirror Toggle */}
            <div className="flex items-center gap-10">
                <CustomToggle
                    label="Mirror"
                    value={formik.values.hasMirror}
                    onChange={(v) => formik.setFieldValue('hasMirror', v)}
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                    containerClassName="w-64"
                />
            </div>

            {/* Centration Table */}
            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#fe9a00] italic">Centration Data:</h4>
                <div className="bg-gray-50/50 border border-gray-200/50 rounded-2xl overflow-hidden shadow-sm max-w-4xl">
                    <div className="grid grid-cols-4 bg-gray-100/80 border-b border-gray-200">
                        {['SIDE', 'PD', 'CORRIDOR', 'FITTING HEIGHT'].map(h => (
                            <div key={h} className="py-2.5 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center border-r border-gray-200 last:border-r-0 italic">{h}</div>
                        ))}
                    </div>
                    {['R', 'L'].map((side) => {
                        if (side === 'L' && formik.values.powerMode === 'single') return null;
                        return (
                            <div key={side} className="grid grid-cols-4 border-b border-gray-100 last:border-b-0 items-center">
                                <div className="py-4 font-black text-gray-500 text-center border-r border-gray-100 italic">{side}</div>
                                {['pd', 'corridor', 'fittingHeight'].map(field => (
                                    <div key={field} className="p-1 border-r border-gray-100 last:border-r-0">
                                        <input
                                            type="text"
                                            name={`centrationData.${side}.${field}`}
                                            value={formik.values.centrationData[side][field]}
                                            onChange={formik.handleChange}
                                            className="w-full h-10 bg-transparent text-center font-bold text-gray-700 focus:outline-none focus:bg-white transition-colors"
                                            placeholder="..."
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderAdvancedDetails = () => (
        <div className="p-10 space-y-12 bg-white rounded-b-2xl border-t border-gray-50">
            {/* Fitting Data */}
            <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#fe9a00] italic">Fitting Data</h4>
                <CustomToggle
                    label="Has Flat Fitting"
                    value={formik.values.hasFlatFitting}
                    onChange={(v) => formik.setFieldValue('hasFlatFitting', v)}
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                    containerClassName="w-64"
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">



                    {wrapInput(Select, { label: "Frame Type", name: "frameType", placeholder: "Select Frame Type", options: [] })}
                    {wrapInput(Input, { label: "Frame Length", name: "frameLength", placeholder: "Frame Length" })}
                    {wrapInput(Input, { label: "Frame Height", name: "frameHeight", placeholder: "Frame Height" })}
                    {wrapInput(Input, { label: "DBL", name: "dbl", placeholder: "DBL" })}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Lens Data */}
            <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#fe9a00] italic">Lens Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {wrapInput(Input, { label: "Pantoscopic Angle", name: "pantoscopicAngle", placeholder: "Pantoscopic Angle" })}
                    {wrapInput(Input, { label: "Bow Angle", name: "bowAngle", placeholder: "Bow Angle" })}
                    {wrapInput(Input, { label: "BVD", name: "bvd", placeholder: "BVD" })}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Other Data */}
            <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#fe9a00] italic">Other Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {wrapInput(Select, { label: "Direct Customer", name: "directCustomer", placeholder: "Direct Customer", options: [] })}
                    {wrapInput(Input, { label: "Shipping Charges", name: "shippingCharges", placeholder: "Shipping Charges" })}
                    {wrapInput(Input, { label: "Other Charges", name: "otherCharges", placeholder: "Other Charges" })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 bg-gray-50/50">


            <div className="max-w-6xl mx-auto">
                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit} className="space-y-6 pb-20">
                        {steps.map((label, idx) => {
                            const isActive = activeStep === idx;
                            const isCompleted = idx < activeStep;

                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-2xl border transition-all duration-500 ${isActive
                                        ? 'shadow-2xl ring-1 ring-[#fe9a00]/10 border-[#fe9a00]/20'
                                        : 'shadow-sm border-gray-100'
                                        }`}
                                >
                                    {/* Accordion Header - 1:1 with RegisterCustomer */}
                                    <button
                                        type="button"
                                        onClick={() => toggleAccordion(idx)}
                                        className="w-full flex items-center justify-between p-6 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                                                ? 'bg-[#fe9a00] text-white shadow-lg rotate-12 scale-110'
                                                : isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-400 group-hover:bg-orange-50'
                                                }`}>
                                                {isCompleted ? <Icon icon="mdi:check" className="text-xl" /> : <span className="font-black italic text-lg">{idx + 1}</span>}
                                            </div>
                                            <div className="text-left">
                                                <h3 className={`font-black uppercase tracking-widest text-sm transition-colors ${isActive ? 'text-[#fe9a00]' : 'text-gray-700'
                                                    }`}>
                                                    {label}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {isActive ? 'Currently Editing' : isCompleted ? 'Entry Complete' : 'Pending Details'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-orange-50 rotate-180' : 'bg-gray-50'}`}>
                                            <Icon icon="mdi:chevron-down" className={`text-xl ${isActive ? 'text-[#fe9a00]' : 'text-gray-400'}`} />
                                        </div>
                                    </button>

                                    {/* Accordion Content - Sync Padding */}
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-[3000px] opacity-100 pb-12' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                        <div className="px-8 md:px-12 pt-0">
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-12" />
                                            {idx === 0 && renderCustomerDetails()}
                                            {idx === 1 && renderProductDetails()}
                                            {idx === 2 && renderAdvancedDetails()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Submission Buttons - Styled like RegisterCustomer Footer */}
                        <div className="flex justify-center gap-6 pt-10">
                            <button
                                type="submit"
                                className="flex items-center px-10 py-4 bg-[#fe9a00] text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-[#e68a00] transition-all active:scale-95 disabled:opacity-50"
                                disabled={formik.isSubmitting}
                            >
                                <Icon icon="mdi:check-circle" className="mr-2 text-xl" />
                                {formik.isSubmitting ? 'Processing...' : 'Place Final Order'}
                            </button>
                            <button
                                type="button"
                                onClick={() => console.log('Draft Saving')}
                                className="flex items-center px-10 py-4 bg-white border-2 border-gray-200 text-gray-600 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            >
                                <Icon icon="mdi:content-save-outline" className="mr-2 text-xl text-gray-400" />
                                Save As Draft
                            </button>
                        </div>
                    </form>
                </FormikProvider>
            </div>
        </div>
    );
};

export default OrderWizard;
