import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, TextField, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';
import debounce from 'lodash.debounce';

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
                    'editor.background': '#000000',
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
                    acc[name] = { type, value };
                }
                return acc;
            }, {});
            setGlobalVariables(vars);
        }
    };

    const updateCode = useCallback(debounce(() => {
        let updatedCode = fileContent;
        for (const [name, { value }] of Object.entries(globalVariables)) {
            const regex = new RegExp(`(${name}\\s*=\\s*)[^;]+;`, 'g');
            updatedCode = updatedCode.replace(regex, `$1${value};`);
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

    return (
        <div>
            <AppBar position="static">
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
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Control Dashboard</Typography>
                <Grid container spacing={2}>
                    {Object.entries(globalVariables).map(([name, { value }]) => (
                        <Grid item xs={12} md={6} key={name}>
                            <TextField
                                label={name}
                                type="text"
                                fullWidth
                                value={value}
                                onChange={(e) => handleVariableChange(name, e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
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
