import React from 'react';
import { Icon } from '@iconify/react';
import Select from '../ui/Select';

export const BrandRow = ({ index, bc, remove, configs, formik, wrapInput, isReadOnlyMode }) => {

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
            {!isReadOnlyMode && (
                <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"
                >
                    <Icon icon="mdi:close" className="text-lg" />
                </button>
            )}
            <div className="grid grid-cols-1 gap-6">
                {wrapInput(Select, {
                    label: "Select Brand*",
                    name: `brandCategories[${index}].brandId`,
                    value: bc.brandId,
                    options: (configs.brands || []).map(b => ({ value: b._id, label: b.name })),
                    onChange: (e) => {
                        const brand = configs.brands.find(b => b._id === e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandId`, e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandName`, brand?.name || '');
                    }
                })}
            </div>
        </div>
    );
};
