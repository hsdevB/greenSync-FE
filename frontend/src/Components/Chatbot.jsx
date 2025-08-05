import React, { useState, useRef, useEffect, useCallback } from 'react';
import botAvatar from '../assets/4712035.png';
import userAvatar from '../assets/4712036.png';

// CSS 스타일을 직접 포함 2025-08-04 작성
const styles = `
/* FAB 버튼 */
.cb-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cb-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}

.cb-fab img {
  width: 38px;
  height: 38px;
  filter: brightness(0) invert(1);
}

/* 전체 화면 오버레이 */
.cb-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 256px;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cb-fullscreen-layout {
  display: flex;
  height: 100vh;
  width: calc(100% - 256px);
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.cb-fullscreen-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #ffffff;
  width: 100%;
  min-width: 0;
}

/* 헤더 */
.cb-fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #ffffff;
  min-height: 80px;
}

.cb-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cb-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #f0f0f0;
}

.cb-header-info {
  display: flex;
  flex-direction: column;
}

.cb-header-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.cb-header-status {
  font-size: 13px;
  color: #667eea;
}

.cb-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.cb-close-btn:hover {
  background-color: #f5f5f5;
}

/* 메인 콘텐츠 */
.cb-fullscreen-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 환영 화면 */
.cb-welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.cb-welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.cb-welcome-subtitle {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* 메시지 컨테이너 */
.cb-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8f9fa;
}

/* 메시지 */
.cb-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cb-message.user {
  flex-direction: row-reverse;
}

.cb-message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cb-message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cb-message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.cb-message.user .cb-message-content {
  align-items: flex-end;
}

.cb-message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cb-message.bot .cb-message-text {
  background: #ffffff;
  color: #333;
  border-bottom-left-radius: 4px;
}

.cb-message.user .cb-message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.cb-message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

/* 타이핑 인디케이터 */
.cb-typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cb-typing-indicator span {
  width: 6px;
  height: 6px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.cb-typing-indicator span:nth-child(1) { animation-delay: 0s; }
.cb-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.cb-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-10px); opacity: 1; }
}

/* 입력 영역 */
.cb-input-container {
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  background: #ffffff;
}

.cb-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 12px 16px;
  border: 2px solid #e5e5e5;
  transition: border-color 0.3s ease;
}

.cb-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.cb-input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 400;
  caret-color: #667eea;
  position: relative;
  z-index: 10000;
}

.cb-input-field::placeholder {
  color: #999;
}

.cb-input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cb-input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cb-send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.cb-send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.cb-send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 반응형 */
@media (max-width: 1024px) {
  .cb-fullscreen-overlay {
    left: 0;
  }
  
  .cb-fullscreen-layout {
    border-radius: 0;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .cb-fullscreen-overlay {
    left: 0;
  }
  
  .cb-fullscreen-layout {
    border-radius: 0;
    width: 100%;
  }
  
  .cb-message-content {
    max-width: 85%;
  }
  
  .cb-input-container {
    padding: 16px 20px;
  }
  
  .cb-welcome-title {
    font-size: 24px;
  }
  
  .cb-welcome-subtitle {
    font-size: 14px;
  }
  
  .cb-fullscreen-header {
    padding: 16px 20px;
    min-height: 70px;
  }
}

@media (max-width: 480px) {
  .cb-message-content {
    max-width: 90%;
  }
  
  .cb-input-container {
    padding: 12px 16px;
  }
  
  .cb-welcome-title {
    font-size: 20px;
  }
  
  .cb-welcome-subtitle {
    font-size: 13px;
  }
  
  .cb-fullscreen-header {
    padding: 12px 16px;
    min-height: 60px;
  }
  
  .cb-header-name {
    font-size: 14px;
  }
  
  .cb-header-status {
    font-size: 12px;
  }
}

/* 스크롤바 스타일링 */
.cb-messages-container::-webkit-scrollbar {
  width: 6px;
}

.cb-messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.cb-messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.cb-messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
`;

