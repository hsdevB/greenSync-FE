import express from 'express';
import cors from 'cors';
import predictRouter from './routes/predict.js';
import { askSmartFarmBot } from './routes/llm.js';
import { simpleChatbot } from './routes/simple-chatbot.js';
import { environmentAdvicePrompt } from './promptTemplates.js';

const app = express();

// CORS 설정 수정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/predict', predictRouter);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상적으로 실행 중입니다.' });
});

// 스마트팜 LLM 챗봇
app.post('/ask', async (req, res) => {
  const userMessage = req.body.userMessage || '';
  try {
    const answer = await askSmartFarmBot(userMessage);
    res.json({ reply: answer });
  } catch (error) {
    console.error('AI 챗봇 오류:', error);
    res.status(500).json({ reply: 'AI 챗봇 응답 중 오류가 발생했습니다.' });
  }
});

// 간단한 프롬프트 챗봇
app.post('/simple-chat', async (req, res) => {
  const userMessage = req.body.userMessage || '';
  try {
    const answer = await simpleChatbot(userMessage);
    res.json({ reply: answer });
  } catch (error) {
    console.error('챗봇 오류:', error);
    res.status(500).json({ reply: '챗봇 응답 중 오류가 발생했습니다.' });
  }
});

// IoT 데이터 API
app.get('/api/iotdata', (req, res) => {
  try {
    // 샘플 IoT 데이터 반환
    const iotData = {
      temperature: 25.5,
      humidity: 65.2,
      co2: 450,
      light: 75.8,
      soil_moisture: 68.3,
      timestamp: new Date().toISOString()
    };
    res.json(iotData);
  } catch (error) {
    console.error('IoT 데이터 오류:', error);
    res.status(500).json({ error: 'IoT 데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 환경 조언 API
app.post('/environment-advice', async (req, res) => {
  const { userName, farmId, temperature, humidity, co2 } = req.body;
  try {
    // 환경 조언 프롬프트 생성 (현재는 사용하지 않지만 향후 확장을 위해 유지)
    environmentAdvicePrompt({ userName, farmId, temperature, humidity, co2 });
    
    // 여기에 실제 AI 모델 호출 로직을 추가할 수 있습니다
    const advice = `현재 온도 ${temperature}°C, 습도 ${humidity}%, CO₂ ${co2}ppm 상태입니다. 
    이 조건은 대부분의 작물에 적합합니다. 정기적인 환기와 온도 모니터링을 권장합니다.`;
    res.json({ advice });
  } catch (error) {
    console.error('환경 조언 오류:', error);
    res.status(500).json({ advice: '환경 조언 생성 중 오류가 발생했습니다.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
