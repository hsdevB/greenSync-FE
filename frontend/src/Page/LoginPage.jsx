import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: 로그인 처리 로직
    alert("로그인 기능은 아직 구현되지 않았습니다.");
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
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 16,
            border: "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16
          }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 24,
            border: "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16
          }}
        />
        <button type="submit" style={{
          width: "100%",
          padding: "14px 0",
          fontSize: 18,
          background: "#388e3c",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          로그인
        </button>
      </form>
      <div style={{ fontSize: 15, color: "#666" }}>
        계정이 없으신가요? <a href="/signup" style={{ color: "#388e3c", textDecoration: "underline" }}>회원가입</a>
      </div>
    </div>
  );
};

export default LoginPage; 