import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API calls
import config from '../config';
import './SafetyProtocol.css'; // Custom CSS for styling

const SafetyProtocol = () => {
  const [text, setText] = useState(''); // Text input state
  const [response, setResponse] = useState(null); // Response from backend
  const [toxicityScore, setToxicityScore] = useState(null); // Toxicity score

  // Handle text input change
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!text.trim()) {
      setResponse({ message: 'Please enter some text for safety protocol check.' });
      setToxicityScore(null);
      return;
    }

    try {
      // Call the backend API to check safety protocol
      const payload = { text: text }; // Prepare JSON payload with text input
      const result = await axios.post(`${config.REACT_APP_SAFETY_PROTOCOL_API}`, payload, {
        headers: {
          'Content-Type': 'application/json', // Specify content type as JSON
        },
      });
      console.log('Response from backend:', result.data);

      // Extract the result and toxicity score from the backend response
      const resultText = result.data.body?.result || '';
      let score = 0.0;

      if (resultText.startsWith('[REDACTED]')) {
        const scoreMatch = resultText.match(/toxic:([\d.]+)/);
        score = scoreMatch ? parseFloat(scoreMatch[1]) : 0.0;
        setResponse({ message: 'The content has been redacted for safety reasons.' });
      } else {
        setResponse({ message: resultText });
      }

      setToxicityScore(score);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ message: 'Error occurred while checking the safety protocol.' });
      setToxicityScore(null);
    }
  };

  return (
    <div className="safety-protocol-container">
      <h1 className="title">Unsafe Content Redaction</h1>

      {/* Textarea for input */}
      <textarea
        className="input-textarea"
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text for safety protocol check"
        rows="5"
        cols="60"
      />

      {/* Submit button */}
      <div className="button-container">
        <button className="submit-button" onClick={handleSubmit}>Check Safety</button>
      </div>

      {/* Display result */}
      {response && (
        <div className="result-container">
          <h3 className="result-title">Result:</h3>
          <p className="result-text">{response.message}</p>
          {toxicityScore !== null && (
            <p className="toxicity-score">
              <strong>Toxicity Score:</strong> {toxicityScore.toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SafetyProtocol;
