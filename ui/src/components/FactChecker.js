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
  const [parsedResult, setParsedResult] = useState(null); // Parsed result for display
  const [errorMessage, setErrorMessage] = useState(null); // Error message state
  const [loading, setLoading] = useState(false); // Loading state

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: factText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const { result } = data;
      setParsedResult(result);
    } catch (error) {
      setErrorMessage('Error occurred while checking facts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!parsedResult) return null;

    if (Array.isArray(parsedResult)) {
      return (
        <List>
          {parsedResult.map((item, index) => (
            <ListItem key={index} style={{ marginBottom: '10px' }}>
              <ListItemText
                primary={`Answer: ${item.answer || 'N/A'}`}
                secondary={
                  <>
                    {item.rationale && <div><strong>Rationale:</strong> {item.rationale}</div>}
                    {item.excerpt && <div><strong>Excerpt:</strong> {item.excerpt}</div>}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      );
    } else if (typeof parsedResult === 'object') {
      return (
        <List>
          {Object.entries(parsedResult).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText
                primary={<strong>{key}:</strong>}
                secondary={JSON.stringify(value)}
              />
            </ListItem>
          ))}
        </List>
      );
    } else {
      return <Typography>{parsedResult}</Typography>;
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: 'auto',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Fact Checker
        </Typography>
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
          <Typography variant="h5" gutterBottom>
            Fact Check Result
          </Typography>
          {renderResult()}
        </Box>
      </Paper>
    </Box>
  );
};

export default FactChecker;
