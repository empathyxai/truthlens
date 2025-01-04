import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

// Import components (replace with your actual components)
import AiGenerated from './components/AiGenerated';
import FactChecker from './components/FactChecker';

function App() {
  // State for token-based authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  // Mock login function
  const handleLogin = () => {
    const mockToken = 'sample-token-123';
    setToken(mockToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', mockToken);
  };

  // Mock logout function
  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to TruthLens</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/ai-generated">AI Generated Content</Link> | <Link to="/fact-checker">Fact Checker</Link>
          </nav>
        </header>

        {/* Authentication Buttons */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={handleLogin}>Login</button>
          )}
        </div>

        {/* Video Embedding */}
        <div className="video-container">
          <h2>Featured Video</h2>
          <video controls width="600">
            <source src="sample.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <Routes>
          <Route path="/" element={<div>Welcome to TruthLens! Explore our tools and features.</div>} />
          <Route path="/ai-generated" element={<AiGenerated />} />
          <Route path="/fact-checker" element={<FactChecker />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
