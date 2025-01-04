import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import config from '../config';

const FactChecker = () => {
  const [factText, setFactText] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setFactText(e.target.value);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setParsedResult(null);
    setLoading(true);
    console.log('Fact Text Submitted:', factText);

    if (!factText.trim()) {
      setErrorMessage('Please enter text to check.');
      console.log('Error: Empty fact text.');
      setLoading(false);
      return;
    }

    try {
      console.log('Making API call to:', config.REACT_APP_FACT_CHECKER_API);

      const response = await fetch(`${config.REACT_APP_FACT_CHECKER_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: factText }),
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      setParsedResult(data.result); // Ensure "result" matches your backend response key
    } catch (error) {
      console.error('Error during API call:', error);
      setErrorMessage('Error occurred while checking facts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!parsedResult) {
      console.log('No parsed result available.');
      return null;
    }

    console.log('Rendering Parsed Result:', parsedResult);

    return (
      <List>
        {Object.entries(parsedResult).map(([key, value]) => (
          <ListItem key={key}>
            <ListItemText
              primary={<strong>{key}:</strong>}
              secondary={typeof value === 'string' ? value : JSON.stringify(value)}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>Fact Checker</Typography>
        <TextField
          label="Enter text to check for facts"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={factText}
          onChange={handleInputChange}
          sx={{ marginBottom: '20px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ marginBottom: '20px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Facts'}
        </Button>
        {errorMessage && <Alert severity="error" sx={{ marginBottom: '20px' }}>{errorMessage}</Alert>}
        <Box>
          <Typography variant="h5" gutterBottom>Fact Check Result</Typography>
          {renderResult()}
        </Box>
      </Paper>
    </Box>
  );
};

export default FactChecker;
