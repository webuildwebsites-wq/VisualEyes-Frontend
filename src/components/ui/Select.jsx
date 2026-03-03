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
    isVerificationMode = false,
    isRejected = false,
    onToggleRejection,
    name,
    ...props
}) => {
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
                select
                fullWidth
                label={label}
                name={name}
                value={value}
                onChange={onChange}
                error={!!error || isRejected}
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
                InputLabelProps={{
                    shrink: true,
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
                        '& .MuiSelect-select': {
                            paddingLeft: '1rem',
                        },
                        '& .MuiSvgIcon-root': {
                            color: isOrange ? '#000' : 'inherit',
                            display: icon ? 'none' : 'block' // Hide default arrow if custom icon is provided
                        }
                    },
                    '& .MuiInputLabel-root': {
                        color: isRejected ? '#EF4444' : (isOrange ? '#000' : '#1b1c1dff'),
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
