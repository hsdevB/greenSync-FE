import React, { useState } from "react";
import { validateUserId, validatePassword, validateEmail, validateName, validatePhoneNumber } from '../utils/validation';
import axios from 'axios';

const API_BASE_URL = import.meta.VITE_API_BASE_URL;
const API_SIGNUP = import.meta.VITE_SIGNUP_API;
const SEND_EMAIL_ENDPOINT = import.meta.VITE_SIGNUP_SEND_EMAIL_ENDPOINT;
const VERIFY_EMAIL_ENDPOINT = import.meta.VITE_SIGNUP_VERIFY_EMAIL_ENDPOINT;
const FARM_CODE_API = import.meta.VITE_FARM_CODE_API;
const FARM_CODE_ENDPOINT = import.meta.VITE_FARM_CODE_ENDPOINT;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

const SignupPage = ({ onNavigate }) => {
  const [role, setRole] = useState("employee"); // 'admin' 또는 'employee'
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordCheck: '',
    email: '',
    verificationCode: '',
    name: '',
    phoneNumber: '',
    farmCode: '',
    farmName: '',
    cultivationMethod: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  // const [codeVerified, setCodeVerified] = useState(false);

  const cultivationOptions = [
    { value: 'SG', label: '고형배지+유리온실' },
    { value: 'SP', label: '고형배지+플라스틱온실' },
    { value: 'WG', label: '수경재배+유리온실' },
    { value: 'WP', label: '수경재배+플라스틱온실' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 유효성 검사
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateFarmCode = async () => {
    try {
      const response = await api.get(`${FARM_CODE_API}/${FARM_CODE_ENDPOINT}`);
      
      if (response.farmCode) {
        setFormData(prev => ({
          ...prev,
          farmCode: response.farmCode
        }));
        alert('농장코드가 자동 생성되었습니다.');
      }
    } catch (error) {
      alert('농장코드 생성에 실패했습니다.');
      console.error('Farm code generation failed:', error);
    }
  };

  const handleEmailVerify = async () => {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`${API_SIGNUP}/${SEND_EMAIL_ENDPOINT}`, {
        email: formData.email
      });
      
      setEmailSent(true);
      alert('인증번호가 이메일로 발송되었습니다.');
    } catch (error) {
      alert('이메일 발송에 실패했습니다.');
      console.error('Email verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerify = async () => {
    if (!formData.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '인증번호를 입력해주세요.' }));
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`${API_SIGNUP}/${VERIFY_EMAIL_ENDPOINT}`, {
        email: formData.email,
        code: formData.verificationCode
      });
      
      // setCodeVerified(true);
      setEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } catch (error) {
      alert('인증번호가 올바르지 않습니다.');
      console.error('Code verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.userId = validateUserId(formData.userId);
    newErrors.password = validatePassword(formData.password);
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    
    if (formData.password !== formData.passwordCheck) {
      newErrors.passwordCheck = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!emailVerified) {
      newErrors.email = '이메일 인증을 완료해주세요.';
    }
    
    if (!formData.farmCode) {
      newErrors.farmCode = '농장코드를 입력해주세요.';
    }
    
    if (role === 'admin') {
      if (!formData.farmName) {
        newErrors.farmName = '농장명을 입력해주세요.';
      }
      if (!formData.cultivationMethod) {
        newErrors.cultivationMethod = '재배방식을 선택해주세요.';
      }
    }
    
    // 빈 문자열인 에러 제거
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const signupData = {
        farmCode: formData.farmCode,
        userId: formData.userId,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      // 관리자인 경우 추가 정보 포함
      if (role === 'admin') {
        signupData.farmName = formData.farmName;
        signupData.cultivationMethod = formData.cultivationMethod;
      }

      await api.post(`${API_SIGNUP}`, signupData);
      
      alert('회원가입이 완료되었습니다.');
      onNavigate('login');
    } catch (error) {
      alert('회원가입에 실패했습니다.');
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('login');
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0f7fa 0%, #a5d6a7 100%)",
      padding: "20px 0"
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
        width: 500,
        maxWidth: "90vw",
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
        marginBottom: 16
      }}>
        {/* 관리자/직원 토글 */}
        <div style={{ display: "flex", width: "100%", marginBottom: 24, justifyContent: "center", gap: "40px" }}>
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
          >
            직원
          </span>
        </div>

        {/* 아이디 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>아이디</div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="userId"
              placeholder="아이디를 입력하세요 (3-50글자)"
              value={formData.userId}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: errors.userId ? "2px solid #f44336" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
            {errors.userId && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.userId}
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>비밀번호</div>
          <div style={{ flex: 1 }}>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요 (8글자 이상)"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: errors.password ? "2px solid #f44336" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
            {errors.password && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.password}
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>비밀번호 확인</div>
          <div style={{ flex: 1 }}>
            <input
              type="password"
              name="passwordCheck"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordCheck}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: errors.passwordCheck ? "2px solid #f44336" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
            {errors.passwordCheck && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.passwordCheck}
              </div>
            )}
          </div>
        </div>

        {/* 이메일 + 인증 버튼 */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14, paddingTop: 12 }}>이메일</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleInputChange}
                disabled={emailVerified}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: errors.email ? "2px solid #f44336" : emailVerified ? "2px solid #4caf50" : "1px solid #bdbdbd",
                  borderRadius: 6,
                  fontSize: 16,
                  backgroundColor: emailVerified ? "#f0f8f0" : "white"
                }}
              />
              <button
                type="button"
                onClick={handleEmailVerify}
                disabled={isLoading || emailVerified}
                style={{
                  padding: "12px 18px",
                  background: emailVerified ? "#4caf50" : "#388e3c",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: emailVerified ? "not-allowed" : "pointer",
                  fontSize: 14
                }}
              >
                {emailVerified ? "인증완료" : "인증발송"}
              </button>
            </div>
            {errors.email && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {/* 인증번호 + 확인 버튼 */}
        {emailSent && !emailVerified && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16, width: "100%" }}>
            <div style={{ width: 120, fontWeight: "bold", fontSize: 14, paddingTop: 12 }}>인증번호</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  name="verificationCode"
                  placeholder="인증번호를 입력하세요"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: errors.verificationCode ? "2px solid #f44336" : "1px solid #bdbdbd",
                    borderRadius: 6,
                    fontSize: 16
                  }}
                />
                <button
                  type="button"
                  onClick={handleCodeVerify}
                  disabled={isLoading}
                  style={{
                    padding: "12px 18px",
                    background: "#388e3c",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  확인
                </button>
              </div>
              {errors.verificationCode && (
                <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                  {errors.verificationCode}
                </div>
              )}
            </div>
          </div>
        )}
        {/* 이름 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>이름</div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요 (2-50글자)"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: errors.name ? "2px solid #f44336" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
            {errors.name && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.name}
              </div>
            )}
          </div>
        </div>

        {/* 휴대전화 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>휴대전화</div>
          <div style={{ flex: 1 }}>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="휴대전화번호를 입력하세요 (010-1234-5678)"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: errors.phoneNumber ? "2px solid #f44336" : "1px solid #bdbdbd",
                borderRadius: 6,
                fontSize: 16
              }}
            />
            {errors.phoneNumber && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.phoneNumber}
              </div>
            )}
          </div>
        </div>

        {/* 농장명 (관리자만) */}
        {role === 'admin' && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
            <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>농장명</div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="farmName"
                placeholder="농장명을 입력하세요"
                value={formData.farmName}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: errors.farmName ? "2px solid #f44336" : "1px solid #bdbdbd",
                  borderRadius: 6,
                  fontSize: 16
                }}
              />
              {errors.farmName && (
                <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                  {errors.farmName}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 재배방식 (관리자만) */}
        {role === 'admin' && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16, width: "100%" }}>
            <div style={{ width: 120, fontWeight: "bold", fontSize: 14 }}>재배방식</div>
            <div style={{ flex: 1 }}>
              <select
                name="cultivationMethod"
                value={formData.cultivationMethod}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: errors.cultivationMethod ? "2px solid #f44336" : "1px solid #bdbdbd",
                  borderRadius: 6,
                  fontSize: 16,
                  backgroundColor: "white"
                }}
              >
                <option value="">재배방식을 선택하세요</option>
                {cultivationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.cultivationMethod && (
                <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                  {errors.cultivationMethod}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 농장코드 */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24, width: "100%" }}>
          <div style={{ width: 120, fontWeight: "bold", fontSize: 14, paddingTop: 12 }}>농장코드</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                name="farmCode"
                placeholder={role === 'admin' ? '코드 자동 생성' : '농장코드를 입력하세요'}
                value={formData.farmCode}
                onChange={handleInputChange}
                readOnly={role === 'admin'}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: errors.farmCode ? "2px solid #f44336" : "1px solid #bdbdbd",
                  borderRadius: 6,
                  fontSize: 16,
                  backgroundColor: role === 'admin' ? "#f5f5f5" : "white"
                }}
              />
                            {role === 'admin' && (
                <button
                  type="button"
                  onClick={generateFarmCode}
                  disabled={isLoading}
                  style={{
                    padding: "12px 18px",
                    background: "#388e3c",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  생성
                </button>
              )}
            </div>
            {errors.farmCode && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.farmCode}
              </div>
            )}
            {role === 'admin' && formData.farmCode && (
              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                생성된 농장코드를 복사하여 직원들에게 공유하세요.
              </div>
            )}
          </div>
        </div>

        {/* 회원가입/취소 버튼 */}
        <div style={{ display: "flex", width: "100%", gap: 12 }}>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 18,
              background: isLoading ? "#cccccc" : "#388e3c",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {isLoading ? "처리 중..." : "회원가입"}
          </button>
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "14px 0",
              fontSize: 18,
              background: "#f1f1f1",
              color: "#444",
              border: "none",
              borderRadius: 8,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            취소
          </button>
        </div>
      </form>
      
      <div style={{ fontSize: 15, color: "#666" }}>
        이미 계정이 있으신가요? 
        <span 
          onClick={() => onNavigate('login')} 
          style={{ color: "#388e3c", textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}
        >
          로그인
        </span>
      </div>
    </div>
  );
};

export default SignupPage; 