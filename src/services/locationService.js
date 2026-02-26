import api from './apiInstance';

export const getAllZones = async () => {
    try {
        const response = await api.get('/api/location/all-zone');
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error fetching all zones:', error);
        throw error;
    }
};

export const getZoneDetails = async (zoneId) => {
    try {
        const response = await api.get(`/api/location/zone/${zoneId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching zone details for ${zoneId}:`, error);
        throw error;
    }
};

export const getStatesByZone = async (zoneId) => {
    try {
        const response = await api.get(`/api/location/zone/${zoneId}/get-states`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching states for zone ${zoneId}:`, error);
        throw error;
    }
};

export const getCitiesByState = async (zoneId, stateId) => {
    try {
        const response = await api.get(`/api/location/zone/${zoneId}/state/${stateId}/get-cities`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching cities for zone ${zoneId} and state ${stateId}:`, error);
        throw error;
    }
};

export const getZipCodesByCity = async (zoneId, stateId, cityId) => {
    try {
        const response = await api.get(`/api/location/zone/${zoneId}/state/${stateId}/city/${cityId}/get-zipcodes`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching zipcodes for zone ${zoneId}, state ${stateId}, and city ${cityId}:`, error);
        throw error;
    }
};
