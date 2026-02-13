import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const Select = ({ label, options = [], value, onChange, placeholder = 'Select option', error, containerClassName = "", ...props }) => {
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
                        borderRadius: '9999px', // rounded-full
                        backgroundColor: 'rgba(229, 231, 235, 0.8)', // bg-gray-200/80
                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(245, 158, 11, 0.5)', // hover amber
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#F59E0B', // focus amber-500
                        },
                        '& .MuiSelect-select': {
                            paddingLeft: '1.5rem', // px-6
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: '#374151', // text-gray-700
                        marginLeft: '0.5rem',
                        '&.Mui-focused': {
                            color: '#F59E0B',
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
