import axios from 'axios';

// API 테스트 함수
async function testDailyTempHumidityMonitoring() {
  try {
    //console.log('🚀 일일 온습도 모니터링 API 테스트 시작...\n');

    // 1. 기본 API 테스트
    //console.log('1️⃣ 기본 API 테스트 (/api/daily-temp-humidity-monitoring)');
    const basicResponse = await axios.get('http://localhost:3000/api/daily-temp-humidity-monitoring');
    //console.log('✅ 응답 상태:', basicResponse.status);
    //console.log('✅ 데이터 구조:', {
      success: basicResponse.data.success,
      message: basicResponse.data.message,
      hasTemperature: !!basicResponse.data.data?.temperature,
      hasHumidity: !!basicResponse.data.data?.humidity,
      hasStats: !!basicResponse.data.data?.stats
    });
    //console.log('✅ 온도 데이터 개수:', basicResponse.data.data?.temperature?.length || 0);
    //console.log('✅ 습도 데이터 개수:', basicResponse.data.data?.humidity?.length || 0);
    //console.log('✅ 통계 정보:', basicResponse.data.data?.stats);
    //console.log('');

    // 2. 농장별 API 테스트
    //console.log('2️⃣ 농장별 API 테스트 (/api/daily-temp-humidity-monitoring/1)');
    const farmResponse = await axios.get('http://localhost:3000/api/daily-temp-humidity-monitoring/1');
    //console.log('✅ 응답 상태:', farmResponse.status);
    //console.log('✅ 농장 ID:', farmResponse.data.data?.farmId);
    //console.log('✅ 온도 데이터 샘플:', farmResponse.data.data?.temperature?.slice(0, 3));
    //console.log('✅ 습도 데이터 샘플:', farmResponse.data.data?.humidity?.slice(0, 3));
    //console.log('');

    // 3. 다른 농장 테스트
    //console.log('3️⃣ 다른 농장 테스트 (/api/daily-temp-humidity-monitoring/2)');
    const farm2Response = await axios.get('http://localhost:3000/api/daily-temp-humidity-monitoring/2');
    //console.log('✅ 응답 상태:', farm2Response.status);
    //console.log('✅ 농장 ID:', farm2Response.data.data?.farmId);
    //console.log('✅ 온도 통계:', farm2Response.data.data?.stats?.temperature);
    //console.log('✅ 습도 통계:', farm2Response.data.data?.stats?.humidity);
    //console.log('');

    // 4. 데이터 검증
    //console.log('4️⃣ 데이터 검증');
    const allResponses = [basicResponse, farmResponse, farm2Response];
    
    allResponses.forEach((response, index) => {
      const data = response.data.data;
      //console.log(`📊 응답 ${index + 1}:`);
      //console.log(`   - 온도 범위: ${Math.min(...data.temperature.map(t => t.value))}°C ~ ${Math.max(...data.temperature.map(t => t.value))}°C`);
      //console.log(`   - 습도 범위: ${Math.min(...data.humidity.map(h => h.value))}% ~ ${Math.max(...data.humidity.map(h => h.value))}%`);
      //console.log(`   - 데이터 포인트: ${data.temperature.length}개`);
      //console.log(`   - 시간 형식: ${data.temperature[0]?.time}`);
    });

    //console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 테스트 실행
testDailyTempHumidityMonitoring(); 