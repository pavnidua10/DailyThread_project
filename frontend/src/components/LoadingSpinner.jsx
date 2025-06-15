import React from 'react';

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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
