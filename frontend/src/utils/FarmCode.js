class FarmCode {
  static createFarmCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    const totalLength = Math.floor(Math.random() * 3) + 6; // 6, 7, 8
    
    const minLetters = 2;
    const minNumbers = 2;
    const remainingLength = totalLength - minLetters - minNumbers;
    
    const additionalLetters = Math.floor(Math.random() * (remainingLength + 1));
    const additionalNumbers = remainingLength - additionalLetters;
    
    const letterCount = minLetters + additionalLetters;
    const numberCount = minNumbers + additionalNumbers;
    
    let code = '';
    
    for (let i = 0; i < letterCount; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    for (let i = 0; i < numberCount; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  static validateFarmCode(code) {
    if (!code || typeof code !== 'string') return false;
    if (code.length < 6 || code.length > 8) return false;
    
    const hasLetter = /[A-Z]/.test(code);
    const hasNumber = /[0-9]/.test(code);
    const onlyValidChars = /^[A-Z0-9]+$/.test(code);
    
    return hasLetter && hasNumber && onlyValidChars;
  }

  static createAdminFarmCode() {
    return `ADMIN_${Date.now()}`;
  }
}

export default FarmCode; 