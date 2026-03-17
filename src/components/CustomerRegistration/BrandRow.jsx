import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Select from '../ui/Select';
import { getBrandCategories } from '../../services/customerService';

export const BrandRow = ({ index, bc, remove, configs, formik, wrapInput, isReadOnlyMode }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCats = async () => {
            if (bc.brandId) {
                setLoading(true);
                try {
                    const data = await getBrandCategories(bc.brandId);
                    setCategories(Array.isArray(data) ? data : data.categories || []);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setCategories([]);
            }
        };
        fetchCats();
    }, [bc.brandId]);


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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wrapInput(Select, {
                    label: "Select Brand*",
                    name: `brandCategories[${index}].brandId`,
                    value: bc.brandId,
                    options: (configs.brands || []).map(b => ({ value: b._id, label: b.name })),
                    onChange: (e) => {
                        const brand = configs.brands.find(b => b._id === e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandId`, e.target.value);
                        formik.setFieldValue(`brandCategories[${index}].brandName`, brand?.name || '');
                        formik.setFieldValue(`brandCategories[${index}].categories`, []); // Reset categories
                    }
                })}

                {wrapInput(Select, {
                    label: "Select Categories*",
                    name: `brandCategories[${index}].categories`,
                    multiple: true,
                    placeholder: "Select Categories",
                    disabled: !bc.brandId || loading,
                    value: (bc.categories || []).map(c => c.categoryId),
                    options: categories.map(c => ({ value: c._id, label: c.name })),
                    onChange: (e) => {
                        const selectedIds = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                        const updatedCats = selectedIds.map(id => ({
                            categoryId: id,
                            categoryName: categories.find(cat => cat._id === id)?.name || ''
                        }));
                        formik.setFieldValue(`brandCategories[${index}].categories`, updatedCats);
                    }
                })}
                {loading && <span className="text-[10px] text-orange-500 animate-pulse">Loading categories...</span>}
            </div>
        </div>
    );
};
