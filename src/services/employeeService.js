import api from './apiInstance';

export const createSupervisorUser = async (userData) => {
    try {
        const response = await api.post('/api/employee/management/create-supervisor-employee', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to create supervisor Employee');
    }
};
export const getAllEmployees = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/employee/management/get-employees?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch employees');
    }
};

export const getEmployeeById = async (id) => {
    try {
        const response = await api.get(`/api/employee/management/get-employee/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch employee details');
    }
};
