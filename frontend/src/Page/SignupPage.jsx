import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FarmCode from "../utils/FarmCode";

const SignupPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("employee"); // 'admin' 또는 'employee'
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmCode, setFarmCode] = useState("");
  
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 유효성 검사
  const validateForm = () => {
    if (!userId || userId.length < 3 || userId.length > 50) {
      setError("아이디는 3자 이상 50자 이하여야 합니다.");
      return false;
    }
    if (!password || password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return false;
    }
    if (password !== passwordCheck) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (!name || name.length < 2 || name.length > 50) {
      setError("이름은 2자 이상 50자 이하여야 합니다.");
      return false;
    }
    // 소속농장코드는 관리자와 직원 모두 자동 생성되므로 검증 불필요
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("유효한 이메일 형식이 아닙니다.");
      return false;
    }
    if (phone && !/^[0-9-+\s()]+$/.test(phone) || phone.length < 10) {
      setError("유효한 전화번호 형식이 아닙니다.");
      return false;
    }
    return true;
  };

  // 이메일 인증 관련 (실제 구현은 백엔드 필요)
  const handleEmailVerify = (e) => {
    e.preventDefault();
    if (!email) {
      setError("이메일을 먼저 입력해주세요.");
      return;
    }
    alert("이메일 인증 기능은 아직 구현되지 않았습니다.");
  };

  const handleCodeVerify = (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("인증번호를 입력해주세요.");
      return;
    }
    alert("인증번호 확인 기능은 아직 구현되지 않았습니다.");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/signup', {
        farmCode: FarmCode.createFarmCode(),
        userId: userId.trim(),
        password: password,
        name: name.trim(),
        email: email.trim() || null,
        phoneNumber: phone.trim() || null,
      });

      if (response.data.success) {
        setSuccess("회원가입이 성공적으로 완료되었습니다!");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ECONNREFUSED') {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate('/login');
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
      
             {/* 성공 메시지 */}
       {success && (
         <div style={{
           width: 450,
           padding: "12px 16px",
           background: "#e8f5e8",
           color: "#2e7d32",
           borderRadius: 6,
           marginBottom: 16,
           fontSize: 14
         }}>
           {success}
         </div>
       )}

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
             disabled={loading}
             style={{
               flex: 1,
               padding: "12px 16px",
               border: "1px solid #bdbdbd",
               borderRadius: 6,
               fontSize: 16,
               opacity: loading ? 0.6 : 1
             }}
           />
         </div>
         
         {/* 아이디 관련 에러 메시지 */}
         {error && (error.includes("아이디") || error.includes("아이디는")) && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "center"
           }}>
             {error}
           </div>
         )}
         
         {/* 비밀번호 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>비밀번호</div>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16,
              opacity: loading ? 0.6 : 1
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
             disabled={loading}
             style={{
               flex: 1,
               padding: "12px 16px",
               border: "1px solid #bdbdbd",
               borderRadius: 6,
               fontSize: 16,
               opacity: loading ? 0.6 : 1
             }}
           />
         </div>
         
         {/* 비밀번호 관련 에러 메시지 */}
         {error && (error.includes("비밀번호") || error.includes("비밀번호가")) && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "center"
           }}>
             {error}
           </div>
         )}
        {/* 이메일 + 이메일 확인 버튼 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>이메일</div>
          <input
            type="email"
            placeholder="이메일을 입력하세요 (선택)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: "5px 5px 5px 5px",
              fontSize: 16,
              opacity: loading ? 0.6 : 1
            }}
          />
          <button
            type="button"
            onClick={handleEmailVerify}
            disabled={loading}
            style={{
              padding: "0 18px",
              background: loading ? "#ccc" : "#388e3c",
              color: "white",
              border: "none",
              borderRadius: "5px 5px 5px 5px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              height: 44,
              marginLeft: 8,
              opacity: loading ? 0.6 : 1
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
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: "5px 5px 5px 5px",
              fontSize: 16,
              opacity: loading ? 0.6 : 1
            }}
          />
          <button
            type="button"
            onClick={handleCodeVerify}
            disabled={loading}
            style={{
              padding: "0 18px",
              background: loading ? "#ccc" : "#388e3c",
              color: "white",
              border: "none",
              borderRadius: "5px 5px 5px 5px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              height: 44,
              marginLeft: 8,
              opacity: loading ? 0.6 : 1
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
             disabled={loading}
             style={{
               flex: 1,
               padding: "12px 16px",
               border: "1px solid #bdbdbd",
               borderRadius: 6,
               fontSize: 16,
               opacity: loading ? 0.6 : 1
             }}
           />
         </div>
         
         {/* 이름 관련 에러 메시지 */}
         {error && error.includes("이름") && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "center"
           }}>
             {error}
           </div>
         )}
                 {/* 휴대전화 */}
         <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
           <div style={{ width: 110, fontWeight: "bold" }}>휴대전화</div>
           <input
             type="tel"
             placeholder="휴대전화번호를 입력하세요 (선택)"
             value={phone}
             onChange={e => setPhone(e.target.value)}
             disabled={loading}
             style={{
               flex: 1,
               padding: "12px 16px",
               border: "1px solid #bdbdbd",
               borderRadius: 6,
               fontSize: 16,
               opacity: loading ? 0.6 : 1
             }}
           />
         </div>
         
         {/* 이메일/전화번호 관련 에러 메시지 */}
         {error && (error.includes("이메일") || error.includes("전화번호") || error.includes("휴대전화")) && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "center"
           }}>
             {error}
           </div>
         )}
        {/* 소속농장코드 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>소속농장코드</div>
          <input
            type="text"
            placeholder="자동으로 생성됩니다"
            value={FarmCode.createFarmCode()}
            onChange={e => setFarmCode(e.target.value)}
            required={false}
            disabled={loading || true}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #bdbdbd",
              borderRadius: 6,
              fontSize: 16,
              opacity: 0.6,
              backgroundColor: "#f5f5f5"
            }}
          />
        </div>
        {/* 회원가입/취소 버튼 */}
        <div style={{ display: "flex", width: "100%", gap: 8, marginBottom: 0 }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              flex: 1,
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
            {loading ? "처리중..." : "회원가입"}
          </button>
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 18,
              background: "#f1f1f1",
              color: "#444",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              opacity: loading ? 0.6 : 1
            }}
          >
            취소
          </button>
                 </div>
       </form>
       
               {/* 일반적인 에러 메시지 - 폼 아래에 배치 */}
        {error && !error.includes("아이디") && !error.includes("비밀번호") && !error.includes("이름") && !error.includes("이메일") && !error.includes("전화번호") && !error.includes("휴대전화") && (
          <div style={{
            width: 450,
            padding: "12px 16px",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14,
            textAlign: "center"
          }}>
            {error}
          </div>
        )}
       
       <div style={{ fontSize: 15, color: "#666" }}>
         이미 계정이 있으신가요? <a href="/login" style={{ color: "#388e3c", textDecoration: "underline" }}>로그인</a>
       </div>
    </div>
  );
};

export default SignupPage; 