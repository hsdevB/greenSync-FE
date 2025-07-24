import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AIChatbot.css';

const AIChatbot = ({ showChatbot = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 스마트팜 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('inputValue 상태 변화:', inputValue);
  }, [inputValue]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const currentValue = inputRef.current?.value || inputValue;
    console.log('전송할 값:', currentValue);
    
    if (!currentValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: currentValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsTyping(true);

    try {
      // Ollama API 호출
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama2', // 또는 다른 모델명
        prompt: `당신은 스마트팜 AI 어시스턴트입니다. 다음 질문에 한국어로 답변해주세요: ${currentValue}`,
        stream: false
      });

      const botResponse = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Ollama API 오류:', error);
      // 오류 시 기본 응답
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(currentValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, messages.length]);

  // 기본 응답 함수 (Ollama API 실패 시 사용)
  const getBotResponse = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('온도')) return "현재 온도는 23.5°C입니다.";
    if (lower.includes('습도')) return "현재 습도는 65%입니다.";
    if (lower.includes('급수') || lower.includes('물')) return "급수량은 15L입니다.";
    if (lower.includes('조명') || lower.includes('광량')) return "조명 강도는 450 lux입니다.";
    if (lower.includes('상태') || lower.includes('status')) return "모든 시스템이 정상입니다.";
    if (lower.includes('도움')) return "온도, 습도, 조명 상태를 질문하실 수 있습니다.";
    return "죄송합니다. 질문을 이해하지 못했습니다. '도움'을 입력해보세요.";
  };

  if (!showChatbot) return null;

  return (
    <div className="ai-chatbot-container">
      <button
        className={`ai-chatbot-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI 챗봇 열기"
      >
        💬
      </button>

      {isOpen && (
        <div className="ai-chatbot-window">
          <div className="ai-chatbot-header">
            <div className="ai-chatbot-title">AI 어시스턴트</div>
            <button className="ai-chatbot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-chatbot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`ai-message ${m.sender}`}>
                <div className="ai-message-content">{m.text}</div>
                <div className="ai-message-time">
                  {m.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message bot">
                <div className="ai-typing-indicator"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              defaultValue=""
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('입력값 변경:', newValue, '길이:', newValue.length);
                console.log('이전 상태:', inputValue);
                setInputValue(newValue);
                console.log('상태 업데이트 완료');
              }}
              onKeyDown={(e) => {
                console.log('키 입력:', e.key, '키코드:', e.keyCode, '스페이스바:', e.key === ' ');
                console.log('현재 inputValue:', inputValue);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              onInput={(e) => {
                console.log('onInput 이벤트:', e.target.value);
              }}
              placeholder="메시지를 입력하세요... (Enter: 전송, Esc: 닫기)"
              disabled={isTyping}
              maxLength={1000}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              onClick={() => console.log('전송 버튼 클릭')}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;