const axios = require('axios');

async function testDailyTempHumidityAPI() {
  try {
    //console.log('일일 온습도 API 테스트 시작...');
    
    // 기본 API 테스트
    const response = await axios.get('http://localhost:3000/api/daily-temp-humidity');
    //console.log('API 응답:', JSON.stringify(response.data, null, 2));
    
    // 농장별 API 테스트
    const farmResponse = await axios.get('http://localhost:3000/api/daily-temp-humidity/1');
    //console.log('농장별 API 응답:', JSON.stringify(farmResponse.data, null, 2));
    
  } catch (error) {
    console.error('API 테스트 오류:', error.response?.data || error.message);
  }
}

testDailyTempHumidityAPI(); 