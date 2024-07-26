import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Grid, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';
import debounce from 'lodash.debounce';
import Gauge from './Gauge';
import AirplaneToggle from './AirplaneToggle';

const codeEditorBackground = '#201E43';
const menuBarBackground = '#201E43'; // Red
const websiteBackground = '#F5F5F5'; // Very Light Gray
const textColor = '#212121'; // Very Dark Gray
const accentColor = '#FFEB3B'; // Yellow
const highlightColor = '#E91E63'; // Pink

function App() {
    const [fileContent, setFileContent] = useState('');
    const [globalVariables, setGlobalVariables] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        loader.init().then(monaco => {
            monaco.editor.defineTheme('custom-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': codeEditorBackground,
                }
            });
            monaco.editor.setTheme('custom-dark');
        });

        // Fetch the default code from the file
        fetch('/defaultCode.ino')
            .then(response => response.text())
            .then(data => {
                setFileContent(data);
                extractGlobalVariables(data);
            })
            .catch(error => console.error('Error fetching default code:', error));
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
        setGlobalVariables(prevState => ({
            ...prevState,
            [name]: {
                ...prevState[name],
                value,
            },
        }));
    };

    const openFile = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const content = await file.text();
                setFileContent(content);
                extractGlobalVariables(content); // Extract variables from the newly opened file
                fileInputRef.current.value = '';  // Reset the input
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    };

    const saveFile = () => {
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
    };

    const renderInputField = (name, value) => {
        if (name.toLowerCase().includes('strategy')) {
            return (
                <Grid container justifyContent="center" spacing={1} marginBottom={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel style={{ color: textColor }}>{name}</InputLabel>
                            <Select
                                value={value}
                                onChange={(e) => handleVariableChange(name, e.target.value)}
                                label={name}
                                style={{ color: textColor }}
                            >
                                <MenuItem value={0}>SearchAndDestroy</MenuItem>
                                <MenuItem value={1}>AggressivePursuit</MenuItem>
                                <MenuItem value={2}>InitialEvadeAndSearch</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            );
        } else if (value === 'true' || value === 'false') {
            return (
                <Grid container justifyContent="center" alignItems="center" spacing={1} marginBottom={2}>
                    <Grid item xs={12} md={6} textAlign="center">
                        <Typography variant="h5" display="inline" marginRight={2} style={{ color: textColor }}>{name}</Typography>
                        <AirplaneToggle
                            checked={value === 'true'}
                            onChange={(e) => handleVariableChange(name, e.target.checked ? 'true' : 'false')}
                            name={name}
                        />
                    </Grid>
                </Grid>
            );
        } else if (!isNaN(value)) {
            return (
                <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={6}>
                        <TextField
                            label={name}
                            type="number"
                            fullWidth
                            value={value}
                            onChange={(e) => handleVariableChange(name, e.target.value)}
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
        }
        return (
            <TextField
                label={name}
                type="text"
                fullWidth
                value={value}
                onChange={(e) => handleVariableChange(name, e.target.value)}
                variant="outlined"
                InputLabelProps={{
                    style: { color: textColor },
                }}
                InputProps={{
                    style: { color: textColor },
                }}
            />
        );
    };

    return (
        <div style={{ backgroundColor: websiteBackground, color: textColor, minHeight: '100vh' }}>
            <AppBar position="static" style={{ backgroundColor: menuBarBackground }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Button color="inherit" onClick={() => fileInputRef.current.click()}>Open File</Button>
                    <Button color="inherit" onClick={saveFile}>Save File</Button>
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
}

export default App;
