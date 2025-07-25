import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Shield, Edit, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../store/useUserStore.jsx";

const UserProfilePage = () => {
  const { userInfo, updateUserInfo, updateProfileImage } = useUserStore();

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
  
  // 프로필 이미지 관련 상태
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const fileInputRef = useRef(null);

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
    updateUserInfo(editData);
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

  // 프로필 이미지 업로드 처리
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setProfileImage(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setIsImageEditing(true);
    }
  };

  // 이미지 업로드 버튼 클릭
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 저장
  const handleImageSave = () => {
    if (profileImage) {
      // TODO: API 호출하여 이미지 업로드
      updateProfileImage(imagePreview);
      setIsImageEditing(false);
      alert("프로필 이미지가 업데이트되었습니다.");
    }
  };

  // 이미지 취소
  const handleImageCancel = () => {
    setProfileImage(null);
    setImagePreview(null);
    setIsImageEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          background: "linear-gradient(135deg, #777777 0%, #888888 100%)",
          color: "white",
          padding: "32px",
          display: "flex",
          alignItems: "center",
          gap: "24px"
        }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* 프로필 이미지 컨테이너 */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              flexShrink: 0,
              overflow: "hidden"
            }}>
              {/* 프로필 이미지 또는 기본 아이콘 */}
              {userInfo.profileImage || imagePreview ? (
                <img
                  src={imagePreview || userInfo.profileImage}
                  alt="프로필"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            
            {/* 이미지 업로드 버튼 - 4시 방향 바깥쪽 */}
            <button
              onClick={handleImageUploadClick}
              style={{
                position: "absolute",
                bottom: -8,
                right: -8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#666666",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                fontSize: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                zIndex: 10
              }}
              title="프로필 이미지 변경"
            >
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSI4Ii8+CiAgPHBhdGggZD0iTTIxIDIxLTE2LjU5LTE2LjU5Ii8+CiAgPHBhdGggZD0iTTExIDhhMyAzIDAgMSAwIDAgNiAzIDMgMCAxIDAgMC02eiIvPgo8L3N2Zz4K" 
                alt="돋보기"
                style={{
                  width: "14px",
                  height: "14px",
                  filter: "invert(1)"
                }}
              />
            </button>
          </div>
          
          {/* 이미지 편집 버튼들 */}
          {isImageEditing && (
            <div style={{
              display: "flex",
              gap: "6px",
              marginLeft: "12px"
            }}>
              <button
                onClick={handleImageSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "3px 6px",
                  background: "#777777",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "11px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/>
                  <polyline points="7,3 7,8 15,8"/>
                </svg>
                저장
              </button>
              <button
                onClick={handleImageCancel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "3px 6px",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "11px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                취소
              </button>
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
              {userInfo.name}
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              {userInfo.role === "admin" ? "관리자" : "직원"} • {userInfo.farmName}
            </p>
          </div>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
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
      
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default UserProfilePage;