import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    userId: "user123",
    name: "홍길동",
    email: "hong@greensync.com",
    phone: "010-1234-5678",
    role: "employee",
    farmCode: "FARM001",
    joinDate: "2024-01-15",
    profileImage: null
  });

  const updateUserInfo = (newInfo) => {
    setUserInfo(prev => ({ ...prev, ...newInfo }));
  };

  const updateProfileImage = (imageUrl) => {
    setUserInfo(prev => ({ ...prev, profileImage: imageUrl }));
  };

  return (
    <UserContext.Provider value={{
      userInfo,
      updateUserInfo,
      updateProfileImage
    }}>
      {children}
    </UserContext.Provider>
  );
}; 