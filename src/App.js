import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, TextField, Grid } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';

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
        // Update code based on state
        const updatedCode = fileContent
            .replace(/SEARCH_SPEED = \d+/g, `SEARCH_SPEED = ${forwardSpeed}`)
            .replace(/FOUND_SPEED = \d+/g, `FOUND_SPEED = ${initialSpeed}`);
        setFileContent(updatedCode);
    }, [forwardSpeed, initialSpeed]);

    const extractGlobalVariables = (code) => {
        const searchSpeedMatch = code.match(/SEARCH_SPEED\s*=\s*(\d+)/);
        const foundSpeedMatch = code.match(/FOUND_SPEED\s*=\s*(\d+)/);

        if (searchSpeedMatch) setForwardSpeed(searchSpeedMatch[1]);
        if (foundSpeedMatch) setInitialSpeed(foundSpeedMatch[1]);
    };

    const openFile = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const content = await file.text();
            setFileContent(content);
            extractGlobalVariables(content); // Extract variables from the newly opened file
            fileInputRef.current.value = '';  // Reset the input
        }
    };

    const saveFile = () => {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'file.ino';
        a.click();
        URL.revokeObjectURL(url);
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
                    />
                </Box>
            </Box>
        </div>
    );
}

export default App;
