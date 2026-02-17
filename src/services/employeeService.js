import api from './apiInstance';

export const createSupervisorUser = async (userData) => {
    try {
        const response = await api.post('/api/employee/management/create-supervisor-employee', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to create supervisor Employee');
    }
};
