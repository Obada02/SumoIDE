import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Grid, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';
import debounce from 'lodash.debounce';
import Gauge from './Gauge';
import Toggle from './Toggle';
import { strategies } from './strategies';

import downloadIcon from './assets/downloads.png';
import uploadIcon from './assets/upload.png';

const codeEditorBackground = '#201E43';
const menuBarBackground = '#201E43';
const websiteBackground = '#F5F5F5';
const textColor = '#212121';

const fetchDefaultCode = async (setFileContent, extractGlobalVariables) => {
    try {
        const response = await fetch('/defaultCode.ino');
        const data = await response.text();
        setFileContent(data);
        extractGlobalVariables(data);
    } catch (error) {
        console.error('Error fetching default code:', error);
    }
};

const defineCustomTheme = async () => {
    const monaco = await loader.init();
    monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.background': codeEditorBackground,
        }
    });
    monaco.editor.setTheme('custom-dark');
};

const App = () => {
    const [fileContent, setFileContent] = useState('');
    const [globalVariables, setGlobalVariables] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        defineCustomTheme();
        fetchDefaultCode(setFileContent, extractGlobalVariables);
    }, []);

    const extractGlobalVariables = (code) => {
        const globalSection = code.match(/\/\/ Global variables([\s\S]*?)\/\/ Function prototypes/);
        if (globalSection) {
            const vars = globalSection[1].split('\n').reduce((acc, line) => {
                const match = line.match(/(const\s+)?(\w+)\s+(\w+)\s*=\s*([^;]+);/);
                if (match) {
                    const [, , type, name, value] = match;
                    acc[name] = { type, value: value.trim(), originalValue: value.trim() };
                }
                return acc;
            }, {});
            setGlobalVariables(vars);
        }
    };

    const updateCode = useCallback(debounce(() => {
        let updatedCode = fileContent;
        for (const [name, { value, originalValue }] of Object.entries(globalVariables)) {
            const regex = new RegExp(`(${name}\\s*=\\s*)${originalValue}`, 'g');
            updatedCode = updatedCode.replace(regex, `$1${value}`);
        }
        setFileContent(updatedCode);
    }, 300), [fileContent, globalVariables]);

    useEffect(() => {
        updateCode();
    }, [globalVariables]);

    const handleVariableChange = (name, value) => {
        if (name.toLowerCase().includes('strategy')) {
            ensureStrategyExists(value);
        }

        setGlobalVariables(prevState => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value,
            },
        }));
    };

    const openFile = useCallback(async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const content = await file.text();
                setFileContent(content);
                extractGlobalVariables(content);
                fileInputRef.current.value = '';  // Reset the input field
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    }, []);

    const saveFile = useCallback(() => {
        try {
            const blob = new Blob([fileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'file.ino';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }, [fileContent]);

    const ensureDependenciesExist = (dependencies, code) => {
        let updatedCode = code;
        dependencies.forEach(dep => {
            if (!updatedCode.includes(dep)) {
                updatedCode = updatedCode.replace('// Function prototypes', `${dep}\n// Function prototypes`);
            }
        });
        return updatedCode;
    };

    const ensureStrategyExists = (strategy) => {
        let updatedCode = fileContent;
        const strategyDetails = strategies[strategy];

        if (!strategyDetails) {
            console.error(`Strategy "${strategy}" not found in strategies object`);
            return;
        }

        const { prototype, implementation, dependencies } = strategyDetails;

        updatedCode = ensureDependenciesExist(dependencies, updatedCode);

        if (!updatedCode.includes(prototype)) {
            updatedCode = updatedCode.replace('// Function prototypes', `// Function prototypes\n${prototype}`);
            updatedCode += `\n${implementation.trim()}\n`;
        }

        setFileContent(updatedCode);
    };

    const renderInputField = (name, value) => {
        if (name.toLowerCase().includes('strategy')) {
            return <StrategySelect name={name} value={value} onChange={handleVariableChange} />;
        } else if (value === 'true' || value === 'false') {
            return <BooleanToggle name={name} value={value} onChange={handleVariableChange} />;
        } else if (!isNaN(value)) {
            return <NumericInput name={name} value={value} onChange={handleVariableChange} />;
        }
        return <TextInput name={name} value={value} onChange={handleVariableChange} />;
    };

    return (
        <div style={{ backgroundColor: websiteBackground, color: textColor, minHeight: '100vh' }}>
            <AppBar position="static" style={{ backgroundColor: menuBarBackground }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => fileInputRef.current.click()}>
                        <img src={uploadIcon} alt="Open File" style={{ width: 24, height: 24 }} />
                    </IconButton>
                    <IconButton color="inherit" onClick={saveFile}>
                        <img src={downloadIcon} alt="Save File" style={{ width: 24, height: 24 }} />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        SumoIDE
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 2, ml: 2 }} marginTop="50px">
                <Typography variant="h3" textAlign="center" gutterBottom>Control Dashboard</Typography>
                <Grid container spacing={1} justifyContent="center" marginTop="100px">
                    {Object.entries(globalVariables).map(([name, { value }]) => (
                        (name.toLowerCase().includes('strategy') || value === 'true' || value === 'false') && (
                            <Grid item xs={12} key={name}>
                                {renderInputField(name, value)}
                            </Grid>
                        )
                    ))}
                </Grid>
                <Grid container spacing={1} width="90%" textAlign="center" marginLeft="90px">
                    {Object.entries(globalVariables).map(([name, { value }]) => (
                        (!name.toLowerCase().includes('strategy') && value !== 'true' && value !== 'false') && (
                            <Grid item xs={12} md={6} key={name}>
                                {renderInputField(name, value)}
                            </Grid>
                        )
                    ))}
                </Grid>
            </Box>
            <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ width: '90%' }}>
                    <MonacoEditor
                        height="100%"
                        language="cpp"
                        value={fileContent}
                        onChange={(value) => setFileContent(value)}
                        theme="custom-dark"
                        options={{
                            lineNumbers: 'on',
                            minimap: { enabled: false },
                            wordWrap: 'on',
                        }}
                    />
                </Box>
            </Box>
            <input
                type="file"
                ref={fileInputRef}
                onChange={openFile}
                style={{ display: 'none' }}
            />
        </div>
    );
};

