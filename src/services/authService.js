import api from './apiInstance';

export const loginUser = async (loginData) => {
    console.log(loginData);
    try {
        const response = await api.post('/api/employee/auth/login', loginData);
        console.log(response.data, "response");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Login failed');
    }
};

export const logoutUser = async () => {
    try {
        const response = await api.post('/api/employee/auth/logout');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Logout failed');
    }
};
