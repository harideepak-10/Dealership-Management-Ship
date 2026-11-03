import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { DemoStoreProvider } from './store/DemoStore';
import './styles/base.css';
import './styles/site.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DemoStoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DemoStoreProvider>
  </React.StrictMode>,
);
