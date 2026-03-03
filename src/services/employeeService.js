import api from './apiInstance';

export const createSupervisorUser = async (userData) => {
    try {
        const response = await api.post('/api/employee/management/create-employee', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to create supervisor Employee');
    }
};
export const getAllEmployees = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/employee/management/get-all-employees?page=${page}&limit=${limit}`);
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

export const getDraftEmployeeById = async (id) => {
    try {
        const response = await api.get(`/api/employee/management/get-draft-employee/${id}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch draft employee details');
    }
};
export const createDraftEmployee = async (userData) => {
    try {
        const response = await api.post('/api/employee/management/create-draft-employee', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to save employee draft');
    }
};

export const getAllDraftEmployees = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/employee/management/get-all-draft-employee?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch all draft employees');
    }
};

export const getMyDraftEmployees = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/api/employee/management/get-my-draft-employee?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch my draft employees');
    }
};
