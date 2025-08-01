export const validateUserId = (userId) => {
    if (!userId) return '아이디를 입력해주세요.';
    if (userId.length < 3 || userId.length > 50) return '아이디는 3글자 이상 50글자 이하로 입력해주세요.';
    return '';
};

export const validatePassword = (password) => {
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8글자 이상 입력해주세요.';
    return '';
};

export const validateName = (name) => {
    if (!name) return '이름을 입력해주세요.';
    if (name.length < 2 || name.length > 50) return '이름은 2글자 이상 50글자 이하로 입력해주세요.';
    return '';
};

export const validateEmail = (email) => {
    if (!email) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '올바른 이메일 형식을 입력해주세요.';
    return '';
};

export const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '휴대폰번호를 입력해주세요.';
    // 하이픈(-)을 제거하고 검사
    const phoneRegex = /^01[0-9]{8,9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/-/g, ''))) return '올바른 휴대폰번호 형식(01012345678)을 입력해주세요.';
    return '';
};