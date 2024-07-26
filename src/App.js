import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, TextField, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';
import debounce from 'lodash.debounce';

function App() {
    const [fileContent, setFileContent] = useState('');
    const [forwardSpeed, setForwardSpeed] = useState('');
    const [initialSpeed, setInitialSpeed] = useState('');
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

    useEffect(() => {
        updateCode();
    }, [forwardSpeed, initialSpeed]);

    const updateCode = useCallback(debounce(() => {
        const updatedCode = fileContent
            .replace(/SEARCH_SPEED = \d+/g, `SEARCH_SPEED = ${forwardSpeed}`)
            .replace(/FOUND_SPEED = \d+/g, `FOUND_SPEED = ${initialSpeed}`);
        setFileContent(updatedCode);
    }, 300), [fileContent, forwardSpeed, initialSpeed]);

    const extractGlobalVariables = (code) => {
        const searchSpeedMatch = code.match(/SEARCH_SPEED\s*=\s*(\d+)/);
        const foundSpeedMatch = code.match(/FOUND_SPEED\s*=\s*(\d+)/);

        if (searchSpeedMatch) setForwardSpeed(searchSpeedMatch[1]);
        if (foundSpeedMatch) setInitialSpeed(foundSpeedMatch[1]);
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
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Search Speed"
                            type="number"
                            fullWidth
                            value={forwardSpeed}
                            onChange={(e) => setForwardSpeed(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Found Speed"
                            type="number"
                            fullWidth
                            value={initialSpeed}
                            onChange={(e) => setInitialSpeed(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
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
