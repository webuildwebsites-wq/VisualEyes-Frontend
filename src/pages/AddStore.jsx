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
                <Input label="Shop Name" placeholder="Enter Shop Name" />
                <Input label="Owner Name" placeholder="Enter Owner Name" />

                <Select
                    label="Customer Type"
                    placeholder="Select Customer Type"
                    options={[{ label: 'Retail', value: 'retail' }, { label: 'Wholesale', value: 'wholesale' }]}
                />
                <Select
                    label="Order Mode"
                    placeholder="Select Order Mode"
                    options={[{ label: 'Online', value: 'online' }, { label: 'Offline', value: 'offline' }]}
                />

                <Select
                    label="Billing Mode"
                    placeholder="Select Billing Mode"
                    options={[{ label: 'Prepaid', value: 'prepaid' }, { label: 'Postpaid', value: 'postpaid' }]}
                />
                <Input label="Email ID" placeholder="Enter Email ID" />

                <Input label="Mobile No. 1" placeholder="Enter Mobile No. 1" />
                <Input label="Mobile No. 2" placeholder="Enter Mobile No. 2" />

                <Input label="Landline No." placeholder="Enter Landline No." />
                <Select
                    label="GST Type"
                    placeholder="Select GST Type"
                    options={[{ label: 'Registered', value: 'registered' }, { label: 'Unregistered', value: 'unregistered' }]}
                />

                <Select
                    label="Plant"
                    placeholder="Select Plant"
                    options={[{ label: 'Plant A', value: 'A' }]}
                />
                <Select
                    label="Lab"
                    placeholder="Select Lab"
                    options={[{ label: 'Lab 1', value: '1' }]}
                />
                <Select
                    label="Fitting Centre"
                    placeholder="Select Fitting Centre"
                    options={[{ label: 'Centre 1', value: '1' }]}
                />
                <Select
                    label="Credit Day"
                    placeholder="Select Credit Day"
                    options={[{ label: '30 Days', value: '30' }]}
                />

                <Input label="Credit Limit" placeholder="Enter Credit Limit" />
                <Select
                    label="DC Without Value"
                    placeholder="Select Option"
                    options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                />

                <Input label="Courier" placeholder="Select Courier" />
                <Select
                    label="Courier Time"
                    placeholder="Select Courier Time"
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
                <Input label="Address Line 1" placeholder="Enter Address 1" />
                <Input label="Address Line 2" placeholder="Enter Address 2" />

                <Input label="City" placeholder="Enter City" />
                <Select
                    label="State"
                    placeholder="Select State"
                    options={[{ label: 'State 1', value: 's1' }]}
                />
                <Select
                    label="Country"
                    placeholder="Select Country"
                    options={[{ label: 'Country 1', value: 'c1' }]}
                />
                <Select
                    label="Currency"
                    placeholder="Select Currency"
                    options={[{ label: 'USD', value: 'usd' }]}
                />
                <Input label="Zip Code" placeholder="Enter Zip Code" />
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
                <Input label="Username" placeholder="Enter Username" />
                <Select
                    label="User Type"
                    placeholder="Select User Type"
                    options={[{ label: 'Admin', value: 'admin' }]}
                />
                <Select
                    label="Designation"
                    placeholder="Select Designation"
                    options={[{ label: 'Manager', value: 'manager' }]}
                />
                <Select
                    label="Sales Person"
                    placeholder="Select Sales Person"
                    options={[{ label: 'John', value: 'john' }]}
                />
                <Select
                    label="Zone"
                    placeholder="Select Zone"
                    options={[{ label: 'North', value: 'north' }]}
                />
                <Select
                    label="Has Flat Fitting"
                    placeholder="Select Option"
                    options={[{ label: 'Yes', value: 'yes' }]}
                />
                <Input label="Specific Brand" placeholder="Enter Specific Brand" />
                <Input label="Specific Category" placeholder="Enter Specific Category" />
                <Input label="Specific Lab" placeholder="Enter Specific Lab" />
            </div>

            {/* <div className="flex justify-center gap-6 mt-12">
                <button onClick={() => console.log('Draft')} className="px-8 py-3 rounded-full border-2 border-amber-500 text-amber-500 font-semibold hover:bg-amber-50 transition-colors min-w-[160px]">
                    Create Draft
                </button>
                <button onClick={() => console.log('Submit')} className="px-8 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all min-w-[160px]">
                    Submit
                </button>
            </div> */}
        </>
    );

    const renderStep4 = () => (
        <>
            <div className={headerStyle}>
                Ship To Customer Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Select
                    label="Customer"
                    placeholder="Select Customer"
                    options={[{ label: 'Existing Customer', value: 'existing' }]}
                />
                <Input label="Customer Name" placeholder="Enter Customer Name" />
                <Input label="Email ID" placeholder="Enter Email ID" />
                <Input label="Mobile No." placeholder="Enter Mobile No." />
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
                {/* Wizard Navigation */}
                <div className="flex flex-col items-center gap-8 mt-12 pb-8">

                    {/* Dots */}
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map(step => (
                            <div
                                key={step}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-amber-500 w-8' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 w-full max-w-md">
                        {/* Prev Button */}
                        <div className="flex-1">
                            {currentStep > 1 ? (
                                <Button variant="outlined" onClick={handlePrev}>
                                    Previous
                                </Button>
                            ) : (
                                <div className="w-full"></div> /* Spacer */
                            )}
                        </div>

                        {/* Refresh Button */}
                        <div className="flex-1">
                            <Button variant="outlined" onClick={() => window.location.reload()}>
                                Refresh
                            </Button>
                        </div>

                        {/* Next/Submit Button */}
                        <div className="flex-1">
                            {currentStep < totalSteps ? (
                                <Button variant="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button variant="primary" onClick={() => console.log('Submit')}>
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStore;
