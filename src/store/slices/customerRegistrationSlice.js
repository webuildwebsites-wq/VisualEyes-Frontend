import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isVerificationMode: false,
    rejectedFields: {},
};

const customerRegistrationSlice = createSlice({
    name: 'customerRegistration',
    initialState,
    reducers: {
        toggleVerificationMode: (state) => {
            state.isVerificationMode = !state.isVerificationMode;
            if (!state.isVerificationMode) {
                state.rejectedFields = {};
            }
        },
        toggleFieldRejection: (state, action) => {
            const { fieldName } = action.payload;
            state.rejectedFields[fieldName] = !state.rejectedFields[fieldName];
        },
        resetRegistration: () => {
            return initialState;
        }
    }
});

export const {
    toggleVerificationMode,
    toggleFieldRejection,
    resetRegistration
} = customerRegistrationSlice.actions;
export default customerRegistrationSlice.reducer;
