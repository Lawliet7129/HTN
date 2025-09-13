import React from 'react';

interface EducatorViewProps {
  onLogout: () => void;
}

export const EducatorView: React.FC<EducatorViewProps> = ({ onLogout }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '1rem',
          fontSize: '2rem'
        }}>
          Educator Dashboard
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Welcome to the educator interface! This is a placeholder page for the educator frontend that will be implemented later.
        </p>
        <button 
          onClick={onLogout}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6fd8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
