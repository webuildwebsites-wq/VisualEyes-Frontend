import React, { useEffect } from 'react';
import { FieldArray } from 'formik';
import { Icon } from '@iconify/react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export const AddressDetails = ({ formik, wrapInput, configs, isVerificationMode, rejectedFields, dispatch, isReadOnlyMode }) => {
    useEffect(() => {
        if (!isReadOnlyMode && formik.values.address.length === 1) {
            const firstAddr = formik.values.address[0];
            if (!firstAddr.contactPerson && !firstAddr.contactNumber) {
                formik.setFieldValue('address[0].contactPerson', formik.values.ownerName || '');
                formik.setFieldValue('address[0].contactNumber', formik.values.mobileNo1 || '');
            }
        }
    }, [isReadOnlyMode, formik.values.ownerName, formik.values.mobileNo1]);

    return (
        <div className="space-y-12">
            <FieldArray name="address">
                {({ push, remove }) => (
                    <div className="space-y-12">
                        {formik.values.address.map((addr, index) => (
                            <div key={index} className="relative pt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[#F59E0B] font-bold">Address {index + 1}*</h3>
                                    {index > 0 && !isReadOnlyMode && <button onClick={() => remove(index)} className="text-red-500 text-sm font-bold flex items-center gap-1"><Icon icon="mdi:delete" /> Remove</button>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {wrapInput(Input, {
                                        label: "Branch Address*",
                                        name: `address[${index}].branchAddress`,
                                        value: addr.branchAddress,
                                        placeholder: "Enter Branch Address"
                                    })}
                                    {wrapInput(Input, {
                                        label: "Contact Person Name*",
                                        name: `address[${index}].contactPerson`,
                                        value: addr.contactPerson,
                                        placeholder: "Enter Contact Person"
                                    })}
                                    {wrapInput(Input, {
                                        label: "Contact Number*",
                                        name: `address[${index}].contactNumber`,
                                        value: addr.contactNumber,
                                        placeholder: "Enter Contact Number"
                                    })}
                                    {wrapInput(Input, {
                                        label: "City*",
                                        name: `address[${index}].city`,
                                        value: addr.city,
                                        placeholder: "Enter City"
                                    })}
                                    {wrapInput(Select, {
                                        label: "State*",
                                        name: `address[${index}].state`,
                                        value: addr.state,
                                        options: (Array.isArray(configs.states) ? configs.states : []).map(z => ({ value: z.name, label: z.name }))
                                    })}
                                    {wrapInput(Select, {
                                        label: "Country*",
                                        name: `address[${index}].country`,
                                        value: addr.country,
                                        options: [{ value: 'India', label: 'India' }]
                                    })}
                                    {wrapInput(Select, {
                                        label: "Billing Currency*",
                                        name: `address[${index}].billingCurrency`,
                                        value: addr.billingCurrency,
                                        options: [{ value: 'Indian Rupees', label: 'Indian Rupees' }]
                                    })}
                                    {wrapInput(Select, {
                                        label: "Billing Mode*",
                                        name: `address[${index}].billingMode`,
                                        value: addr.billingMode,
                                        options: [{ value: 'Credit', label: 'Credit' }, { value: 'Advance', label: 'Advance' }]
                                    })}
                                    {wrapInput(Input, {
                                        label: "Pincode*",
                                        name: `address[${index}].zipCode`,
                                        value: addr.zipCode,
                                        placeholder: "Enter Pincode"
                                    })}
                                </div>
                            </div>
                        ))}
                        {!isReadOnlyMode && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    variant="outlined"
                                    onClick={() => push({
                                        branchAddress: '',
                                        contactPerson: formik.values.ownerName || '',
                                        contactNumber: formik.values.mobileNo1 || '',
                                        city: '',
                                        state: '',
                                        country: 'India',
                                        billingCurrency: 'Indian Rupees',
                                        billingMode: 'Credit',
                                        zipCode: ''
                                    })}
                                    className="bg-[#F59E0B] text-white rounded-full px-10 py-3 flex items-center gap-2 w-fit hover:text-black hover:bg-[#D97706]"
                                >
                                    <Icon icon="mdi:plus" /> Add Address
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </FieldArray>
        </div>
    );
};
