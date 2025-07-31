import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!userId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        userId: userId.trim(),
        password: password
      });

      if (response.data.success) {
        // 로그인 성공 시 토큰과 사용자 정보 저장
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.data.user));
        
        // 대시보드로 이동
        navigate('/dashboard');
      } else {
        setError(response.data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ECONNREFUSED') {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
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
      {/* 로고 */}
      {/* <img src={logo} alt="GreenSync Logo" style={{ width: 100, marginBottom: 24 }} /> */}
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
      
      {/* 에러 메시지 */}
      {error && (
        <div style={{
          width: 320,
          padding: "12px 16px",
          background: "#ffebee",
          color: "#c62828",
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{
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
          placeholder="아이디"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          required
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 16,
            border: "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16,
            opacity: loading ? 0.6 : 1
          }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 24,
            border: "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16,
            opacity: loading ? 0.6 : 1
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px 0",
            fontSize: 18,
            background: loading ? "#ccc" : "#388e3c",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <div style={{ fontSize: 15, color: "#666" }}>
        계정이 없으신가요? <a href="/signup" style={{ color: "#388e3c", textDecoration: "underline" }}>회원가입</a>
      </div>
    </div>
  );
};

export default LoginPage; 