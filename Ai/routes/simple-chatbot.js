import axios from 'axios';

// 간단한 프롬프트 챗봇
async function simpleChatbot(userMessage) {
  const simplePrompt = `
당신은 친근하고 도움이 되는 AI 어시스턴트입니다.
- 항상 한국어로 자연스럽게 답변하세요
- 사용자의 질문에 정확하고 유용한 정보를 제공하세요
- 모르는 것은 솔직히 모른다고 답변하세요
- 답변은 간결하고 이해하기 쉽게 작성하세요

질문: ${userMessage}
답변:
  `.trim();

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'qwen3:1.7b',
      prompt: simplePrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    return response.data.response.trim();
  } catch (err) {
    console.error('챗봇 오류:', err.message);
    return '죄송합니다. 일시적인 오류가 발생했습니다.';
  }
}

export { simpleChatbot }; 