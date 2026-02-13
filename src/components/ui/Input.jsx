import React, { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = forwardRef(({ label, type = 'text', placeholder, value, onChange, icon, error, containerClassName = "", ...props }, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            <TextField
                inputRef={ref}
                fullWidth
                label={label}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error.message : null}
                InputProps={{
                    endAdornment: icon ? (
                        <InputAdornment position="end" className="cursor-pointer">
                            {icon}
                        </InputAdornment>
                    ) : null,
                }}
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
                        '& input': {
                            paddingLeft: '1.5rem', // px-6
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: '#374151', // text-gray-700
                        marginLeft: '0.5rem',
                        '&.Mui-focused': {
                            color: '#F59E0B', // focus amber-500
                        },
                    },
                    // Specific fix for helper text to align with error prop style
                    '& .MuiFormHelperText-root': {
                        marginLeft: '1rem',
                        color: '#EF4444', // text-red-500
                    }
                }}
                {...props}
            />
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
