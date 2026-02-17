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
import { toast } from 'react-toastify';
import { useState, useRef, useEffect } from 'react';


const Registration = () => {
    const navigate = useNavigate();
    const aadharInputRef = useRef(null);
    const panInputRef = useRef(null);

    const [images, setImages] = useState({
        aadhar: { file: null, preview: null, url: '', uploading: false },
        pan: { file: null, preview: null, url: '', uploading: false }
    });

    const [configs, setConfigs] = useState({
        userTypes: [],
        roles: [],
        departments: [],
        labs: [],
        regions: []
    });

    const [loadingConfigs, setLoadingConfigs] = useState(true);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const response = await getSystemConfigs();
                if (response.success) {
                    const mappedConfigs = {
                        userTypes: response.data.find(c => c.configType === 'UserType')?.values || [],
                        roles: response.data.find(c => c.configType === 'Role')?.values || [],
                        departments: response.data.find(c => c.configType === 'Department')?.values || [],
                        labs: response.data.find(c => c.configType === 'Lab')?.values || [],
                        regions: response.data.find(c => c.configType === 'Region')?.values || []
                    };
                    setConfigs(mappedConfigs);
                }
            } catch (error) {
                console.error('Failed to fetch configs:', error);
                toast.error("Failed to load form options");
            } finally {
                setLoadingConfigs(false);
            }
        };

        fetchConfigs();
    }, []);

    const validationSchema = Yup.object({
        employeeType: Yup.string().required('Employee Type is required'),
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required'),
        phone: Yup.string()
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits')
            .required('Phone is required'),
        department: Yup.string().required('Department is required'),
        role: Yup.string().required('Role is required'),
        region: Yup.string().when('department', {
            is: (val) => val?.toUpperCase() === 'SALES',
            then: (schema) => schema.required('Region is required for Sales department'),
            otherwise: (schema) => schema.notRequired()
        }),
        lab: Yup.string().required('Lab is required'),
        aadharCard: Yup.string().url().required('Aadhar Card upload is required'),
        panCard: Yup.string().url().required('PAN Card upload is required'),
    });

    const formik = useFormik({
        initialValues: {
            employeeType: '',
            username: '',
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
            panCard: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await createSupervisorUser(values);
                if (response.success) {
                    toast.success("User Registered Successfully!");
                    navigate('/welcome', { state: { from: 'register' } });
                }
            } catch (error) {
                console.error('Registration Error:', error);
                toast.error(error.error?.message || error.message || "Failed to create user");
            } finally {
                setSubmitting(false);
            }
        },
    });

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

    return (
        <div className="flex justify-center p-4 py-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-5xl border border-gray-200">
                <form onSubmit={formik.handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Employee Type"
                            name="employeeType"
                            variant="orange"
                            value={formik.values.employeeType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Employee Type"
                            error={formik.touched.employeeType && formik.errors.employeeType ? { message: formik.errors.employeeType } : null}
                            options={configs.userTypes.map(type => ({ value: type, label: type }))}
                            disabled={loadingConfigs}
                        />
                        <Input
                            label="Username"
                            name="username"
                            placeholder="Enter Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && formik.errors.username ? { message: formik.errors.username } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email"
                            name="email"
                            placeholder="Enter Email Address"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && formik.errors.email ? { message: formik.errors.email } : null}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password ? { message: formik.errors.password } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Mobile No."
                            name="phone"
                            placeholder="Enter Phone Number"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && formik.errors.phone ? { message: formik.errors.phone } : null}
                        />
                        <Input
                            label="Address"
                            name="address"
                            placeholder="Enter Address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.address && formik.errors.address ? { message: formik.errors.address } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Select Department"
                            name="department"
                            variant="orange"
                            value={formik.values.department}
                            onChange={(e) => {
                                formik.handleChange(e);
                                if (e.target.value?.toUpperCase() !== 'SALES') {
                                    formik.setFieldValue('region', '');
                                }
                            }}
                            onBlur={formik.handleBlur}
                            placeholder="Select Department"
                            error={formik.touched.department && formik.errors.department ? { message: formik.errors.department } : null}
                            options={configs.departments.map(dept => ({ value: dept, label: dept }))}
                            disabled={loadingConfigs}
                        />
                        <Select
                            label="Role"
                            name="role"
                            variant="orange"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Role"
                            error={formik.touched.role && formik.errors.role ? { message: formik.errors.role } : null}
                            options={configs.roles.map(role => ({ value: role, label: role }))}
                            disabled={loadingConfigs}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Country"
                            name="country"
                            placeholder="Enter Country"
                            value={formik.values.country}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.country && formik.errors.country ? { message: formik.errors.country } : null}
                        />
                        <Input
                            label="Pincode"
                            name="pincode"
                            placeholder="Enter Pincode"
                            value={formik.values.pincode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.pincode && formik.errors.pincode ? { message: formik.errors.pincode } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Expiry"
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
                            label="Lab"
                            name="lab"
                            value={formik.values.lab}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Lab"
                            error={formik.touched.lab && formik.errors.lab ? { message: formik.errors.lab } : null}
                            options={configs.labs.map(lab => ({ value: lab, label: lab }))}
                            disabled={loadingConfigs}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formik.values.department?.toUpperCase() === 'SALES' ? (
                            <Select
                                label="Region"
                                name="region"
                                value={formik.values.region}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Select Region"
                                error={formik.touched.region && formik.errors.region ? { message: formik.errors.region } : null}
                                options={['East', 'West', 'North', 'South'].map(r => ({ value: r, label: r }))}
                                disabled={loadingConfigs}
                            />
                        ) : (
                            <div className="hidden md:block" /> // Empty space to maintain grid alignment
                        )}
                        <div className="flex flex-col gap-4">
                            <label className="text-orange-500 font-bold uppercase text-sm">Document Uploads</label>
                            <div className="flex gap-6">
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <input
                                        type="file"
                                        hidden
                                        ref={aadharInputRef}
                                        onChange={(e) => handleFileSelect(e, 'aadhar')}
                                        accept="image/*"
                                    />
                                    <div
                                        onClick={() => aadharInputRef.current.click()}
                                        className="w-full h-24 border-2 border-dashed border-orange-300 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:bg-orange-50 transition-colors"
                                    >
                                        {images.aadhar.preview ? (
                                            <img src={images.aadhar.preview} alt="Aadhar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-xs text-orange-400">
                                                <Icon icon="ph:identification-card-bold" className="text-2xl mb-1 mx-auto" />
                                                Aadhar Card
                                            </div>
                                        )}
                                    </div>
                                    {images.aadhar.file && !images.aadhar.url && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpload('aadhar')}
                                            disabled={images.aadhar.uploading}
                                            className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full uppercase font-bold"
                                        >
                                            {images.aadhar.uploading ? '...' : 'Upload'}
                                        </button>
                                    )}
                                    {images.aadhar.url && (
                                        <Icon icon="mdi:check-circle" className="text-green-500 text-xl" />
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <input
                                        type="file"
                                        hidden
                                        ref={panInputRef}
                                        onChange={(e) => handleFileSelect(e, 'pan')}
                                        accept="image/*"
                                    />
                                    <div
                                        onClick={() => panInputRef.current.click()}
                                        className="w-full h-24 border-2 border-dashed border-orange-300 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:bg-orange-50 transition-colors"
                                    >
                                        {images.pan.preview ? (
                                            <img src={images.pan.preview} alt="PAN Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-xs text-orange-400">
                                                <Icon icon="ph:credit-card-bold" className="text-2xl mb-1 mx-auto" />
                                                PAN Card
                                            </div>
                                        )}
                                    </div>
                                    {images.pan.file && !images.pan.url && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpload('pan')}
                                            disabled={images.pan.uploading}
                                            className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full uppercase font-bold"
                                        >
                                            {images.pan.uploading ? '...' : 'Upload'}
                                        </button>
                                    )}
                                    {images.pan.url && (
                                        <Icon icon="mdi:check-circle" className="text-green-500 text-xl" />
                                    )}
                                </div>
                            </div>
                            {((formik.touched.aadharCard && formik.errors.aadharCard) || (formik.touched.panCard && formik.errors.panCard)) && (
                                <p className="text-xs text-red-500 text-center">Aadhar and PAN card uploads are required</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center items-center max-w-[50%] mx-auto gap-6 mt-12">
                        <Button
                            type="submit"
                            className="  bg-orange-400 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 py-3 rounded-full text-lg uppercase tracking-wider"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                        <Button
                            type="button"
                            style={{ color: 'orange' }}
                            onClick={() => {
                                formik.resetForm();
                                setImages({
                                    aadhar: { file: null, preview: null, url: '', uploading: false },
                                    pan: { file: null, preview: null, url: '', uploading: false }
                                });
                            }}
                            className=" bg-white hover:bg-gray-50  border-2 border-orange-500/50 py-3 rounded-full text-lg uppercase tracking-wider h-auto text-orange-700"
                        >
                            Refresh
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;
