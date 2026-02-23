import React from 'react';
import { TextField, MenuItem, InputAdornment } from '@mui/material';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select option',
    error,
    containerClassName = "",
    variant = "default", // default, orange
    multiple = false,
    icon,
    ...props
}) => {
    const isOrange = variant === "orange";

    return (
        <div className={`w-full ${containerClassName}`}>
            <TextField
                select
                fullWidth
                label={label}
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={error ? error.message : null}
                SelectProps={{
                    multiple: multiple,
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (multiple) {
                            if (!selected || selected.length === 0) return <span className={isOrange ? 'text-white' : 'text-gray-400'}>{placeholder}</span>;
                            // Map selected values to labels
                            const selectedLabels = (Array.isArray(selected) ? selected : [selected]).map(val => {
                                const option = options.find(opt => opt.value === val);
                                return option ? option.label : val;
                            });
                            return selectedLabels.join(', ');
                        }
                        return options.find(opt => opt.value === selected)?.label || <span className={isOrange ? 'text-white' : 'text-gray-400'}>{placeholder}</span>;
                    }
                }}
                InputProps={{
                    endAdornment: icon ? (
                        <InputAdornment position="end" sx={{ mr: 2, color: isOrange ? 'white' : 'inherit' }}>
                            {icon}
                        </InputAdornment>
                    ) : null,
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: isOrange ? '#F59E0B' : 'rgba(229, 231, 235, 0.5)',
                        color: isOrange ? '#000' : '#000000ff',
                        '& fieldset': {
                            borderColor: '#F59E0B',
                            borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: '#F59E0B',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#F59E0B',
                            borderWidth: '2px',
                        },
                        '& .MuiSelect-select': {
                            paddingLeft: '1rem',
                        },
                        '& .MuiSvgIcon-root': {
                            color: isOrange ? '#000' : 'inherit',
                            display: icon ? 'none' : 'block' // Hide default arrow if custom icon is provided
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: isOrange ? '#000' : '#1b1c1dff',
                        '&.Mui-focused': {
                            color: isOrange ? '#000' : '#F59E0B',
                        },
                    },
                    '& .MuiFormHelperText-root': {
                        marginLeft: '1rem',
                        color: '#EF4444',
                    }
                }}
                {...props}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>
        </div>
    );
};

export default Select;
