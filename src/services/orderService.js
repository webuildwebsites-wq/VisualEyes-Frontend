import api from './apiInstance';

export const getAllOrders = async (page = 1, limit = 10, filters = {}) => {
    try {
        const queryParams = new URLSearchParams({ page, limit, ...filters });
        const response = await api.get(`/api/order/get-all-orders?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch orders');
    }
};

export const getOrderById = async (id) => {
    try {
        const response = await api.get(`/api/order/get-order/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch order details');
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const response = await api.put(`/api/order/update-status/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to update order status');
    }
};

export const getOrderConfigs = async () => {
    try {
        const endpoints = [
            '/api/product/brands',
            '/api/product/categories',
            '/api/product/treatments',
            '/api/product/index',
            '/api/product/lens-types',
            '/api/product/coatings',
            '/api/product/tints',
        ];

        const responses = await Promise.all(endpoints.map(url => api.get(url).catch(() => ({ data: { data: [] } }))));

        return {
            brands: responses[0]?.data?.data || [],
            categories: responses[1]?.data?.data || [],
            treatments: responses[2]?.data?.data || [],
            indices: responses[3]?.data?.data || [],
            lensTypes: responses[4]?.data?.data || [],
            coatings: responses[5]?.data?.data || [],
            tints: responses[6]?.data?.data || [],
        };
    } catch (error) {
        console.error('Error fetching order configs:', error);
        return {};
    }
};
