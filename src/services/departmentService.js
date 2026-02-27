import api from './apiInstance';

export const getAllDepartments = async () => {
    try {
        const response = await api.get('/api/departments/get-all-departments');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch departments');
    }
};

export const getSubRoles = async (deptId) => {
    try {
        const response = await api.get(`/api/departments/${deptId}/sub-roles`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Failed to fetch sub-roles');
    }
};
