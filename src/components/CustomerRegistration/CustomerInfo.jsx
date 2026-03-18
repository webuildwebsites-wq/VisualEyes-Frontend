import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { FileUploadField } from './shared';

export const CustomerInfo = ({ wrapInput, configs, formik, aadharRef, panRef, gstRef, handleFileUpload, uploading, isReadOnlyMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
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
        {wrapInput(Input, { label: 'Email ID*', name: 'emailId', placeholder: 'Enter Email ID' })}
        {wrapInput(Input, { label: 'Business Email', name: 'businessEmail', placeholder: 'Enter Business Email' })}
        {wrapInput(Input, { label: 'Year of Establishment', name: 'yearOfEstablishment', placeholder: 'Enter Year of Est.' })}
        {wrapInput(Input, { label: 'Proposed Discount (%)', name: 'proposedDiscount', placeholder: 'Enter Proposed Discount', type: 'number' })}
        {wrapInput(Input, { label: 'Currently Dealt Brands', name: 'currentlyDealtBrands', placeholder: 'Enter Dealt Brands' })}
        {wrapInput(Input, { label: 'Min Sales Value', name: 'minSalesValue', placeholder: 'Enter Min Sales Value', type: 'number' })}

        {/* GST Selection */}
        {wrapInput(Select, {
            label: 'GST For Invoicing*',
            name: 'gstTypeRefId',
            options: (configs.gstTypes || []).map(g => ({ value: g._id, label: g.name })),
            onChange: (e) => {
                const selected = configs.gstTypes.find(g => g._id === e.target.value);
                const prevType = formik.values.gstType?.toLowerCase();
                const nextType = (selected?.name || '').toLowerCase();

                formik.setFieldValue('gstTypeRefId', e.target.value);
                formik.setFieldValue('gstType', selected?.name || '');

                // Reset fields if switching context
                if (prevType !== nextType) {
                    if (nextType === 'unregistered') {
                        formik.setFieldValue('GSTNumber', '');
                        formik.setFieldValue('GSTCertificateImg', '');
                    } else {
                        formik.setFieldValue('AadharCard', '');
                        formik.setFieldValue('AadharCardImg', '');
                        formik.setFieldValue('PANCard', '');
                        formik.setFieldValue('PANCardImg', '');
                    }
                }
            }
        })}
        {/* Scenario: If unregistered show Aadhar and PAN, else show GST */}
        {formik.values.gstType?.toLowerCase() === 'unregistered' ? (
            <>
                <FileUploadField
                    label="Aadhar Card No.*"
                    name="AadharCard"
                    placeholder="Enter Aadhar No."
                    fileRef={aadharRef}
                    onFileChange={(e) => handleFileUpload(e, 'AadharCardImg', 'aadhar')}
                    uploading={uploading.aadhar}
                    currentValue={formik.values.AadharCardImg}
                    formik={formik}
                    wrapInput={wrapInput}
                    imgFieldName="AadharCardImg"
                    isReadOnlyMode={isReadOnlyMode}
                />
                <FileUploadField
                    label="PAN Card No.*"
                    name="PANCard"
                    placeholder="Enter PAN No."
                    fileRef={panRef}
                    onFileChange={(e) => handleFileUpload(e, 'PANCardImg', 'pan')}
                    uploading={uploading.pan}
                    currentValue={formik.values.PANCardImg}
                    formik={formik}
                    wrapInput={wrapInput}
                    imgFieldName="PANCardImg"
                    isReadOnlyMode={isReadOnlyMode}
                />
            </>
        ) : <FileUploadField
            label="GST Number*"
            name="GSTNumber"
            placeholder="Enter GST No."
            fileRef={gstRef}
            onFileChange={(e) => handleFileUpload(e, 'GSTCertificateImg', 'gst')}
            uploading={uploading.gst}
            currentValue={formik.values.GSTCertificateImg}
            formik={formik}
            wrapInput={wrapInput}
            imgFieldName="GSTCertificateImg"
            isReadOnlyMode={isReadOnlyMode}
        />}
    </div>
);
