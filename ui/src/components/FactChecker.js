import React, { useState } from 'react';

const FactChecker = () => {
  const [factText, setFactText] = useState('');
  const [parsedResult, setParsedResult] = useState(null); // Parsed result for display
  const [errorMessage, setErrorMessage] = useState(null); // Error message state

  const handleInputChange = (e) => setFactText(e.target.value);

  const handleSubmit = async () => {
    setErrorMessage(null); // Clear previous error messages
    setParsedResult(null); // Clear previous result

    if (!factText.trim()) {
      alert('Please enter text to check.');
      return;
    }

    try {
      console.log('Making API call...');
      const response = await fetch('API_ENDPOINT_URL', {
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
      console.log('Fact Check Response:', data);

      const { result } = data; // Ensure this matches your backend structure
      console.log('Parsed Result:', result);

      if (typeof result === 'string') {
        const parsedData = JSON.parse(result); // Parse JSON string if necessary
        setParsedResult(parsedData);
      } else {
        setParsedResult(result); // Directly set if result is already an object/array
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Error occurred while checking facts. Please try again.');
    }
  };

  const renderResult = () => {
    if (!parsedResult) return null;

    console.log('Rendering Result:', parsedResult);

    // Handle different data structures
    if (Array.isArray(parsedResult)) {
      return parsedResult.map((item, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <p><strong>Answer:</strong> {item.answer || 'N/A'}</p>
          {item.rationale && <p><strong>Rationale:</strong> {item.rationale}</p>}
          {item.excerpt && <p><strong>Excerpt:</strong> {item.excerpt}</p>}
        </div>
      ));
    } else if (typeof parsedResult === 'object') {
      return Object.entries(parsedResult).map(([key, value]) => (
        <p key={key}><strong>{key}:</strong> {JSON.stringify(value)}</p>
      ));
    } else {
      return <p>{parsedResult}</p>;
    }
  };

  return (
    <div>
      <h2>Fact Checker</h2>
      <textarea
        value={factText}
        onChange={handleInputChange}
        placeholder="Enter text to check for facts"
        rows="4"
        cols="50"
        style={{ marginBottom: '10px' }}
      />
      <br />
      <button onClick={handleSubmit} style={{ marginBottom: '20px' }}>
        Check Facts
      </button>

      {errorMessage && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}

      <div>
        <h3>Fact Check Result</h3>
        {renderResult()}
      </div>
    </div>
  );
};

export default FactChecker;
