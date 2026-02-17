import React, { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = forwardRef(({ label, type = 'text', placeholder, value, onChange, icon, error, containerClassName = "", variant = "default", ...props }, ref) => {
    const isOrange = variant === "orange";

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
                        <InputAdornment position="end" className="cursor-pointer" sx={{ color: isOrange ? '#000' : 'inherit' }}>
                            {icon}
                        </InputAdornment>
                    ) : null,
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: isOrange ? '#F59E0B' : 'rgba(229, 231, 235, 0.5)',
                        color: isOrange ? '#000' : 'inherit',
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
                        '& input': {
                            paddingLeft: '1rem',
                            '&::placeholder': {
                                color: isOrange ? 'rgba(0,0,0,0.6)' : 'inherit',
                                opacity: 1,
                            }
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: isOrange ? '#000' : '#4B5563',
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
            />
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
