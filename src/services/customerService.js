import api from './apiInstance';

export const getCustomerConfigs = async () => {
    try {
        const endpoints = [
            '/api/product/customer-types',
            '/api/product/gst-types',
            '/api/product/plants',
            '/api/product/labs',
            '/api/product/fitting-centers',
            '/api/product/credit-days',
            '/api/product/courier-names',
            '/api/product/courier-times',
            '/api/product/countries',
            '/api/product/states',
            '/api/product/billing-currencies',
            '/api/employee/sales-persons',
            '/api/product/brands',
            '/api/product/categories',
            '/api/product/specific-labs'
        ];

        const responses = await Promise.all(endpoints.map(url => api.get(url).catch(err => ({ error: err }))));

        return {
            customerTypes: responses[0]?.data?.data || [],
            gstTypes: responses[1]?.data?.data || [],
            plants: responses[2]?.data?.data || [],
            labs: responses[3]?.data?.data || [],
            fittingCenters: responses[4]?.data?.data || [],
            creditDays: responses[5]?.data?.data || [],
            courierNames: responses[6]?.data?.data || [],
            courierTimes: responses[7]?.data?.data || [],
            countries: responses[8]?.data?.data || [],
            states: responses[9]?.data?.data || [],
            billingCurrencies: responses[10]?.data?.data || [],
            salesPersons: responses[11]?.data?.data || [],
            brands: responses[12]?.data?.data || [],
            categories: responses[13]?.data?.data || [],
            specificLabs: responses[14]?.data?.data || []
        };
    } catch (error) {
        console.error('Error fetching customer configs:', error);
        throw error;
    }
};

export const getBrandCategories = async (brandId) => {
    try {
        const response = await api.get(`/api/product/categories/brand/${brandId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching brand categories:', error);
        return [];
    }
};

export const registerCustomer = async (customerData) => {
    try {
        const response = await api.post('/api/customer/management/register', customerData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Registration failed');
    }
};

export const addShipTo = async (shipToData) => {
    try {
        const response = await api.post('/api/customer/management/add-ship-to', shipToData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to add ship-to details');
    }
};

export const getAllCustomers = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/customer/management/get-all-customers?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch customers');
    }
};

export const getCustomerById = async (id) => {
    try {
        const response = await api.get(`/api/customer/management/get-customer/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch customer details');
    }
};

export const getAllRegions = async () => {
    try {
        const response = await api.get('/api/location/all-zone');
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error fetching regions:', error);
        return [];
    }
};

export const getAllCities = async () => {
    try {
        const response = await api.get('/api/location/get-all-city');
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching all cities:', error);
        return [];
    }
};

export const getCitiesByRegion = async (regionId) => {
    try {
        const response = await api.get(`/api/location/get-city-by-region/${regionId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
};

export const getAllZones = async () => {
    try {
        const response = await api.get('/api/location/all-zone');
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error fetching zones:', error);
        return [];
    }
};
