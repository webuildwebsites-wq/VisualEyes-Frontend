import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeStep: 0,
    formValues: {
        // Step 1: Basic Details
        shopName: '',
        ownerName: '',
        CustomerType: '',
        CustomerTypeRefId: '',
        orderMode: '',
        mobileNo1: '',
        mobileNo2: '',
        landlineNo: '',
        emailId: '',
        // Step 2: Address
        address: [
            { address1: '', contactPerson: '', contactNumber: '', city: '', state: '', zipCode: '', country: '', billingCurrency: '', billingMode: '' }
        ],
        // Step 3: Login Details
        username: '',
        password: '',
        zone: '',
        zoneRefId: '',
        hasFlatFitting: 'no',
        selectType: [],
        selectTypeIndex: [],
        Price: '',
        specificBrand: '',
        specificBrandRefId: '',
        specificCategory: '',
        specificCategoryRefId: '',
        specificLab: '',
        specificLabRefId: '',
        salesPerson: '',
        salesPersonRefId: '',
        // Step 4: Documentation
        IsGSTRegistered: 'no',
        gstType: '',
        gstTypeRefId: '',
        GSTNumber: '',
        GSTCertificateImg: '',
        AadharCard: '',
        AadharCardImg: '',
        PANCard: '',
        PANCardImg: '',
        plant: '',
        plantRefId: '',
        lab: '',
        labRefId: '',
        fittingCenter: '',
        fittingCenterRefId: '',
        creditDays: '',
        creditDaysRefId: '',
        creditLimit: '',
        creditLimitRefId: '',
        courierTime: '',
        courierTimeRefId: '',
        courierName: '',
        courierNameRefId: ''
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
        resetRegistration: () => {
            return initialState;
        }
    }
});

export const { setStep, updateFormValues, resetRegistration } = customerRegistrationSlice.actions;
export default customerRegistrationSlice.reducer;
