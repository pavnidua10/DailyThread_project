import React from 'react';

const spinnerStyle = {
  position: 'fixed',       // cover full screen
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.6)', // optional light overlay
  zIndex: 9999,
};

const circleStyle = {
  width: '48px',
  height: '48px',
  border: '5px solid #e0e0e0',
  borderTop: '5px solid #6c63ff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const keyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;


const LoadingSpinner = () => (
  <>
   
    <style>{keyframes}</style>
    <div style={spinnerStyle}>
      <div style={circleStyle}></div>
    </div>
  </>
);

export default LoadingSpinner;