const StrategySelect = ({ name, value, onChange }) => (
    <Grid container justifyContent="center" spacing={1} marginBottom={2}>
        <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
                <InputLabel style={{ color: textColor }}>{name}</InputLabel>
                <Select
                    value={value}
                    onChange={(e) => onChange(name, e.target.value)}
                    label={name}
                    style={{ color: textColor }}
                >
                    <MenuItem value="SearchAndDestroy">SearchAndDestroy</MenuItem>
                    <MenuItem value="aggressivePursuit">AggressivePursuit</MenuItem>
                    <MenuItem value="InitialEvadeAndSearch">InitialEvadeAndSearch</MenuItem>
                </Select>
            </FormControl>
        </Grid>
    </Grid>
);

const BooleanToggle = ({ name, value, onChange }) => (
    <Grid container justifyContent="center" alignItems="center" spacing={1} marginBottom={2}>
        <Grid item xs={12} md={6} textAlign="center">
            <Typography variant="h5" display="inline" marginRight={2} style={{ color: textColor }}>{name}</Typography>
            <Toggle
                checked={value === 'true'}
                onChange={(e) => onChange(name, e.target.checked ? 'true' : 'false')}
                name={name}
            />
        </Grid>
    </Grid>
);

const NumericInput = ({ name, value, onChange }) => (
    <Grid container alignItems="center" spacing={1}>
        <Grid item xs={6}>
            <TextField
                label={name}
                type="number"
                fullWidth
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                variant="outlined"
            />
        </Grid>
        <Grid item xs={6}>
            <Gauge
                value={parseFloat(value)}
                max={250}
                name={name}
            />
        </Grid>
    </Grid>
);

const TextInput = ({ name, value, onChange }) => (
    <TextField
        label={name}
        type="text"
        fullWidth
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        variant="outlined"
        InputLabelProps={{
            style: { color: textColor },
        }}
        InputProps={{
            style: { color: textColor },
        }}
    />
);

export default App;
