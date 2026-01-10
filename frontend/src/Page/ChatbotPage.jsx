import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import botAvatar from '../assets/4712035.png';
import userAvatar from '../assets/4712036.png';
import '../Components/AIChatbox.css';

function getTime() {
  const d = new Date();
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const BOT_AVATAR = botAvatar;
const USER_AVATAR = userAvatar;

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isComposing, setIsComposing] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const askOllama = async (userMessage) => {
    const fullPrompt = `
You are an AI chatbot that assists users in operating their smart farms.
- Do not use emojis in your answers.
- Only use terms that are actually used in real-world agricultural settings.
- Always answer in natural, fluent Korean.
- Use only natural and easy Korean expressions that are common in everyday life.
- Do not use translationese, artificial sentences, or vague/meaningless terms.
- Answer as if you are a real agricultural expert, using only the logic and terms used by actual farmers.
- If the user's question is not related to farms, smart farms, crops, or cultivation, only reply with the following sentence: "죄송합니다. 스마트팜 농장 관련으로만 질문을 주세요."
- Do not provide any other answers, additional explanations, guesses, or alternative information.
- For each crop, specifically provide its official optimal temperature range (°C) based on agricultural data, possible problems that may occur at the given temperature, crops that can better withstand the condition, and recommended actions.
- If the given temperature is outside the official optimal range for a crop, do NOT use the word "optimal." Instead, explain that the crop "can tolerate it, but may experience stress."
- Do not make guesses or create information that is not true. Do NOT say "A is the best" if none of the crops are clearly optimal at the given condition.
- If none of the crops are in their optimal range, clearly state that all are at risk of stress and that careful environmental control is required.
- Do not use uncommon terms such as "flower stalk" or "losing soil." Use only expressions commonly used in real agricultural settings, such as "wilting" or "flower drop."
- If you are unsure about the answer or do not know the answer, simply reply, "잘 모르겠습니다" or "정확한 정보를 제공해 드릴 수 없습니다."
- Do not make up new knowledge or provide speculative explanations under any circumstances.
- If the user provides a temperature value without specifying the unit, always interpret it as degrees Celsius (°C).
- Limit your answer to 500 characters or less.
- Instead, politely ask them to clarify or provide more context.
- Never assume the meaning of short or contextless inputs.
- never guess or provide a solution based on assumed meanings of these values.
- If the user's question is unclear, ask for more details.
- Never guess or interpret these inputs. Only provide guidance and answers for values within a realistic range.
- Do not use any Markdown formatting such as tables, code blocks, bold, or italics in your answers.
- Always respond using only natural, easy language commonly used in real agricultural settings.
- If you need to provide data, include numbers and units naturally within the sentence.
- If the user's question is not clear, please do not make assumptions or answer arbitrarily.


Always answer in natural, fluent Korean.
질문: ${userMessage}
답변:
`.trim();

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3:1.7b',
          prompt: fullPrompt,
          stream: false,
          system: '너는 한국인을 위한 스마트팜을 위한 농장 ai야',
          options: {
            temperature: 0.2,
            top_p: 0.85,
            seed: 42
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ollama 서버 응답 오류');
      }

      const data = await response.json();
      const cleanResponse = data.response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return cleanResponse;
    } catch (err) {
      console.error('Ollama 호출 오류:', err.message);
      throw new Error('AI 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인해주세요.');
    }
  };

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', text: input.trim(), time: getTime() };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const botResponse = await askOllama(userMsg.text);
      setMessages(msgs => [
        ...msgs,
        { role: 'bot', text: botResponse, time: getTime() }
      ]);
    } catch (error) {
      console.error('AI 챗박스 오류:', error);
      setMessages(msgs => [
        ...msgs,
        { role: 'bot', text: error.message, time: getTime() }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      send();
    }
  }, [send, isComposing]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSendClick = useCallback(() => {
    send();
  }, [send]);

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-header">
        <button className="back-button" onClick={handleBackToLogin}>
          ← 로그인 페이지로 돌아가기
        </button>
        <div className="ai-chat-title">챗봇</div>
      </div>

      <div className="ai-chat-container">
        <div className="ai-chat-content">
          {messages.length === 0 ? (
            <div className="ac-welcome-screen">
              <div className="ac-welcome-title">안녕하세요! GreenSync AI 챗봇입니다</div>
              <div className="ac-welcome-subtitle">
                스마트팜과 농업에 관한 질문을 자유롭게 해주세요
              </div>
              
            </div>
          ) : (
            <div className="ac-messages-container">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ac-message ${msg.role}`}>
                  <div className="ac-message-avatar">
                    <img
                      src={msg.role === 'user' ? USER_AVATAR : BOT_AVATAR}
                      alt={msg.role}
                    />
                  </div>
                  <div className="ac-message-content">
                    <div className="ac-message-text">{msg.text}</div>
                    <div className="ac-message-time">{msg.time}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ac-message bot">
                  <div className="ac-message-avatar">
                    <img src={BOT_AVATAR} alt="bot" />
                  </div>
                  <div className="ac-message-content">
                    <div className="ac-typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="ac-input-container">
          <div className="ac-input-wrapper">
            <input
              ref={inputRef}
              className="ac-input-field"
              type="text"
              placeholder="스마트팜에 대해 궁금한 점을 물어보세요"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              disabled={loading}
              autoComplete="off"
              autoFocus
              spellCheck="false"
            />
            <div className="ac-input-actions">
              <button 
                className="ac-send-btn"
                onClick={handleSendClick}
                disabled={loading || !input.trim()}
                title="전송"
                type="button"
              >
                <span>➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
