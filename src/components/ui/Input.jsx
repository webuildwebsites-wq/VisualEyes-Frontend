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
                        borderRadius: '12px',
                        backgroundColor: 'rgba(229, 231, 235, 0.5)',
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
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: '#4B5563',
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
            />
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
