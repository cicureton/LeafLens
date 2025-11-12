import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Auto-login for demo
    navigate('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #043927, #00A86B)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <h1>🌿 LeafLens Admin</h1>
        <p style={{ margin: '20px 0' }}>Click below to access the admin panel</p>
        <button 
          onClick={handleLogin}
          style={{
            background: '#004d00',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Enter Admin Panel
        </button>
      </div>
    </div>
  );
};

export default Login;