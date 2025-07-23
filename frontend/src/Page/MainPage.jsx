import React from "react";
import { Link } from "react-router-dom";

// TODO: 필요시 로고 이미지를 src/assets 등에서 import
// import logo from '../assets/logo.png';

const MainPage = () => {
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
      {/* <img src={logo} alt="GreenSync Logo" style={{ width: 120, marginBottom: 32 }} /> */}
      <div style={{
        fontSize: 48,
        fontWeight: "bold",
        color: "#388e3c",
        marginBottom: 16
      }}>
        GreenSync
      </div>
      <div style={{
        fontSize: 20,
        color: "#555",
        marginBottom: 40
      }}>
        스마트팜 통합 모니터링 & 제어 시스템
      </div>
      
      {/* 버튼 컨테이너 */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        {/* 로그인 버튼 */}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: "16px 40px",
            fontSize: 18,
            background: "transparent",
            color: "#388e3c",
            border: "2px solid #388e3c",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "600"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#388e3c";
            e.target.style.color = "white";
            e.target.style.boxShadow = "0 4px 12px rgba(56,142,60,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#388e3c";
            e.target.style.boxShadow = "none";
          }}>
            로그인
          </button>
        </Link>

        {/* 회원가입 버튼 */}
        <Link to="/signup" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: "16px 40px",
            fontSize: 18,
            background: "#388e3c",
            color: "white",
            border: "2px solid #388e3c",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(56,142,60,0.15)",
            transition: "all 0.3s ease",
            fontWeight: "600"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#2e7d32";
            e.target.style.borderColor = "#2e7d32";
            e.target.style.boxShadow = "0 4px 12px rgba(56,142,60,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#388e3c";
            e.target.style.borderColor = "#388e3c";
            e.target.style.boxShadow = "0 2px 8px rgba(56,142,60,0.15)";
          }}>
            회원가입
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MainPage; 