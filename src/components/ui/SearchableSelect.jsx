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
    // We want to keep track of what the input text should be.
    // By default, it's the label of the current 'value'.
    const [inputValue, setInputValue] = React.useState('');

    // Synchronize the input text when the value changes externally
    // or when the options finally load to provide the label for a value.
    React.useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value);
        if (selectedOption) {
            setInputValue(selectedOption.label || '');
        } else if (!value) {
            setInputValue('');
        }
    }, [value, options]); // Sync when value OR options change

    return (
        <div className={`w-full ${containerClassName}`}>
            <Autocomplete
                id={name}
                options={options}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option?.label || '';
                }}
                // We find the selected option from the list. 
                // If not found (e.g. during search), we still want MUI to respect the controlled 'value'.
                // To do this smoothly, we can pass the currently selected object if value exists.
                value={options.find(opt => opt.value === value) || null}
                loading={loading}
                // Control the input text independently 
                inputValue={inputValue}
                onInputChange={(event, newInputValue, reason) => {
                    // Only update our internal state if the change comes from typing or clearing
                    if (reason === 'input' || reason === 'clear') {
                        setInputValue(newInputValue);
                        if (onSearch) onSearch(newInputValue);
                    }
                }}
                // Only disable internal filtering if we are doing server-side search (onSearch provided)
                filterOptions={onSearch ? (x) => x : undefined}
                onChange={(event, newValue) => {
                    // console.log('Selection Change:', newValue);
                    
                    if (onChange) {
                        onChange({
                            target: {
                                name,
                                value: newValue ? newValue.value : ''
                            }
                        });
                    }

                    // Update local input text immediately on selection
                    if (newValue) {
                        setInputValue(newValue.label || '');
                    } else {
                        setInputValue('');
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
                            ...props.sx // Merge custom styles
                        }}
                    />
                )}
                {...props}
            />
        </div>
    );
};

export default SearchableSelect;
