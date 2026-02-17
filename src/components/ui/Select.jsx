import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select option',
    error,
    containerClassName = "",
    variant = "default", // default, orange
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
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: isOrange ? '#F59E0B' : 'rgba(229, 231, 235, 0.5)',
                        color: isOrange ? '#fff' : '#000',
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
                            color: isOrange ? '#fff' : 'inherit'
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: isOrange ? '#fff' : '#4B5563',
                        '&.Mui-focused': {
                            color: isOrange ? '#fff' : '#F59E0B',
                        },
                    },
                    '& .MuiFormHelperText-root': {
                        marginLeft: '1rem',
                        color: '#EF4444',
                    }
                }}
                {...props}
            >
                {placeholder && (
                    <MenuItem value="" disabled>
                        {placeholder}
                    </MenuItem>
                )}
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
