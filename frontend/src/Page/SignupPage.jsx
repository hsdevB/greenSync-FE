import React, { useState } from "react";

const SignupPage = () => {
  const [role, setRole] = useState("employee"); // 'admin' 또는 'employee'
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmCode, setFarmCode] = useState("");

  // 이메일 인증 관련 (실제 구현은 백엔드 필요)
  const handleEmailVerify = (e) => {
    e.preventDefault();
    alert("이메일 인증 기능은 아직 구현되지 않았습니다.");
  };
  const handleCodeVerify = (e) => {
    e.preventDefault();
    alert("인증번호 확인 기능은 아직 구현되지 않았습니다.");
  };
  const handleSignup = (e) => {
    e.preventDefault();
    alert("회원가입 기능은 아직 구현되지 않았습니다.");
  };
  const handleCancel = (e) => {
    e.preventDefault();
    // TODO: 취소 시 동작 (예: 로그인 페이지 이동)
    alert("취소 기능은 아직 구현되지 않았습니다.");
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
        회원가입
      </div>
      <form onSubmit={handleSignup} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 450,
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
        marginBottom: 16
      }}>
        {/* 관리자/직원 토글 */}
        <div style={{ display: "flex", width: "100%", marginBottom: 16, justifyContent: "center", gap: "40px" }}>
          <span
            onClick={() => setRole("admin")}
            style={{
              fontSize: "16px",
              fontWeight: role === "admin" ? "bold" : "normal",
              color: role === "admin" ? "#388e3c" : "#666",
              cursor: "pointer",
              padding: "8px 16px",
              transition: "all 0.2s ease",
              borderBottom: role === "admin" ? "2px solid #388e3c" : "2px solid transparent"
            }}
            onMouseEnter={(e) => {
              if (role !== "admin") {
                e.target.style.color = "#388e3c";
                e.target.style.fontWeight = "500";
              }
            }}
            onMouseLeave={(e) => {
              if (role !== "admin") {
                e.target.style.color = "#666";
                e.target.style.fontWeight = "normal";
              }
            }}
          >
            관리자
          </span>
          <span
            onClick={() => setRole("employee")}
            style={{
              fontSize: "16px",
              fontWeight: role === "employee" ? "bold" : "normal",
              color: role === "employee" ? "#388e3c" : "#666",
              cursor: "pointer",
              padding: "8px 16px",
              transition: "all 0.2s ease",
              borderBottom: role === "employee" ? "2px solid #388e3c" : "2px solid transparent"
            }}
            onMouseEnter={(e) => {
              if (role !== "employee") {
                e.target.style.color = "#388e3c";
                e.target.style.fontWeight = "500";
              }
            }}
            onMouseLeave={(e) => {
              if (role !== "employee") {
                e.target.style.color = "#666";
                e.target.style.fontWeight = "normal";
              }
            }}
          >
            직원
          </span>
        </div>
        {/* 아이디 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>아이디</div>
          <input
            type="text"
            placeholder="아이디를 입력하세요"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 비밀번호 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>비밀번호</div>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 비밀번호 확인 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>비밀번호 확인</div>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={passwordCheck}
            onChange={e => setPasswordCheck(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 이메일 + 이메일 확인 버튼 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>이메일</div>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: "5px 5px 5px 5px",
              fontSize: 16
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
              borderRadius: "5px 5px 5px 5px",
              fontWeight: "bold",
              cursor: "pointer",
              height: 44,
              marginLeft: 8
            }}
          >
            확인
          </button>
        </div>
        {/* 인증번호 + 확인 버튼 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>인증번호</div>
          <input
            type="text"
            placeholder="인증번호를 입력하세요"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: "5px 5px 5px 5px",
              fontSize: 16
            }}
          />
          <button
            type="button"
            onClick={handleCodeVerify}
            style={{
              padding: "0 18px",
              background: "#388e3c",
              color: "white",
              border: "none",
              borderRadius: "5px 5px 5px 5px",
              fontWeight: "bold",
              cursor: "pointer",
              height: 44,
              marginLeft: 8
            }}
          >
            확인
          </button>
        </div>
        {/* 이름 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>이름</div>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 휴대전화 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>휴대전화</div>
          <input
            type="tel"
            placeholder="휴대전화번호를 입력하세요"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 소속농장코드 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>소속농장코드</div>
          <input
            type="text"
            placeholder="소속농장코드를 입력하세요"
            value={farmCode}
            onChange={e => setFarmCode(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16
            }}
          />
        </div>
        {/* 회원가입/취소 버튼 */}
        <div style={{ display: "flex", width: "100%", gap: 8, marginBottom: 0 }}>
          <button type="submit" style={{
            flex: 1,
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
          <button type="button" onClick={handleCancel} style={{
            flex: 1,
            padding: "14px 0",
            fontSize: 18,
            background: "#f1f1f1",
            color: "#444",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            취소
          </button>
        </div>
      </form>
      <div style={{ fontSize: 15, color: "#666" }}>
        이미 계정이 있으신가요? <a href="/login" style={{ color: "#388e3c", textDecoration: "underline" }}>로그인</a>
      </div>
    </div>
  );
};

export default SignupPage; 