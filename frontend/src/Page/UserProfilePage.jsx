import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Shield, Edit, Save, X, Eye, EyeOff } from "lucide-react";

const UserProfilePage = () => {
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    userId: "user123",
    name: "홍길동",
    email: "hong@greensync.com",
    phone: "010-1234-5678",
    role: "employee",
    farmCode: "FARM001",
    farmName: "그린하우스 농장",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20 14:30"
  });

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  
  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // 비밀번호 표시 상태
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // 편집용 임시 데이터
  const [editData, setEditData] = useState({ ...userInfo });

  // 사용자 정보 로드 (실제로는 API 호출)
  useEffect(() => {
    // TODO: API에서 사용자 정보 로드
    console.log("사용자 정보 로드");
  }, []);

  // 편집 시작
  const handleEditStart = () => {
    setEditData({ ...userInfo });
    setIsEditing(true);
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditData({ ...userInfo });
    setIsEditing(false);
  };

  // 편집 저장
  const handleEditSave = () => {
    // TODO: API 호출하여 사용자 정보 업데이트
    setUserInfo({ ...editData });
    setIsEditing(false);
    alert("사용자 정보가 업데이트되었습니다.");
  };

  // 비밀번호 변경
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    // TODO: API 호출하여 비밀번호 변경
    alert("비밀번호가 변경되었습니다.");
    setIsPasswordEditing(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  // 비밀번호 표시 토글
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0f7fa 0%, #a5d6a7 100%)",
      padding: "20px"
    }}>
      {/* 헤더 */}
      <div style={{
        fontSize: 36,
        fontWeight: "bold",
        color: "#388e3c",
        marginBottom: 8,
        position: "relative"
      }}>
        GreenSync
        {/* (중앙 상단 버튼 삭제, 아무것도 렌더링하지 않음) */}
      </div>
      <div style={{
        fontSize: 18,
        color: "#555",
        marginBottom: 32
      }}>
        사용자 정보
      </div>

      {/* 메인 컨테이너 */}
      <div style={{
        width: "100%",
        maxWidth: 800,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(56,142,60,0.10)",
        overflow: "hidden",
        position: "relative" // 버튼 absolute 배치 위해 추가
      }}>
        {/* 메인으로 돌아가기 버튼 - 카드 기준 오른쪽 상단 */}
        <a
          href="/dashboard"
          style={{
            position: "absolute",
            right: 24,
            top: 24,
            color: "#388e3c",
            textDecoration: "none",
            fontSize: "16px",
            padding: "12px 24px",
            border: "2px solid #388e3c",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            background: "white",
            zIndex: 2
          }}
          onMouseEnter={e => {
            e.target.style.background = "#388e3c";
            e.target.style.color = "white";
          }}
          onMouseLeave={e => {
            e.target.style.background = "white";
            e.target.style.color = "#388e3c";
          }}
        >
          메인으로 돌아가기
        </a>
        {/* 프로필 헤더 */}
        <div style={{
          background: "linear-gradient(135deg, #388e3c 0%, #4caf50 100%)",
          color: "white",
          padding: "32px",
          textAlign: "center"
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "32px"
          }}>
            <User size={40} />
          </div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
            {userInfo.name}
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {userInfo.role === "admin" ? "관리자" : "직원"} • {userInfo.farmName}
          </p>
        </div>

        {/* 사용자 정보 섹션 */}
        <div style={{ padding: "32px" }}>
          {/* 편집 버튼 */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "24px"
          }}>
            {!isEditing ? (
              <button
                onClick={handleEditStart}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "#388e3c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                <Edit size={16} />
                정보 수정
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: "#388e3c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  <Save size={16} />
                  저장
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  <X size={16} />
                  취소
                </button>
              </div>
            )}
          </div>

          {/* 사용자 정보 그리드 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}>
            {/* 기본 정보 */}
            <div>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                color: "#333",
                borderBottom: "2px solid #e0e0e0",
                paddingBottom: "8px"
              }}>
                기본 정보
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      사용자 ID
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.userId : userInfo.userId}
                      onChange={(e) => setEditData({...editData, userId: e.target.value})}
                      disabled={true}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: "#f5f5f5"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      이름
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.name : userInfo.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: isEditing ? "white" : "#f5f5f5"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Mail size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      이메일
                    </label>
                    <input
                      type="email"
                      value={isEditing ? editData.email : userInfo.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: isEditing ? "white" : "#f5f5f5"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Phone size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? editData.phone : userInfo.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: isEditing ? "white" : "#f5f5f5"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 농장 정보 */}
            <div>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                color: "#333",
                borderBottom: "2px solid #e0e0e0",
                paddingBottom: "8px"
              }}>
                농장 정보
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      농장 코드
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.farmCode : userInfo.farmCode}
                      onChange={(e) => setEditData({...editData, farmCode: e.target.value})}
                      disabled={true}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: "#f5f5f5"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      농장명
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.farmName : userInfo.farmName}
                      onChange={(e) => setEditData({...editData, farmName: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: "70%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        background: isEditing ? "white" : "#f5f5f5"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Shield size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      권한
                    </label>
                    <div style={{
                      width: "70%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      background: "#f5f5f5",
                      color: "#666"
                    }}>
                      {userInfo.role === "admin" ? "관리자" : "직원"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      가입일
                    </label>
                    <div style={{
                      width: "70%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      background: "#f5f5f5",
                      color: "#666"
                    }}>
                      {userInfo.joinDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <User size={20} color="#666" />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                      마지막 로그인
                    </label>
                    <div style={{
                      width: "70%",
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      background: "#f5f5f5",
                      color: "#666"
                    }}>
                      {userInfo.lastLogin}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 비밀번호 변경 섹션 */}
          <div style={{
            borderTop: "1px solid #e0e0e0",
            paddingTop: "24px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <h3 style={{
                margin: 0,
                fontSize: "18px",
                color: "#333"
              }}>
                {/* 비밀번호 변경 */}
              </h3>
              {!isPasswordEditing ? (
                <button
                  onClick={() => setIsPasswordEditing(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  <Shield size={16} />
                  비밀번호 변경
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handlePasswordChange}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: "#388e3c",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    <Save size={16} />
                    변경
                  </button>
                  <button
                    onClick={() => {
                      setIsPasswordEditing(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    <X size={16} />
                    취소
                  </button>
                </div>
              )}
            </div>

            {isPasswordEditing && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
                background: "#f9f9f9",
                padding: "16px",
                borderRadius: "8px"
              }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                    현재 비밀번호
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="현재 비밀번호를 입력하세요"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        paddingRight: "40px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666"
                      }}
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                    새 비밀번호
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="새 비밀번호를 입력하세요"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        paddingRight: "40px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666"
                      }}
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px", display: "block" }}>
                    새 비밀번호 확인
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        paddingRight: "40px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666"
                      }}
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;