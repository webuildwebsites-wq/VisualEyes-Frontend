import { INITIAL_FORM_VALUES } from './constants';

export const mapCustomerToFormValues = (customer, configs = {}) => {
    if (!customer) return INITIAL_FORM_VALUES;

    // Helper to find ID by label in a config list
    const findId = (list, val, labelKey = 'name') => {
        if (!val) return '';
        if (!list || !Array.isArray(list)) return val;

        const searchVal = String(val).toLowerCase();
        const item = list.find(i =>
            String(i._id).toLowerCase() === searchVal ||
            String(i[labelKey] || i).toLowerCase() === searchVal
        );
        return item?._id || val;
    };

    // Helper to get Label from object or string
    const getLabel = (obj, list, labelKey = 'name') => {
        if (!obj) return '';
        if (typeof obj === 'string') {
            // If it's already an ID, try to get the label from list
            const item = (list || []).find(i => i._id === obj);
            return item ? (item[labelKey] || item) : obj;
        }
        return obj.name || obj.employeeName || obj.zone || obj.days || obj.time || '';
    };

    const getRefId = (obj, list, labelKey = 'name') => {
        if (!obj) return '';
        const baseId = (typeof obj === 'object') ? (obj._id || obj.refId || '') : obj;
        return findId(list, baseId, labelKey);
    };

    return {
        ...INITIAL_FORM_VALUES,
        ...customer,
        CustomerType: getLabel(customer.CustomerType, configs.customerTypes),
        CustomerTypeRefId: getRefId(customer.CustomerType, configs.customerTypes),
        gstType: getLabel(customer.gstType, configs.gstTypes) || (customer.IsGSTRegistered ? 'Regular' : 'Unregistered'),
        gstTypeRefId: getRefId(customer.gstType || (customer.IsGSTRegistered ? 'Regular' : 'Unregistered'), configs.gstTypes),
        zoneRefId: getRefId(customer.zone, configs.zones, 'zone'),
        salesPersonRefId: getRefId(customer.salesPerson, configs.salesPersons, 'employeeName'),
        specificLabRefId: getRefId(customer.specificLab, configs.specificLabs),
        plantRefId: getRefId(customer.plant, configs.plants),
        fittingCenterRefId: getRefId(customer.fittingCenter, configs.fittingCenters),
        creditDaysRefId: getRefId(customer.creditDays, configs.creditDays, 'days'),
        courierNameRefId: getRefId(customer.courierName, configs.courierNames),
        courierTimeRefId: getRefId(customer.courierTime, configs.courierTimes, 'time'),
        address: customer.address?.length ? customer.address : INITIAL_FORM_VALUES.address,
        yearOfEstablishment: customer.yearOfEstablishment || '',
        proposedDiscount: customer.proposedDiscount || '',
        currentlyDealtBrands: customer.currentlyDealtBrands || '',
        minSalesValue: customer.minSalesValue || '',
        finalDiscount: customer.finalDiscount || '',
        brandCategories: (customer.brandCategories?.length) ? customer.brandCategories.map(bc => ({
            brandId: getRefId(bc.brandId, configs.brands),
            brandName: getLabel(bc.brandId, configs.brands),
            categories: (bc.categories || []).map(cat => ({
                categoryId: getRefId(cat.categoryId),
                categoryName: getLabel(cat.categoryId)
            }))
        })) : INITIAL_FORM_VALUES.brandCategories,
    };
};
