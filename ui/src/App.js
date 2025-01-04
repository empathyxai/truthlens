import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import config from './config';
// console.log(process.env.REACT_APP_FACT_CHECKER_API);

// Import components
import AiGenerated from './components/AiGenerated';
import FactChecker from './components/FactChecker';
import SafetyProtocol from './components/SafetyProtocol';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Sidebar for navigation */}
        <div className="sidebar">
          <h2>Choose an Option</h2>
          <ul>
            <li><Link to="/ai-generated">AI Generated</Link></li>
            <li><Link to="/fact-checker">Fact Checker</Link></li>
            <li><Link to="/safety-protocol">Safety Protocol</Link></li>
          </ul>
        </div>

        {/* Content area that displays based on selected route */}
        <div className="content">
          <Routes>
            <Route path="/ai-generated" element={<AiGenerated />} />
            <Route path="/fact-checker" element={<FactChecker />} />
            <Route path="/safety-protocol" element={<SafetyProtocol />} />
            {/* Default route when no option is selected */}
            <Route path="/" element={<h3>Please select an option from the left menu.</h3>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

