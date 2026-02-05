import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    role: null,
    isAuthenticated: false,
    registeredUsers: JSON.parse(localStorage.getItem('registeredUsers')) || [
        { username: 'admin', password: 'password', role: 'superadmin' }
    ],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        signup: (state, action) => {
            const { username, password } = action.payload;
            const newUser = { username, password, role: 'user' };
            state.registeredUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(state.registeredUsers));
        },
        setCredentials: (state, action) => {
            const { user, token, role } = action.payload;
            state.user = user;
            state.token = token;
            state.role = role;
            state.isAuthenticated = true;
            localStorage.setItem('token', token); // Persist to local storage
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logOut, signup } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsSuperAdmin = (state) => state.auth.role === 'superadmin';
export const selectRegisteredUsers = (state) => state.auth.registeredUsers;
