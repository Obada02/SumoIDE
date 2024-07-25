import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Button, Container, Typography, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonacoEditor, { loader } from '@monaco-editor/react';

function App() {
    const [fileContent, setFileContent] = useState('');
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
            .then(data => setFileContent(data))
            .catch(error => console.error('Error fetching default code:', error));
    }, []);

    const openFile = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const content = await file.text();
            setFileContent(content);
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
