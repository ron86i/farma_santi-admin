import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AllProviders } from './components/all-providers.tsx';
// import React from 'react';
createRoot(document.getElementById('root')!).render(
    <AllProviders>
        {/* <React.StrictMode> */}
            <App />
        {/* </React.StrictMode> */}
    </AllProviders>
);
