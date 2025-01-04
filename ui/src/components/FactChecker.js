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

    if (!factText.trim()) {
      setErrorMessage('Please enter text to check.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.REACT_APP_FACT_CHECKER_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: factText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setParsedResult(data.body?.result); // Extract result from API response
    } catch (error) {
      setErrorMessage('Error occurred while checking facts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!parsedResult) {
      return null;
    }

    const { Answer, DOCUMENT, FACT, "Grade Model": gradeModel } = parsedResult;
    const parsedGradeModel = gradeModel ? JSON.parse(gradeModel) : [];

    return (
      <List>
        {/* Grade Model */}
        <ListItem>
          <ListItemText
            primary="Grade Model"
            secondary={parsedGradeModel.length > 0
              ? `Useful: ${parsedGradeModel[0]?.useful || 'no'}`
              : 'No grade model data available'}
          />
        </ListItem>

        {/* Fact */}
        <ListItem>
          <ListItemText
            primary="Fact"
            secondary={FACT?.trim()
              ? FACT
              : 'No verifiable facts found.'}
          />
        </ListItem>

        {/* Answer */}
        {Answer && (
          <ListItem>
            <ListItemText primary="Answer" secondary={Answer} />
          </ListItem>
        )}

        {/* Document */}
        {DOCUMENT && (
          <ListItem>
            <ListItemText
              primary="Document"
              secondary={
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {DOCUMENT}
                </div>
              }
            />
          </ListItem>
        )}
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
