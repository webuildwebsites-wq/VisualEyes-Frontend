import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerRegistrationReducer from './slices/customerRegistrationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        customerRegistration: customerRegistrationReducer,
    },
});
