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
  
  // 각 필드별 에러 메시지
  const [fieldErrors, setFieldErrors] = useState({
    userId: "",
    password: "",
    passwordCheck: "",
    name: "",
    email: "",
    phone: ""
  });

  // 실시간 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) return "";
    if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (/^(\d)\1+$/.test(password)) return "동일한 숫자로만 구성된 비밀번호는 사용할 수 없습니다.";
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return "영문자와 숫자를 포함해야 합니다.";
    return "";
  };

  // 실시간 비밀번호 확인 검사
  const validatePasswordCheck = (password, passwordCheck) => {
    if (!passwordCheck) return "";
    if (password !== passwordCheck) return "비밀번호가 일치하지 않습니다.";
    return "";
  };

  // 유효성 검사
  const validateForm = () => {
    const newFieldErrors = {
      userId: "",
      password: "",
      passwordCheck: "",
      name: "",
      email: "",
      phone: "",
      farmCode: ""
    };
    
    let isValid = true;
    
    if (!userId || userId.length < 3 || userId.length > 50) {
      newFieldErrors.userId = "아이디는 3자 이상 50자 이하여야 합니다.";
      isValid = false;
    }
    if (!password || password.length < 8) {
      newFieldErrors.password = "비밀번호는 8자 이상이어야 합니다.";
      isValid = false;
    }
    if (password !== passwordCheck) {
      newFieldErrors.passwordCheck = "비밀번호가 일치하지 않습니다. 다시 확인해주세요.";
      isValid = false;
    }
    if (!name || name.length < 2 || name.length > 50) {
      newFieldErrors.name = "이름은 2자 이상 50자 이하여야 합니다.";
      isValid = false;
    }
    
    // 소속농장코드 검증
    if (role === "admin") {
      // 관리자는 새로운 농장코드 생성
      if (!farmCode) {
        newFieldErrors.farmCode = "농장코드를 생성해주세요.";
        isValid = false;
      }
    } else {
      // 직원은 기존 농장코드 입력
      if (!farmCode) {
        newFieldErrors.farmCode = "소속 농장코드를 입력해주세요.";
        isValid = false;
      } else if (farmCode.length < 4) {
        newFieldErrors.farmCode = "올바른 농장코드를 입력해주세요.";
        isValid = false;
      }
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "올바른 이메일 형식을 입력해주세요. (예: example@email.com)";
      isValid = false;
    }
    if (phone && !/^[0-9-+\s()]+$/.test(phone) || phone.length < 10) {
      newFieldErrors.phone = "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)";
      isValid = false;
    }
    
    setFieldErrors(newFieldErrors);
    return isValid;
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
        farmCode: farmCode.trim(),
        userId: userId.trim(),
        password: password,
        name: name.trim(),
        email: email.trim() || null,
        phoneNumber: phone.trim() || null,
        role: role
      });

      if (response.data.success) {
        setSuccess("회원가입이 성공적으로 완료되었습니다! 로그인 페이지로 이동합니다.");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ECONNREFUSED') {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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
                border: fieldErrors.userId ? "1px solid #c62828" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16,
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
          
          {/* 아이디 에러 메시지 */}
          {fieldErrors.userId && (
            <div style={{
              width: "100%",
              padding: "8px 12px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 12,
              textAlign: "left"
            }}>
              {fieldErrors.userId}
            </div>
          )}
         
                                     {/* 비밀번호 */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
            <div style={{ width: 110, fontWeight: "bold" }}>비밀번호</div>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                const passwordError = validatePassword(newPassword);
                setFieldErrors(prev => ({
                  ...prev,
                  password: passwordError
                }));
                // 비밀번호 확인도 다시 검사
                const passwordCheckError = validatePasswordCheck(newPassword, passwordCheck);
                setFieldErrors(prev => ({
                  ...prev,
                  passwordCheck: passwordCheckError
                }));
              }}
              required
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: fieldErrors.password ? "1px solid #c62828" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16,
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
         
         {/* 비밀번호 에러 메시지 */}
         {fieldErrors.password && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "left"
           }}>
             {fieldErrors.password}
           </div>
         )}
         
                   {/* 비밀번호 확인 */}
           <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
             <div style={{ width: 110, fontWeight: "bold" }}>비밀번호 확인</div>
             <input
               type="password"
               placeholder="비밀번호를 다시 입력하세요"
               value={passwordCheck}
               onChange={e => {
                 const newPasswordCheck = e.target.value;
                 setPasswordCheck(newPasswordCheck);
                 const passwordCheckError = validatePasswordCheck(password, newPasswordCheck);
                 setFieldErrors(prev => ({
                   ...prev,
                   passwordCheck: passwordCheckError
                 }));
               }}
               required
               disabled={loading}
               style={{
                 flex: 1,
                 padding: "12px 16px",
                 border: fieldErrors.passwordCheck ? "1px solid #c62828" : "1px solid #bdbdbd",
                 borderRadius: 6,
                 fontSize: 16,
                 opacity: loading ? 0.6 : 1
               }}
             />
           </div>
          
          {/* 비밀번호 확인 에러 메시지 */}
          {fieldErrors.passwordCheck && (
            <div style={{
              width: "100%",
              padding: "8px 12px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 12,
              textAlign: "left"
            }}>
              {fieldErrors.passwordCheck}
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
               border: fieldErrors.email ? "1px solid #c62828" : "1px solid #bdbdbd",
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
         
         {/* 이메일 에러 메시지 */}
         {fieldErrors.email && (
           <div style={{
             width: "100%",
             padding: "8px 12px",
             background: "#ffebee",
             color: "#c62828",
             borderRadius: 4,
             marginBottom: 16,
             fontSize: 12,
             textAlign: "left"
           }}>
             {fieldErrors.email}
           </div>
         )}
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
                border: fieldErrors.name ? "1px solid #c62828" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16,
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
          
          {/* 이름 에러 메시지 */}
          {fieldErrors.name && (
            <div style={{
              width: "100%",
              padding: "8px 12px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 12,
              textAlign: "left"
            }}>
              {fieldErrors.name}
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
                border: fieldErrors.phone ? "1px solid #c62828" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16,
                opacity: loading ? 0.6 : 1
              }}
            />
          </div>
          
          {/* 휴대전화 에러 메시지 */}
          {fieldErrors.phone && (
            <div style={{
              width: "100%",
              padding: "8px 12px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 12,
              textAlign: "left"
            }}>
              {fieldErrors.phone}
            </div>
          )}
        {/* 소속농장코드 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, width: "100%" }}>
          <div style={{ width: 110, fontWeight: "bold" }}>소속농장코드</div>
          <input
            type="text"
            placeholder={role === "admin" ? "생성 버튼을 눌러주세요" : "소속 농장코드를 입력하세요"}
            value={farmCode}
            onChange={e => setFarmCode(e.target.value)}
            required={true}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: fieldErrors.farmCode ? "1px solid #c62828" : "1px solid #bdbdbd",
              borderRadius: role === "admin" ? "6px 0 0 6px" : "6px",
              fontSize: 16,
              opacity: loading ? 0.6 : 1,
              backgroundColor: loading ? "#f5f5f5" : "white"
            }}
          />
          {role === "admin" && (
            <button
              type="button"
              onClick={() => setFarmCode(FarmCode.createFarmCode())}
              disabled={loading}
              style={{
                padding: "12px 16px",
                background: loading ? "#ccc" : "#388e3c",
                color: "white",
                border: "none",
                borderRadius: "0 6px 6px 0",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: loading ? 0.6 : 1
              }}
            >
              생성
            </button>
          )}
        </div>
        
        {/* 소속농장코드 에러 메시지 */}
        {fieldErrors.farmCode && (
          <div style={{
            width: "100%",
            padding: "8px 12px",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: 4,
            marginBottom: 16,
            fontSize: 12,
            textAlign: "left"
          }}>
            {fieldErrors.farmCode}
          </div>
        )}
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
        {error && (
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