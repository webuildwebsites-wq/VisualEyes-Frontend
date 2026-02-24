import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeStep: 0,
    isVerificationMode: false,
    rejectedFields: {},
    formValues: {
        shopName: '',
        ownerName: '',
        CustomerTypeRefId: '',
        orderMode: '',
        mobileNo1: '',
        mobileNo2: '',
        landlineNo: '',
        loginEmail: '',
        businessEmail: '',
        // GST Logic
        gstType: 'Unregistered', // 'Registered' (Number) or 'Unregistered'
        gstNo: '',
        gstDoc: '',
        AadharCard: '',
        PANCard: '',
        address: [
            { address1: '', contactPerson: '', contactNumber: '', city: '', state: '', country: 'India', billingCurrency: 'INR', billingMode: 'CREDIT' }
        ],
        username: '',
        password: '',
        zoneRefId: '',
        hasFlatFitting: 'No',
        // Flat Fitting Logic: Multi-row array of objects
        flatFittingEntries: [
            { type: '', index: '', price: '' }
        ],
        specificBrandRefId: '',
        specificCategoryRefId: '',
        specificLabRefId: '',
        salesPersonRefId: '',
        plantRefId: '',
        fittingCenterRefId: '',
        creditLimit: '',
        creditDaysRefId: '',
        courierNameRefId: '',
        courierTimeRefId: ''
    }
};

const customerRegistrationSlice = createSlice({
    name: 'customerRegistration',
    initialState,
    reducers: {
        setStep: (state, action) => {
            state.activeStep = action.payload;
        },
        updateFormValues: (state, action) => {
            state.formValues = {
                ...state.formValues,
                ...action.payload
            };
        },
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
    setStep,
    updateFormValues,
    toggleVerificationMode,
    toggleFieldRejection,
    resetRegistration
} = customerRegistrationSlice.actions;
export default customerRegistrationSlice.reducer;
