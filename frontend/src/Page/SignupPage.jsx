import React, { useState } from "react";

const SignupPage = () => {
  const [role, setRole] = useState("employee"); // 'admin' 또는 'employee'
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmCode, setFarmCode] = useState("");

  // 이메일 인증 관련 (실제 구현은 백엔드 필요)
  const handleEmailVerify = (e) => {
    e.preventDefault();
    // TODO: 이메일 인증 요청
    alert("이메일 인증 기능은 아직 구현되지 않았습니다.");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // TODO: 회원가입 처리 로직
    alert("회원가입 기능은 아직 구현되지 않았습니다.");
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
        회원가입
      </div>
      <form onSubmit={handleSignup} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 340,
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
        marginBottom: 16
      }}>
        {/* 관리자/직원 토글 */}
        <div style={{ display: "flex", width: "100%", marginBottom: 16, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setRole("admin")}
            style={{
              flex: 1,
              padding: "10px 0",
              background: role === "admin" ? "#388e3c" : "#f1f1f1",
              color: role === "admin" ? "#fff" : "#388e3c",
              border: "none",
              borderRadius: "6px 0 0 6px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            관리자
          </button>
          <button
            type="button"
            onClick={() => setRole("employee")}
            style={{
              flex: 1,
              padding: "10px 0",
              background: role === "employee" ? "#388e3c" : "#f1f1f1",
              color: role === "employee" ? "#fff" : "#388e3c",
              border: "none",
              borderRadius: "0 6px 6px 0",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            직원
          </button>
        </div>
        {/* 아이디 */}
        <input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={e => setUserId(e.target.value)}
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
        {/* 비밀번호 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
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
        {/* 비밀번호 확인 */}
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordCheck}
          onChange={e => setPasswordCheck(e.target.value)}
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
        {/* 이메일 + 이메일 확인 버튼 */}
        <div style={{ display: "flex", width: "100%", marginBottom: 16 }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: "6px 0 0 6px",
              fontSize: 16,
              borderRight: "none"
            }}
          />
          <button
            type="button"
            onClick={handleEmailVerify}
            style={{
              padding: "0 18px",
              background: "#388e3c",
              color: "white",
              border: "none",
              borderRadius: "0 6px 6px 0",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            이메일 확인
          </button>
        </div>
        {/* 인증번호 */}
        <input
          type="text"
          placeholder="인증번호"
          value={verificationCode}
          onChange={e => setVerificationCode(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 16,
            border: "1px solid #bdbdbd",
            borderRadius: 6,
            fontSize: 16
          }}
        />
        {/* 이름 */}
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={e => setName(e.target.value)}
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
        {/* 휴대전화 */}
        <input
          type="tel"
          placeholder="휴대전화"
          value={phone}
          onChange={e => setPhone(e.target.value)}
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
        {/* 소속농장코드 */}
        <input
          type="text"
          placeholder="소속농장코드"
          value={farmCode}
          onChange={e => setFarmCode(e.target.value)}
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
          회원가입
        </button>
      </form>
      <div style={{ fontSize: 15, color: "#666" }}>
        이미 계정이 있으신가요? <a href="#" style={{ color: "#388e3c", textDecoration: "underline" }}>로그인</a>
      </div>
    </div>
  );
};

export default SignupPage; 