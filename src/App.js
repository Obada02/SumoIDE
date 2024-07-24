import React, { useState, useRef } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import MonacoEditor from '@monaco-editor/react';

function App() {
    const [fileContent, setFileContent] = useState('');
    const fileInputRef = useRef(null);

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
            <Typography variant="h4" gutterBottom>SumoIDE</Typography>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={openFile}
            />
            <Button variant="contained" color="primary" onClick={() => fileInputRef.current.click()}>Open File</Button>
            <Button variant="contained" color="secondary" onClick={saveFile}>Save File</Button>
            <Box sx={{ height: '80vh', mt: 2 }}>
                <MonacoEditor
                    height="100%"
                    language="cpp"
                    value={fileContent}
                    defaultValue={fileContent}
                    onChange={(value) => setFileContent(value)}
                    options={{ theme: 'vs-dark' }}
                />
            </Box>
        </Container>
    );
}

export default App;