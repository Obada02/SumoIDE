import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
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
        <Container>
            <Box sx={{ textAlign: 'center', my: 1 }}>
                <Typography variant="h4" gutterBottom>SumoIDE</Typography>
            </Box>
            <Box>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={openFile}
                />
                <Button variant="contained" color="primary" onClick={() => fileInputRef.current.click()} sx={{ mx: 1 }}>
                    Open File
                </Button>
            </Box>
            <Box sx={{ height: '70vh', mt: 1 }}>
                <MonacoEditor
                    height="100%"
                    language="cpp"
                    value={fileContent}
                    onChange={(value) => setFileContent(value)}
                    theme="custom-dark"
                />
            </Box>
            <Box sx={{ textAlign: 'center', my: 1 }}>
                <Button variant="contained" color="primary" onClick={saveFile} sx={{ mt: 1 }}>
                    Save File
                </Button>
            </Box>
        </Container>
    );
}

export default App;