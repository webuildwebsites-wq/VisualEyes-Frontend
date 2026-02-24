import React, { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = forwardRef(({ label, type = 'text', placeholder, value, onChange, icon, error, containerClassName = "", variant = "default", isVerificationMode = false, isRejected = false, onToggleRejection, name, ...props }, ref) => {
    const isOrange = variant === "orange";

    return (
        <div className={`w-full flex items-center gap-2 ${containerClassName}`}>
            {isVerificationMode && (
                <div
                    onClick={() => onToggleRejection?.(name)}
                    className={`w-5 h-5 min-w-[20px] rounded border-2 transition-colors cursor-pointer flex items-center justify-center
                        ${isRejected ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}
                    `}
                >
                    {isRejected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
            )}
            <TextField
                inputRef={ref}
                fullWidth
                label={label}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                error={!!error || isRejected}
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
                            borderColor: isRejected ? '#EF4444' : '#F59E0B',
                            borderWidth: isRejected ? '2px' : '1px',
                        },
                        '&:hover fieldset': {
                            borderColor: isRejected ? '#EF4444' : '#F59E0B',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: isRejected ? '#EF4444' : '#F59E0B',
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
                        color: isRejected ? '#EF4444' : (isOrange ? '#000' : '#4B5563'),
                        '&.Mui-focused': {
                            color: isRejected ? '#EF4444' : (isOrange ? '#000' : '#F59E0B'),
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
