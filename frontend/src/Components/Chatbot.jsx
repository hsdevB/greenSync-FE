import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chatbot.css';
import botAvatar from '../assets/4712035.png';
import userAvatar from '../assets/4712036.png';

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
  const [messages, setMessages] = useState([]); // {role, text, time}
  const [isComposing, setIsComposing] = useState(false); // IME 조합 상태 추적

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // 외부에서 전달받은 isOpen prop이 있으면 사용, 없으면 내부 상태 사용
  const isChatbotOpen = isOpen !== undefined ? isOpen : open;
  const handleClose = onClose || (() => setOpen(false));

  useEffect(() => {
    if (isChatbotOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatbotOpen]);

  // 채팅이 열릴 때 입력창에 자동 포커스
  useEffect(() => {
    if (isChatbotOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChatbotOpen]);

  // 스마트팜 전문 LLM 호출 함수
  const askSmartFarmBot = async (userMessage) => {
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
- If the user's input is unclear, ambiguous, or too short (e.g., just a number or a single word), do not guess what they mean.
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
          think: false,
          system: '너는 한국인을 위한 스마트팜을 위한 농장 ai야',
          options: {
            seed: 42,
            temperature: 0.2,
            top_p: 0.9,
            use_mmap: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('LLM 서버 응답 오류');
      }

      const data = await response.json();
      // <think> 태그 제거
      const cleanResponse = data.response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return cleanResponse;
    } catch (err) {
      console.error('LLM 호출 오류:', err.message);
      throw new Error('스마트팜 AI 서버 호출 중 오류 발생');
    }
  };

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', text: input.trim(), time: getTime() };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      // 스마트팜 전문 AI 호출
      const botResponse = await askSmartFarmBot(userMsg.text);
      setMessages(msgs => [
        ...msgs,
        { role: 'bot', text: botResponse, time: getTime() }
      ]);
    } catch (error) {
      console.error('챗봇 오류:', error);
      setMessages(msgs => [
        ...msgs,
        { role: 'bot', text: '스마트팜 AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', time: getTime() }
      ]);
    } finally {
      setLoading(false);
      // AI 응답 후 input에 포커스 복원 - IME 상태 초기화를 위해 blur 후 focus
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

  // 키보드 이벤트 핸들러 수정 - IME 상태를 정확히 추적
  const handleKeyDown = useCallback((e) => {
    // Enter 키이고 한글 조합 중이 아닐 때만 전송
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      send();
    }
  }, [send, isComposing]);

  // IME 조합 시작
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  // IME 조합 종료
  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // input 변경 핸들러
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInput(value);
  }, []);

  // 전송 버튼 클릭 핸들러
  const handleSendClick = useCallback(() => {
    send();
  }, [send]);

  return (
    <>
      {/* 외부에서 제어되지 않을 때만 FAB 버튼 표시 */}
      {isOpen === undefined && (
        <button 
          className="cb-fab" 
          onClick={() => setOpen(true)} 
          aria-label="스마트팜 AI 챗봇 열기"
        >
          <img src={BOT_AVATAR} alt="스마트팜 AI" style={{width: 38, height: 38}} />
        </button>
      )}
      {isChatbotOpen && (
        <div className="cb-fullscreen-overlay">
          <div className="cb-fullscreen-layout">
            {/* 사이드바 */}
            {sidebar}
            
            {/* 메인 콘텐츠 */}
            <div className="cb-fullscreen-container">
              {/* 헤더 */}
              <div className="cb-fullscreen-header">
                <div className="cb-header-left">
                  <img src={BOT_AVATAR} alt="SmartFarm AI" className="cb-header-avatar" />
                  <div className="cb-header-info">
                    <div className="cb-header-name">스마트팜 AI 어시스턴트</div>
                    <div className="cb-header-status">● 전문 농업 상담</div>
                  </div>
                </div>
                <button className="cb-close-btn" onClick={handleClose}>
                  <span>×</span>
                </button>
              </div>

              {/* 메인 콘텐츠 */}
              <div className="cb-fullscreen-content">
                {messages.length === 0 ? (
                  <div className="cb-welcome-screen">
                    <div className="cb-welcome-title">무엇을 도와드릴까요?</div>
                    <div className="cb-welcome-subtitle">
                      스마트팜 운영에 관한 모든 것을 물어보세요
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

              {/* 입력 영역 */}
              <div className="cb-input-container">
                <div className="cb-input-wrapper">
                  <input
                    ref={inputRef}
                    className="cb-input-field"
                    type="text"
                    placeholder="무엇이든 물어보세요"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    disabled={loading}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    inputMode="text"
                    lang="ko"
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