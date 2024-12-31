import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API calls
import config from '../config';

const SafetyProtocol = () => {
  const [text, setText] = useState(''); // Text input state
  const [response, setResponse] = useState(null); // Response from backend

  // Handle text input change
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!text.trim()) {
      setResponse({ message: 'Please enter some text for safety protocol check.' });
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
      console.log('Response from backend:');
      console.log(result.data)

      // Set the response state with the result from backend
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ message: 'Error occurred while checking the safety protocol.' });
    }
  };

  return (
    <div className="safety-protocol">
      <h2>Safety Protocol</h2>

      {/* Textarea for input */}
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text for safety protocol check"
        rows="4"
        cols="50"
      />

      {/* Submit button */}
      <div>
        <button onClick={handleSubmit}>Check Safety</button>
      </div>

      {/* Display result */}
      {response && (
        <div className="result">
          <h3>Result:</h3>
          <p>{response.message}</p>
          {response.data && (
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default SafetyProtocol;
