import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// axios 기본 설정
// axios.defaults.baseURL = 'http://localhost:3000';
const BACKEND_IP_ADDRESS = '192.168.0.33';
axios.defaults.baseURL = `http://${BACKEND_IP_ADDRESS}:3000`;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
