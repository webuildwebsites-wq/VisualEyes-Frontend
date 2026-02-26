import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { createSupervisorUser } from '../services/employeeService';
import { uploadImage } from '../services/bucketService';
import { getSystemConfigs } from '../services/configService';
import { getAllDepartments, getSubRoles } from '../services/departmentService';
import { getAllRegions } from '../services/customerService';
import { toast } from 'react-toastify';
import { useState, useRef, useEffect, useMemo } from 'react';
import * as locationService from '../services/locationService';
import { PATHS } from '../routes/paths';

const Registration = () => {
    const navigate = useNavigate();
    const aadharInputRef = useRef(null);
    const panInputRef = useRef(null);

    const [images, setImages] = useState({
        aadhar: { file: null, preview: null, url: '', uploading: false },
        pan: { file: null, preview: null, url: '', uploading: false }
    });

    const [configs, setConfigs] = useState({
        EmployeeType: [],
        labs: [],
        regions: [],
        departments: []
    });

    const [subRoles, setSubRolesList] = useState([]);
    const [loadingConfigs, setLoadingConfigs] = useState(true);
    const [loadingSubRoles, setLoadingSubRoles] = useState(false);

    // Location hierarchy state for Sales department
    const [locationData, setLocationData] = useState({
        zones: [],
        states: [],
        cities: [],
        zipcodes: []
    });
    const [loadingLocation, setLoadingLocation] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [configRes, deptRes, regionRes] = await Promise.all([
                    getSystemConfigs(),
                    getAllDepartments(),
                    // getAllRegions()
                ]);

                if (configRes.success) {
                    setConfigs(prev => ({
                        ...prev,
                        EmployeeType: configRes.data.find(c => c.configType === 'EmployeeType')?.values || [],
                        labs: configRes.data.find(c => c.configType === 'Lab')?.values || []
                    }));
                }

                if (deptRes.success) {
                    setConfigs(prev => ({
                        ...prev,
                        departments: deptRes.data || []
                    }));
                }

                setConfigs(prev => ({
                    ...prev,
                    regions: regionRes || []
                }));
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                toast.error("Failed to load form options");
            } finally {
                setLoadingConfigs(false);
            }
        };

        fetchInitialData();
    }, []);

    const formik = useFormik({
        initialValues: {
            employeeType: '',
            employeeName: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            country: 'India',
            region: '',
            department: '',
            role: '',
            pincode: '',
            expiry: '',
            lab: '',
            aadharCard: '',
            panCard: '',
            state: '',
            city: '',
            username: ''
        },
        validationSchema: Yup.object({
            employeeType: Yup.string().required('Staff Category is required'),
            employeeName: Yup.string().required('Staff Name is required'),
            email: Yup.string().email('Invalid email format').required('Email is required'),
            password: Yup.string().required('Password is required'),
            phone: Yup.string()
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(10, 'Must be exactly 10 digits')
                .max(10, 'Must be exactly 10 digits')
                .required('Phone is required'),
            address: Yup.string().required('Address is required'),
            pincode: Yup.string().required('Pincode is required'),
            lab: Yup.string().required('Lab is required'),
            region: Yup.string().when('department', {
                is: (val) => {
                    const dept = configs.departments.find(d => d._id === val);
                    return dept?.name?.toUpperCase() === 'SALES';
                },
                then: (schema) => schema.required('Region is required for Sales department'),
                otherwise: (schema) => schema.notRequired()
            }),
            department: Yup.string().when('employeeType', {
                is: (val) => val?.toUpperCase() !== 'SUPERADMIN',
                then: (schema) => schema.required('Department is required'),
                otherwise: (schema) => schema.notRequired()
            }),
            role: Yup.string().when('employeeType', {
                is: (val) => !['SUPERADMIN', 'ADMIN'].includes(val?.toUpperCase()),
                then: (schema) => schema.required('Role is required'),
                otherwise: (schema) => schema.notRequired()
            }),
            aadharCard: Yup.string().when('employeeType', {
                is: (val) => val?.toUpperCase() !== 'SUPERADMIN',
                then: (schema) => schema.required('Aadhar Card image is required'),
                otherwise: (schema) => schema.notRequired()
            }),
            panCard: Yup.string().when('employeeType', {
                is: (val) => val?.toUpperCase() !== 'SUPERADMIN',
                then: (schema) => schema.required('PAN Card image is required'),
                otherwise: (schema) => schema.notRequired()
            }),
            username: Yup.string()
                .required('Username is required')
                .matches(/^\S+$/, "Username cannot contain spaces")
                .min(3, 'Username must be at least 3 characters'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const selectedDept = configs.departments.find(d => d._id === values.department);
                const selectedRole = subRoles.find(r => r.code === values.role);
                const isSales = selectedDept?.name?.toUpperCase() === 'SALES';
                const employeeType = values.employeeType?.toUpperCase();

                let payload = {
                    employeeType: values.employeeType,
                    username: values.username,
                    employeeName: values.employeeName,
                    email: values.email,
                    password: values.password,
                    phone: values.phone,
                    address: values.address,
                    country: values.country,
                };

                // Add documents and department info for non-SUPERADMIN types
                if (employeeType !== 'SUPERADMIN') {
                    payload = {
                        ...payload,
                        pincode: values.pincode,
                        aadharCard: values.aadharCard,
                        panCard: values.panCard,
                        expiry: values.expiry,
                        lab: values.lab,
                    };

                    if (selectedDept) {
                        payload.department = selectedDept.name;
                        payload.departmentRefId = selectedDept._id;
                    }

                    // Add subRoles for roles other than ADMIN (Supervisor, Teamlead, etc)
                    if (employeeType !== 'ADMIN') {
                        payload.subRoles = selectedRole ? [
                            {
                                name: selectedRole.name,
                                refId: selectedRole._id
                            }
                        ] : [];
                    }

                    // Specific handling for SALES zone hierarchy
                    if (isSales) {
                        const selectedZone = locationData.zones.find(z => z._id === values.region);
                        payload.zone = selectedZone?.zone || '';
                        payload.zoneRefId = values.region;
                    }
                }

                const response = await createSupervisorUser(payload);
                if (response.success) {
                    toast.success("Staff Registered Successfully!");
                    navigate(PATHS.WELCOME, { state: { from: 'register' } });
                }
            } catch (error) {
                console.error('Registration Error:', error);
                toast.error(error.error?.message || error.message || "Failed to create user");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleDeptChange = async (e) => {
        const deptId = e.target.value;
        const selectedDepartment = configs.departments.find(d => d._id === deptId);
        const isSales = selectedDepartment?.name?.toUpperCase() === 'SALES';

        formik.setFieldValue('department', deptId);
        formik.setFieldValue('role', '');
        formik.setFieldValue('region', '');
        setSubRolesList([]);
        setLocationData({ zones: [], states: [], cities: [], zipcodes: [] });

        if (deptId) {
            setLoadingSubRoles(true);
            try {
                const response = await getSubRoles(deptId);
                if (response.success) {
                    setSubRolesList(response.data.subRoles || []);
                }
            } catch (error) {
                console.error('Failed to fetch sub-roles:', error);
                toast.error("Failed to load roles for this department");
            } finally {
                setLoadingSubRoles(false);
            }
        }

        if (deptId && isSales) {
            // Fetch Zones for Sales department
            setLoadingLocation(true);
            try {
                const response = await locationService.getAllZones();
                if (response.success) {
                    setLocationData(prev => ({ ...prev, zones: response.data.locations || [] }));
                }
            } catch (error) {
                console.error('Failed to fetch zones:', error);
                toast.error("Failed to load zones");
            } finally {
                setLoadingLocation(false);
            }
        }
    };

    const handleZoneChange = async (e) => {
        const zoneId = e.target.value;
        const selectedZone = locationData.zones.find(z => z._id === zoneId);

        formik.setFieldValue('region', zoneId); // Store the ID
        formik.setFieldValue('state', '');
        formik.setFieldValue('city', '');
        formik.setFieldValue('pincode', '');

        setLocationData(prev => ({ ...prev, states: [], cities: [], zipcodes: [] }));

        if (zoneId) {
            setLoadingLocation(true);
            try {
                const response = await locationService.getStatesByZone(zoneId);
                if (response.success) {
                    setLocationData(prev => ({ ...prev, states: response.data.states || [] }));
                }
            } catch (error) {
                console.error('Failed to fetch states:', error);
            } finally {
                setLoadingLocation(false);
            }
        }
    };

    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        formik.setFieldValue('state', stateId);
        formik.setFieldValue('city', '');
        formik.setFieldValue('pincode', '');

        setLocationData(prev => ({ ...prev, cities: [], zipcodes: [] }));

        if (stateId) {
            setLoadingLocation(true);
            try {
                const response = await locationService.getCitiesByState(formik.values.region, stateId);
                if (response.success) {
                    setLocationData(prev => ({ ...prev, cities: response.data.cities || [] }));
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setLoadingLocation(false);
            }
        }
    };

    const handleCityChange = async (e) => {
        const cityId = e.target.value;
        formik.setFieldValue('city', cityId);
        formik.setFieldValue('pincode', '');

        setLocationData(prev => ({ ...prev, zipcodes: [] }));

        if (cityId) {
            setLoadingLocation(true);
            try {
                const response = await locationService.getZipCodesByCity(formik.values.region, formik.values.state, cityId);
                if (response.success) {
                    setLocationData(prev => ({ ...prev, zipcodes: response.data.zipCodes || [] }));
                }
            } catch (error) {
                console.error('Failed to fetch zipcodes:', error);
            } finally {
                setLoadingLocation(false);
            }
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImages(prev => ({
                ...prev,
                [type]: { ...prev[type], file, preview: previewUrl, url: '' }
            }));
            formik.setFieldValue(type === 'aadhar' ? 'aadharCard' : 'panCard', '');
        }
    };

    const handleUpload = async (type) => {
        const imageData = images[type];
        if (!imageData.file) return;

        setImages(prev => ({
            ...prev,
            [type]: { ...prev[type], uploading: true }
        }));

        try {
            const response = await uploadImage(imageData.file);
            const imageUrl = response.data?.url || response.url || response;

            setImages(prev => ({
                ...prev,
                [type]: { ...prev[type], url: imageUrl, uploading: false }
            }));

            formik.setFieldValue(type === 'aadhar' ? 'aadharCard' : 'panCard', imageUrl);
            toast.success(`${type.toUpperCase()} Card uploaded successfully!`);
        } catch (error) {
            console.error('Upload Error:', error);
            setImages(prev => ({
                ...prev,
                [type]: { ...prev[type], uploading: false }
            }));
            toast.error(`Failed to upload ${type.toUpperCase()} Card`);
        }
    };

    const selectedDept = configs.departments.find(d => d._id === formik.values.department);
    const isSalesDept = selectedDept?.name?.toUpperCase() === 'SALES';

    const showDeptFields = formik.values.employeeType?.toUpperCase() !== 'SUPERADMIN';
    const showRoleField = !['SUPERADMIN', 'ADMIN'].includes(formik.values.employeeType?.toUpperCase());
    const showDocumentFields = formik.values.employeeType?.toUpperCase() !== 'SUPERADMIN';

    return (
        <div className="flex justify-center p-4 py-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 w-full max-w-5xl border border-gray-100">
                <form onSubmit={formik.handleSubmit} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <Select
                            label="Staff Category *"
                            name="employeeType"
                            variant="orange"
                            value={formik.values.employeeType}
                            onChange={(e) => {
                                const newType = e.target.value?.toUpperCase();
                                formik.handleChange(e);
                                if (newType === 'SUPERADMIN') {
                                    formik.setFieldValue('department', '');
                                }
                                if (['SUPERADMIN', 'ADMIN'].includes(newType)) {
                                    formik.setFieldValue('role', '');
                                }
                            }}
                            onBlur={formik.handleBlur}
                            placeholder="Select Staff Category"
                            error={formik.touched.employeeType && formik.errors.employeeType ? { message: formik.errors.employeeType } : null}
                            options={configs.EmployeeType.map(type => ({ value: type, label: type }))}
                            disabled={loadingConfigs}
                        />
                        <Input
                            label="Staff Name *"
                            name="employeeName"
                            placeholder="Enter Staff Name"
                            value={formik.values.employeeName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.employeeName && formik.errors.employeeName ? { message: formik.errors.employeeName } : null}
                        />
                        <Input
                            label="Username *"
                            name="username"
                            placeholder="Enter Username"
                            value={formik.values.username}
                            onChange={(e) => {
                                // Double check: prevent spaces during typing as well if possible, or just rely on validation
                                formik.handleChange(e);
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && formik.errors.username ? { message: formik.errors.username } : null}
                        />

                        <Input
                            label="Email *"
                            name="email"
                            placeholder="Enter Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && formik.errors.email ? { message: formik.errors.email } : null}
                        />
                        <Input
                            label="Password *"
                            name="password"
                            type="password"
                            placeholder="Enter Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password ? { message: formik.errors.password } : null}
                        />

                        <Input
                            label="Mobile No. *"
                            name="phone"
                            placeholder="Enter Mobile No."
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && formik.errors.phone ? { message: formik.errors.phone } : null}
                        />
                        <Input
                            label="Address *"
                            name="address"
                            placeholder="Enter Address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.address && formik.errors.address ? { message: formik.errors.address } : null}
                        />

                        {showDeptFields && (
                            <Select
                                label="Select Department *"
                                name="department"
                                variant="orange"
                                value={formik.values.department}
                                onChange={handleDeptChange}
                                onBlur={formik.handleBlur}
                                placeholder="Select Department"
                                error={formik.touched.department && formik.errors.department ? { message: formik.errors.department } : null}
                                options={configs.departments.map(dept => ({ value: dept._id, label: dept.name }))}
                            />
                        )}

                        {showRoleField && (
                            <Select
                                label="Role *"
                                name="role"
                                variant="orange"
                                value={formik.values.role}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Select Role"
                                error={formik.touched.role && formik.errors.role ? { message: formik.errors.role } : null}
                                options={subRoles.map(role => ({ value: role.code, label: role.name }))}
                                disabled={!formik.values.department || loadingSubRoles}
                            />
                        )}

                        <Input
                            label="Country *"
                            name="country"
                            placeholder="Enter Country"
                            value={formik.values.country}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.country && formik.errors.country ? { message: formik.errors.country } : null}
                        />
                        {isSalesDept ? (
                            <>
                                <Select
                                    label="Zone *"
                                    name="region"
                                    value={formik.values.region}
                                    onChange={handleZoneChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Select Zone"
                                    error={formik.touched.region && formik.errors.region ? { message: formik.errors.region } : null}
                                    options={locationData.zones.map(z => ({ value: z._id, label: z.zone }))}
                                    disabled={loadingLocation}
                                />
                                <Select
                                    label="State *"
                                    name="state"
                                    value={formik.values.state}
                                    onChange={handleStateChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Select State"
                                    options={locationData.states.map(s => ({ value: s._id, label: s.name }))}
                                    disabled={!formik.values.region || loadingLocation}
                                />
                                <Select
                                    label="City *"
                                    name="city"
                                    value={formik.values.city}
                                    onChange={handleCityChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Select City"
                                    options={locationData.cities.map(c => ({ value: c._id, label: c.name }))}
                                    disabled={!formik.values.state || loadingLocation}
                                />
                                <Select
                                    label="Pincode *"
                                    name="pincode"
                                    value={formik.values.pincode}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                    }}
                                    onBlur={formik.handleBlur}
                                    placeholder="Select Pincode"
                                    error={formik.touched.pincode && formik.errors.pincode ? { message: formik.errors.pincode } : null}
                                    options={locationData.zipcodes.map(z => ({ value: z.code, label: `${z.code} - ${z.area}` }))}
                                    disabled={!formik.values.city || loadingLocation}
                                />
                            </>
                        ) : (
                            <Input
                                label="Pincode *"
                                name="pincode"
                                placeholder="Enter Pincode"
                                value={formik.values.pincode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.pincode && formik.errors.pincode ? { message: formik.errors.pincode } : null}
                            />
                        )}

                        <Input
                            label="Access Expiry"
                            name="expiry"
                            type="date"
                            placeholder="Select Expiry Date"
                            value={formik.values.expiry}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.expiry && formik.errors.expiry ? { message: formik.errors.expiry } : null}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Select
                            label="Lab *"
                            name="lab"
                            value={formik.values.lab}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Lab"
                            error={formik.touched.lab && formik.errors.lab ? { message: formik.errors.lab } : null}
                            options={configs.labs.map(lab => ({ value: lab, label: lab }))}
                        />

                        {showDocumentFields && (
                            <div className="flex flex-col gap-4 col-span-1 md:col-span-2 mt-4">
                                <label className="text-orange-500 font-bold uppercase text-lg text-center">Upload Aadhar Card & PAN Card</label>
                                <div className="flex gap-12 justify-center mt-2">
                                    {/* Aadhar Upload */}
                                    <div className="flex flex-col items-center gap-2">
                                        <input type="file" hidden ref={aadharInputRef} onChange={(e) => handleFileSelect(e, 'aadhar')} accept="image/*" />
                                        <div
                                            onClick={() => aadharInputRef.current.click()}
                                            className={`w-40 h-28 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-sm ${formik.touched.aadharCard && formik.errors.aadharCard ? 'border-red-500 bg-red-50' : 'border-orange-300 hover:bg-orange-50'}`}
                                        >
                                            {images.aadhar.preview ? (
                                                <img src={images.aadhar.preview} alt="Aadhar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center text-xs text-orange-400">
                                                    <Icon icon="ph:identification-card-bold" className="text-4xl mb-1 mx-auto" />
                                                    <span className="font-bold">Aadhar Card Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {images.aadhar.file && !images.aadhar.url && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpload('aadhar')}
                                                    className="text-[10px] bg-orange-500 text-white px-4 py-1.5 rounded-full uppercase font-black hover:bg-orange-600 transition-colors shadow-md"
                                                >
                                                    {images.aadhar.uploading ? '...' : 'Upload'}
                                                </button>
                                            )}
                                            {images.aadhar.url && <Icon icon="mdi:check-circle" className="text-green-500 text-2xl animate-bounce-short" />}
                                        </div>
                                        {formik.touched.aadharCard && formik.errors.aadharCard && (
                                            <p className="text-[10px] text-red-500 font-bold">Image required</p>
                                        )}
                                    </div>

                                    {/* PAN Upload */}
                                    <div className="flex flex-col items-center gap-2">
                                        <input type="file" hidden ref={panInputRef} onChange={(e) => handleFileSelect(e, 'pan')} accept="image/*" />
                                        <div
                                            onClick={() => panInputRef.current.click()}
                                            className={`w-40 h-28 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-sm ${formik.touched.panCard && formik.errors.panCard ? 'border-red-500 bg-red-50' : 'border-orange-300 hover:bg-orange-50'}`}
                                        >
                                            {images.pan.preview ? (
                                                <img src={images.pan.preview} alt="PAN Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center text-xs text-orange-400">
                                                    <Icon icon="ph:credit-card-bold" className="text-4xl mb-1 mx-auto" />
                                                    <span className="font-bold">PAN Card Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {images.pan.file && !images.pan.url && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpload('pan')}
                                                    className="text-[10px] bg-orange-500 text-white px-4 py-1.5 rounded-full uppercase font-black hover:bg-orange-600 transition-colors shadow-md"
                                                >
                                                    {images.pan.uploading ? '...' : 'Upload'}
                                                </button>
                                            )}
                                            {images.pan.url && <Icon icon="mdi:check-circle" className="text-green-500 text-2xl animate-bounce-short" />}
                                        </div>
                                        {formik.touched.panCard && formik.errors.panCard && (
                                            <p className="text-[10px] text-red-500 font-bold">Image required</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-6 pt-10">
                        <Button
                            type="submit"
                            className="max-w-[200px]"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                        <button
                            type="button"
                            onClick={() => {
                                formik.resetForm();
                                setImages({
                                    aadhar: { file: null, preview: null, url: '', uploading: false },
                                    pan: { file: null, preview: null, url: '', uploading: false }
                                });
                            }}
                            className="px-16 py-4 rounded-full border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 transition-all uppercase tracking-widest min-w-[240px]"
                        >
                            Save as Draft
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;
