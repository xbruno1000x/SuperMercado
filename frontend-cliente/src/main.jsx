import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CarrinhoProvider } from './contexts/CarrinhoContext';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <App />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
