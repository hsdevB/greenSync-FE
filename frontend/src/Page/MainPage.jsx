import React from "react";

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
      <button style={{
        padding: "16px 40px",
        fontSize: 20,
        background: "#388e3c",
        color: "white",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(56,142,60,0.15)"
      }}>
        대시보드 바로가기
      </button>
    </div>
  );
};

export default MainPage; 