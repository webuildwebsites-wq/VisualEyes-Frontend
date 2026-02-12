import React, { useState } from 'react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Icon } from '@iconify/react';

const OrderWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [powerMode, setPowerMode] = useState('both'); // single | both
    const totalSteps = 2;

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Shared Styles
    const headerStyle = "bg-amber-500 text-white py-4 px-8 rounded-full mb-8 shadow-lg text-center text-lg font-medium shadow-amber-500/20";

    // Step 1: Product Details (New Order 1)
    const renderStep1 = () => (
        <>
            <div className={headerStyle}>
                Product Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Select placeholder="Brand" options={[{ label: 'Brand A', value: 'a' }]} />
                <Select placeholder="Category" options={[{ label: 'Cat A', value: 'a' }]} />

                <Select placeholder="Treatment" options={[{ label: 'Hard', value: 'hard' }]} />
                <Select placeholder="Lens Type" options={[{ label: 'Single Vision', value: 'sv' }]} />

                <Select placeholder="Coating" options={[{ label: 'Anti-Glare', value: 'ag' }]} />
                <Input placeholder="Price" />

                <Select placeholder="Tinting" options={[{ label: 'Grey', value: 'grey' }]} />
                <Input placeholder="Additional Info On Tints" />

                <Select placeholder="Left Diameter" options={[{ label: '65', value: '65' }]} />
                <Select placeholder="Right Diameter" options={[{ label: '65', value: '65' }]} />
            </div>

            {/* Additional Comments (Full Width) */}
            <div className="mt-6">
                <textarea
                    placeholder="Additional Comments"
                    className="w-full bg-gray-200/80 border-none rounded-3xl p-6 h-32 text-gray-700 focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
                ></textarea>
            </div>
        </>
    );

    // Step 2: Power Details (New Order 2)
    const renderStep2 = () => (
        <>
            <div className={headerStyle}>
                Power Details
            </div>

            {/* Toggle Switch */}
            <div className="flex justify-center mb-8">
                <div className="flex bg-gray-200 rounded-full p-1 w-64">
                    <button
                        onClick={() => setPowerMode('single')}
                        className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${powerMode === 'single' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500'}`}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => setPowerMode('both')}
                        className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${powerMode === 'both' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500'}`}
                    >
                        Both
                    </button>
                </div>
            </div>

            {/* Power Table */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-8">
                {/* Header Row */}
                <div className="grid grid-cols-6 border-b border-gray-100 text-center">
                    <div className="py-4 font-semibold text-amber-500 border-r border-gray-100">Side</div>
                    <div className="py-4 font-semibold text-amber-500 border-r border-gray-100">SPH</div>
                    <div className="py-4 font-semibold text-amber-500 border-r border-gray-100">Cyld</div>
                    <div className="py-4 font-semibold text-amber-500 border-r border-gray-100">Axis</div>
                    <div className="py-4 font-semibold text-amber-500 border-r border-gray-100">Add</div>
                    <div className="py-4 font-semibold text-amber-500">Qty</div>
                </div>

                {/* Right Eye Row */}
                <div className="grid grid-cols-6 border-b border-gray-100 text-center items-center h-16">
                    <div className="font-semibold text-gray-700 border-r border-gray-100 h-full flex items-center justify-center">R</div>
                    <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Sphere" /></div>
                    <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Cylinder" /></div>
                    <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Axis" /></div>
                    <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Addition" /></div>
                    <div className="h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="XX" /></div>
                </div>

                {/* Left Eye Row (only if Both) */}
                {powerMode === 'both' && (
                    <div className="grid grid-cols-6 text-center items-center h-16">
                        <div className="font-semibold text-gray-700 border-r border-gray-100 h-full flex items-center justify-center">L</div>
                        <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Sphere" /></div>
                        <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Cylinder" /></div>
                        <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Axis" /></div>
                        <div className="border-r border-gray-100 h-full p-2"><Input containerClassName="mb-0 h-full" className="h-full w-full text-center bg-transparent focus:bg-gray-50 rounded-lg" placeholder="Addition" /></div>
                        <div className="h-full p-2 bg-gray-50"></div>
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-6 mt-12">
                <button onClick={() => console.log('Draft')} className="px-8 py-3 rounded-full border-2 border-amber-500 text-amber-500 font-semibold hover:bg-amber-50 transition-colors min-w-[160px]">
                    Create Draft
                </button>
                <button onClick={() => console.log('Submit')} className="px-8 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all min-w-[160px]">
                    Place Order
                </button>
            </div>
        </>
    );

    return (
        <div className="relative max-w-6xl mx-auto">
            <div className="p-4 md:p-8  min-h-[600px] relative">
                <form>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                </form>

                {/* Wizard Navigation */}
                <div className="flex items-center justify-center gap-4 mt-16">
                    {/* Previous Button styled as simple yellow arrow for now, matching first wizard style if needed */}
                    {currentStep > 1 && (
                        <button onClick={handlePrev} className="text-amber-500 hover:text-amber-600 transition-colors">
                            <Icon icon="mdi:chevron-left" className="w-8 h-8" />
                        </button>
                    )}

                    {/* Dots - specific style in screenshot: Grey small dots, Active is Yellow Arrow? No, screenshot shows Yellow Arrow on the right, and GREY DOTS for progress. */}
                    <div className="flex gap-2">
                        {[1, 2].map(step => (
                            <div
                                key={step}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-amber-500 scale-125' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    {/* Next Button - Yellow Arrow */}
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

export default OrderWizard;
