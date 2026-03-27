import React, { useEffect } from 'react';
import { FieldArray } from 'formik';
import { Icon } from '@iconify/react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { BrandRow } from './BrandRow';
import { FileUploadField } from './shared';

export const BusinessInformation = ({ formik, wrapInput, configs, isReadOnlyMode, isApprovalMode, handleFileUpload, uploading }) => {

    useEffect(() => {
        if (!isReadOnlyMode && !isApprovalMode) {
            const minSales = Number(formik.values.minSalesValue) || 0;

            // Calculate Final Discount Percent
            let newDiscount = 0;
            if (minSales >= 1000) {
                newDiscount = Math.min(20, (minSales / 1000) * 0.5);
            }
            if (formik.values.finalDiscount !== newDiscount) {
                formik.setFieldValue('finalDiscount', newDiscount);
            }

            // Calculate Credit Limit
            let newCreditLimit = 0;
            const creditDaysObj = (configs.creditDays || []).find(d => d._id === formik.values.creditDaysRefId);
            if (minSales > 0 && creditDaysObj) {
                const days = Number(creditDaysObj.days) || 0;
                newCreditLimit = minSales * ((days + 30) / 30);
            }
            if (formik.values.creditLimit !== newCreditLimit) {
                formik.setFieldValue('creditLimit', newCreditLimit);
            }
        }
    }, [formik.values.minSalesValue, formik.values.creditDaysRefId, configs.creditDays, isReadOnlyMode, isApprovalMode]);

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {wrapInput(Select, {
                    label: 'Business Category*',
                    name: 'businessTypeRefId',
                    options: (configs.businessTypes || []).map(b => ({ value: b._id, label: b.name }))
                })}
                {wrapInput(Input, { label: 'Min. Sales Value (/Month sales)', name: 'minSalesValue', placeholder: 'Enter Min Sales Value', type: 'number' })}
                {wrapInput(Input, { label: 'Currently Dealt Brands', name: 'currentlyDealtBrands', placeholder: 'E.g., Lenskart, Titan, etc.' })}
                {wrapInput(Select, {
                    label: 'Credit Days*',
                    name: 'creditDaysRefId',
                    options: (configs.creditDays || []).map(d => ({ value: d._id, label: d.days?.toString() || '' }))
                })}
                {wrapInput(Input, { label: 'Final Discount (%)', name: 'finalDiscount', placeholder: 'Auto-Calculated', type: 'number', disabled: true, className: 'bg-gray-100 text-gray-500' })}
                {wrapInput(Input, { label: 'Proposed Discount (%)', name: 'proposedDiscount', placeholder: 'Enter Proposed Discount', type: 'number' })}
                {wrapInput(Input, { label: 'Credit Limit*', name: 'creditLimit', placeholder: 'Auto-Calculated', type: 'number', disabled: true, className: 'bg-gray-100 text-gray-500' })}
                {wrapInput(Select, {
                    label: 'Billing Mode*',
                    name: 'billingMode',
                    options: [
                        { value: 'Direct', label: 'Direct' },
                        { value: 'DC', label: 'DC' }
                    ]
                })}
                {formik.values.billingMode === 'DC' && wrapInput(Select, {
                    label: 'Billing Cycle*',
                    name: 'billingCycle',
                    options: [
                        { value: '7_days', label: '7 Days' },
                        { value: '15_days', label: '15 Days' },
                        { value: 'end_of_month', label: 'End of Month' }
                    ]
                })}
            </div>
            <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <Icon icon="mdi:checkbook" className="text-[#fe9a00]" /> 3 Blank Cheques
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">Please provide 3 blank cheques or state the reason.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formik.values.chequeDetails.map((cheque, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                            {wrapInput(Input, {
                                label: `Cheque ${index + 1} Number`,
                                name: `chequeDetails[${index}].chequeNumber`,
                                placeholder: `Cheque ${index + 1} No.`
                            })}
                            <FileUploadField
                                hideInput
                                enableCamera
                                label="Upload Cheque Photo"
                                name={`dummyChequeUpload${index}`}
                                placeholder="Upload Photo"
                                onFileChange={(e) => handleFileUpload(e, `chequeDetails[${index}].chequeImage`, `cheque${index}`)}
                                uploading={uploading?.[`cheque${index}`]}
                                currentValue={cheque.chequeImage}
                                formik={formik}
                                wrapInput={wrapInput}
                                imgFieldName={`chequeDetails[${index}].chequeImage`}
                                isReadOnlyMode={isReadOnlyMode}
                            />
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    {wrapInput(Input, {
                        label: 'Remark (If Cheques Not Submitted)',
                        name: 'chequeRemark',
                        placeholder: 'Enter reason for not submitting cheques',
                        className: 'bg-yellow-50 focus:bg-white transition-colors'
                    })}
                </div>
            </div>
        </div>
    );
};
