import React, { useState } from "react";
import { validateUserId, validatePassword } from '../utils/validation';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_LOGIN_API = import.meta.env.VITE_LOGIN_API;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API request failed:', error);
    if (error.response) {
      // 서버 응답이 있는 경우
      throw new Error(error.response.data.message || `HTTP error! status: ${error.response.status}`);
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      throw new Error('서버에 연결할 수 없습니다.');
    } else {
      // 요청 설정 중 오류가 발생한 경우
      throw new Error('요청 처리 중 오류가 발생했습니다.');
    }
  }
);

// 로그인 컴포넌트
const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 프론트엔드 기본 유효성 검사
    const userIdError = validateUserId(formData.userId);
    const passwordError = validatePassword(formData.password);
    if (userIdError || passwordError) {
      setError(userIdError || passwordError);
      return;
    }

    setIsLoading(true);
    try {
      // App.jsx에 로그인 처리를 위임합니다.
      await onLogin(formData.userId, formData.password);
      // 성공 시 App.jsx에서 페이지 이동을 처리하므로 여기서는 별도 처리가 필요 없습니다.
    } catch (err) {
      // App.jsx의 handleLogin에서 발생한 에러를 여기서 표시합니다.
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0f7fa 0%, #a5d6a7 100%)"
    }}>
      <div style={{
        fontSize: 36,
        fontWeight: "bold",
        color: "#388e3c",
        marginBottom: 8
      }}>
        GreenSync
      </div>
      <div style={{
        fontSize: 18,
        color: "#555",
        marginBottom: 32
      }}>
        로그인
      </div>
      
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 320,
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
        marginBottom: 16
      }}>
        <input
          type="text"
          name="userId"
          placeholder="아이디"
          value={formData.userId}
          onChange={handleInputChange}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 4,
            border: error.userId ? "2px solid #f44336" : "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16,
            opacity: isLoading ? 0.6 : 1
          }}
        />
        {error.userId && (
          <div style={{ color: '#f44336', fontSize: 12, marginBottom: 12, alignSelf: 'flex-start' }}>
            {error.userId}
          </div>
        )}
        
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleInputChange}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 4,
            border: error.password ? "2px solid #f44336" : "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16,
            opacity: isLoading ? 0.6 : 1
          }}
        />
        {error.password && (
          <div style={{ color: '#f44336', fontSize: 12, marginBottom: 12, alignSelf: 'flex-start' }}>
            {error.password}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 18,
            background: isLoading ? "#cccccc" : "#388e3c",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            marginTop: 12
          }}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      
      <div style={{ fontSize: 15, color: "#666" }}>
        계정이 없으신가요? 
        <Link
          to="/signup"
          style={{ color: "#388e3c", textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default LoginPage; 