import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';

const SearchableSelect = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Search & select...',
    error,
    containerClassName = "",
    icon,
    name,
    loading = false,
    onSearch,
    ...props
}) => {
    // Find the option object that matches the current value
    const selectedOption = options.find(opt => opt.value === value) || null;

    return (
        <div className={`w-full ${containerClassName}`}>
            <Autocomplete
                id={name}
                options={options}
                getOptionLabel={(option) => option.label || ''}
                value={selectedOption}
                loading={loading}
                onInputChange={(event, newInputValue) => {
                    if (onSearch) onSearch(newInputValue);
                }}
                filterOptions={(x) => x}
                onChange={(event, newValue) => {
                    if (onChange) {
                        onChange({
                            target: {
                                name,
                                value: newValue ? newValue.value : ''
                            }
                        });
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder={placeholder}
                        error={!!error}
                        helperText={error ? error.message : null}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {params.InputProps.endAdornment}
                                    {icon && (
                                        <InputAdornment position="end" sx={{ mr: 1 }}>
                                            {icon}
                                        </InputAdornment>
                                    )}
                                </>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: 'rgba(229, 231, 235, 0.5)',
                                '& fieldset': {
                                    borderColor: '#F59E0B',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#F59E0B',
                                    borderWidth: '2px',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#F59E0B',
                                    borderWidth: '2px',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#1b1c1dff',
                                '&.Mui-focused': {
                                    color: '#F59E0B',
                                },
                            },
                        }}
                    />
                )}
                {...props}
            />
        </div>
    );
};

export default SearchableSelect;
