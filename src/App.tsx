import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Plants from './pages/Plants';
import Diseases from './pages/Diseases';
import Login from './pages/Login';
import Scans from './pages/Scans';
import ForumPosts from './pages/ForumPosts';
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
          <Route path="/scans" element={<Layout><Scans /></Layout>} />
          <Route path="/forum-posts" element={<Layout><ForumPosts /></Layout>} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;