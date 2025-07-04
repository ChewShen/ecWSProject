import React from 'react';
import ReactDOM from 'react-dom/client';  // React 18 requires this import
import App from './App';

const rootElement = document.getElementById('react-root');  // Ensure this is the right element
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);  // React 18 API
  root.render(<App />);
} else {
  console.error('Target container not found!');
}