function getTime() {
  const d = new Date();
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const BOT_AVATAR = botAvatar;
const USER_AVATAR = userAvatar;

export default function Chatbot({ isOpen, onClose, sidebar }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isComposing, setIsComposing] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const isChatbotOpen = isOpen !== undefined ? isOpen : open;
  const handleClose = onClose || (() => setOpen(false));

  useEffect(() => {
    if (isChatbotOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatbotOpen]);

  useEffect(() => {
    if (isChatbotOpen && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // 강제로 포커스 설정
          inputRef.current.click();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isChatbotOpen]);

  const askOllama = async (userMessage) => {
    const fullPrompt = `
당신은 친근하고 도움이 되는 AI 어시스턴트입니다.

**중요한 지침:**
- 반드시 한국어로만 답변해주세요
- 영어나 다른 언어는 사용하지 마세요
- 자연스럽고 친근한 한국어로 답변해주세요
- 이모지는 사용하지 마세요
- 명확하고 유용한 정보를 제공해주세요
- 사용자의 질문에 정확하고 도움이 되는 답변을 해주세요
- 한국어 문법과 표현을 올바르게 사용해주세요

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
          options: {
            temperature: 0.7,
            top_p: 0.9,
            seed: 42
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ollama 서버 응답 오류');
      }

      const data = await response.json();
      // <think> 태그 제거
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
      console.error('챗봇 오류:', error);
      setMessages(msgs => [
        ...msgs,
        { role: 'bot', text: error.message, time: getTime() }
      ]);
    } finally {
      setLoading(false);
      if (inputRef.current) {
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.blur();
            requestAnimationFrame(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            });
          }
        });
      }
    }
  }, [input, loading]);

  const handleKeyUp = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      send();
    }
  }, [send, isComposing]);

  const handleCompositionStart = useCallback((e) => {
    e.stopPropagation();
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e) => {
    e.stopPropagation();
    setIsComposing(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    e.stopPropagation();
    setInput(e.target.value);
  }, []);

  const handleSendClick = useCallback(() => {
    send();
  }, [send]);

  return (
    <>
      <style>{styles}</style>
      {isOpen === undefined && (
        <button 
          className="cb-fab" 
          onClick={() => setOpen(true)} 
          aria-label="AI 챗봇 열기"
        >
          <img src={BOT_AVATAR} alt="AI 챗봇" style={{width: 38, height: 38}} />
        </button>
      )}
      {isChatbotOpen && (
        <div className="cb-fullscreen-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="cb-fullscreen-layout" onClick={(e) => e.stopPropagation()}>
            {sidebar}
            
            <div className="cb-fullscreen-container">
              <div className="cb-fullscreen-header">
                <div className="cb-header-left">
                  <img src={BOT_AVATAR} alt="AI Assistant" className="cb-header-avatar" />
                  <div className="cb-header-info">
                    <div className="cb-header-name">AI 어시스턴트</div>
                    <div className="cb-header-status">● Ollama qwen3:1.7b</div>
                  </div>
                </div>
                <button className="cb-close-btn" onClick={handleClose}>
                  <span>×</span>
                </button>
              </div>

              <div className="cb-fullscreen-content">
                {messages.length === 0 ? (
                  <div className="cb-welcome-screen">
                    <div className="cb-welcome-title">무엇을 도와드릴까요?</div>
                    <div className="cb-welcome-subtitle">
                      질문하시면 AI가 답변해드립니다
                    </div>
                  </div>
                ) : (
                  <div className="cb-messages-container">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`cb-message ${msg.role}`}>
                        <div className="cb-message-avatar">
                          <img
                            src={msg.role === 'user' ? USER_AVATAR : BOT_AVATAR}
                            alt={msg.role}
                          />
                        </div>
                        <div className="cb-message-content">
                          <div className="cb-message-text">{msg.text}</div>
                          <div className="cb-message-time">{msg.time}</div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="cb-message bot">
                        <div className="cb-message-avatar">
                          <img src={BOT_AVATAR} alt="bot" />
                        </div>
                        <div className="cb-message-content">
                          <div className="cb-typing-indicator">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="cb-input-container" onClick={(e) => e.stopPropagation()}>
                <div className="cb-input-wrapper" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={inputRef}
                    className="cb-input-field"
                    type="text"
                    placeholder="무엇이든 물어보세요"
                    value={input}
                    onChange={handleInputChange}
                    onKeyUp={handleKeyUp}
                    onKeyDown={(e) => e.stopPropagation()}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    onFocus={(e) => e.stopPropagation()}
                    onBlur={(e) => e.stopPropagation()}
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                    spellCheck="false"
                  />
                  <div className="cb-input-actions">
                    <button 
                      className="cb-send-btn"
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
        </div>
      )}
    </>
  );
} 