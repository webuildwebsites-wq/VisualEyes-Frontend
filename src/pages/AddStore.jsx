import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Icon } from '@iconify/react';

const AddStore = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Shared Styles 
    const headerStyle = "bg-amber-500 text-white py-4 px-8 rounded-full mb-8 shadow-lg text-center text-lg font-medium shadow-amber-500/20";

    // Step 1: Shop Details (Customer Details 1)
    const renderStep1 = () => (
        <>
            <div className={headerStyle}>
                Shop Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Input placeholder="Shop Name" />
                <Input placeholder="Owner Name" />

                <Select
                    placeholder="Customer Type"
                    options={[{ label: 'Retail', value: 'retail' }, { label: 'Wholesale', value: 'wholesale' }]}
                />
                <Select
                    placeholder="Select Order Mode"
                    options={[{ label: 'Online', value: 'online' }, { label: 'Offline', value: 'offline' }]}
                />

                <Select
                    placeholder="Billing Mode"
                    options={[{ label: 'Prepaid', value: 'prepaid' }, { label: 'Postpaid', value: 'postpaid' }]}
                />
                <Input placeholder="Email ID" />

                <Input placeholder="Mobile No. 1" />
                <Input placeholder="Mobile No. 2" />

                <Input placeholder="Landline No." />
                <Select
                    placeholder="GST Type"
                    options={[{ label: 'Registered', value: 'registered' }, { label: 'Unregistered', value: 'unregistered' }]}
                />

                <Select
                    placeholder="Select Plant"
                    options={[{ label: 'Plant A', value: 'A' }]}
                />
                <Select
                    placeholder="Select Lab"
                    options={[{ label: 'Lab 1', value: '1' }]}
                />
                <Select
                    placeholder="Select Fitting Centre"
                    options={[{ label: 'Centre 1', value: '1' }]}
                />
                <Select
                    placeholder="Select Credit Day"
                    options={[{ label: '30 Days', value: '30' }]}
                />

                <Input placeholder="Credit Limit" />
                <Select
                    placeholder="DC Without Value"
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                />

                <Input placeholder="Select Courier" />
                <Select
                    placeholder="Courier Time"
                    options={[{ label: 'Morning', value: 'morning' }]}
                />

            </div>
        </>
    );

    // Step 2: Address Details
    const renderStep2 = () => (
        <>
            <div className={headerStyle}>
                Address Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Input placeholder="Address 1" />
                <Input placeholder="Address 2" />

                <Input placeholder="City" />
                <Select
                    placeholder="Select State"
                    options={[{ label: 'State 1', value: 's1' }]}
                />
                <Select
                    placeholder="Select Country"
                    options={[{ label: 'Country 1', value: 'c1' }]}
                />
                <Select
                    placeholder="Select Currency"
                    options={[{ label: 'USD', value: 'usd' }]}
                />
                <Input placeholder="Zip Code" />
            </div>
        </>
    );

    // Step 3: Login Details
    const renderStep3 = () => (
        <>
            <div className={headerStyle}>
                Login Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Input placeholder="Username" />
                <Select
                    placeholder="User Type"
                    options={[{ label: 'Admin', value: 'admin' }]}
                />
                <Select
                    placeholder="Designation"
                    options={[{ label: 'Manager', value: 'manager' }]}
                />
                <Select
                    placeholder="Sales Person"
                    options={[{ label: 'John', value: 'john' }]}
                />
                <Select
                    placeholder="Zone"
                    options={[{ label: 'North', value: 'north' }]}
                />
                <Select
                    placeholder="Has Flat Fitting"
                    options={[{ label: 'Yes', value: 'yes' }]}
                />
                <Input placeholder="Specific Brand" />
                <Input placeholder="Specific Category" />
                <Input placeholder="Specific Lab" />
            </div>

            <div className="flex justify-center gap-6 mt-12">
                <button onClick={() => console.log('Draft')} className="px-8 py-3 rounded-full border-2 border-amber-500 text-amber-500 font-semibold hover:bg-amber-50 transition-colors min-w-[160px]">
                    Create Draft
                </button>
                <button onClick={() => console.log('Submit')} className="px-8 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all min-w-[160px]">
                    Submit
                </button>
            </div>
        </>
    );

    const renderStep4 = () => (
        <>
            <div className={headerStyle}>
                Ship To Customer Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Select
                    placeholder="Customer"
                    options={[{ label: 'Existing Customer', value: 'existing' }]}
                />
                <Input placeholder="Customer Name" />
                <Input placeholder="Email Id" />
                <Input placeholder="Mobile No." />
            </div>
        </>
    );


    return (
        <div className="relative">

            <div className="p-4 md:p-8 min-h-[600px] max-w-4xl mx-auto relative">
                <form>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </form>

                {/* Wizard Navigation */}
                <div className="flex items-center justify-center gap-4 mt-16">
                    {currentStep > 1 && (
                        <button onClick={handlePrev} className="text-amber-500 hover:text-amber-600 transition-colors">
                            <Icon icon="mdi:chevron-left" className="w-8 h-8" />
                        </button>
                    )}

                    {/* Dots */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(step => (
                            <div
                                key={step}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-amber-500 scale-125' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    {currentStep < totalSteps && (
                        <button onClick={handleNext} className="text-amber-500 hover:text-amber-600 transition-colors">
                            <Icon icon="mdi:chevron-right" className="w-8 h-8" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStore;
