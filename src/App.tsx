import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Plants from './pages/Plants';
import Diseases from './pages/Diseases';
import Login from './pages/Login';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/users" element={<Layout><Users /></Layout>} />
          <Route path="/diseases" element={<Layout><Diseases /></Layout>} />
          <Route path="/plants" element={<Layout><Plants /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;