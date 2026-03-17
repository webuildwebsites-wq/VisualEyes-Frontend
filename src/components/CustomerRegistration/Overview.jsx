import React from 'react';
import { Icon } from '@iconify/react';
import { SummaryCard, DetailItem, DocPreview } from './shared';

export const Overview = ({ formik, configs = {}, isSalesUser }) => {
    const { values } = formik;

    // Optional chaining to prevent TypeError if configs array is undefined
    const getZone = () => configs.zones?.find(z => z._id === values.zoneRefId)?.zone;
    const getSalesPerson = () => configs.salesPersons?.find(s => s._id === values.salesPersonRefId)?.employeeName;
    const getLab = () => configs.specificLabs?.find(l => l._id === values.specificLabRefId)?.name;
    const getPlant = () => configs.plants?.find(p => p._id === values.plantRefId)?.name;
    const getFittingCenter = () => configs.fittingCenters?.find(f => f._id === values.fittingCenterRefId)?.name;
    const getCreditDays = () => configs.creditDays?.find(d => d._id === values.creditDaysRefId)?.days;
    const getCourierName = () => configs.courierNames?.find(c => c._id === values.courierNameRefId)?.name;
    const getCourierTime = () => configs.courierTimes?.find(t => t._id === values.courierTimeRefId)?.time;

    return (
        <div className="space-y-6 md:space-y-8 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
            <h2 className="text-xl md:text-2xl font-black text-[#F59E0B] mb-4 md:mb-8 flex items-center gap-3">
                <Icon icon="mdi:file-find-outline" /> Review Application
            </h2>

            <SummaryCard title="Basic Info" icon="mdi:account-circle">
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <DetailItem label="Shop Name" value={values.shopName} />
                    <DetailItem label="Owner's Name" value={values.ownerName} />
                    <DetailItem label="Mobile 1" value={values.mobileNo1} />
                    <DetailItem label="Mobile 2" value={values.mobileNo2} />
                    <DetailItem label="Landline" value={values.landlineNo} />
                    {!isSalesUser && <DetailItem label="Email ID" value={values.emailId} />}
                    <DetailItem label="GST Type" value={values.gstType} />
                    {(values.gstType === 'Regular' || values.gstType === 'Composition') && <DetailItem label="GST Number" value={values.GSTNumber} />}
                </div>

                <div className="col-span-full border-t border-gray-50 pt-4 md:pt-6 mt-2">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Identity Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                        {(values.gstType === 'Regular' || values.gstType === 'Composition') ? (
                            <DocPreview label="GST Document" src={values.GSTCertificateImg} />
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <DetailItem label="Aadhar No." value={values.AadharCard} />
                                    <DocPreview label="Aadhar Card" src={values.AadharCardImg} />
                                </div>
                                <div className="space-y-4">
                                    <DetailItem label="PAN No." value={values.PANCard} />
                                    <DocPreview label="PAN Card" src={values.PANCardImg} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SummaryCard>

            <div className="space-y-6">
                {(values.address || []).map((addr, idx) => (
                    <SummaryCard key={idx} title={`Address ${idx + 1} `} icon="mdi:map-marker">
                        <DetailItem label="Branch Address" value={addr.branchAddress} />
                        <DetailItem label="Contact Person" value={addr.contactPerson} />
                        <DetailItem label="Contact No." value={addr.contactNumber} />
                        <DetailItem label="City" value={addr.city} />
                        <DetailItem label="State" value={addr.state} />
                        <DetailItem label="Currency" value={addr.billingCurrency} />
                        <DetailItem label="Mode" value={addr.billingMode} />
                        <DetailItem label="Pincode" value={addr.zipCode} />
                    </SummaryCard>
                ))}
            </div>

            {!isSalesUser && (
                <SummaryCard title="Registration Details" icon="mdi:cog">
                    <DetailItem label="Zone" value={getZone()} />
                    <DetailItem label="Sales Person" value={getSalesPerson()} />
                    <DetailItem label="Specific Lab" value={getLab()} />
                    <DetailItem label="Plant" value={getPlant()} />
                    <DetailItem label="Fitting Centre" value={getFittingCenter()} />
                    <DetailItem label="Credit Limit" value={values.creditLimit} />
                    <DetailItem label="Credit Days" value={getCreditDays()} />
                    <DetailItem label="Courier Name" value={getCourierName()} />
                    <DetailItem label="Courier Time" value={getCourierTime()} />
                </SummaryCard>
            )}

            {!isSalesUser && (
                <SummaryCard title="Selected Brands & Categories" icon="mdi:tag-multiple">
                    <div className="col-span-full space-y-4">
                        {(values.brandCategories || []).map((bc, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">{bc.brandName || 'Unknown Brand'}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(bc.categories || []).map((cat, cIdx) => (
                                        <span key={cIdx} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                                            {cat.categoryName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SummaryCard>
            )}
        </div>
    );
};
