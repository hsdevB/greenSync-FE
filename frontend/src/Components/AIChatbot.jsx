import React, { useState, useRef, useEffect } from 'react';
import './AIChatbot.css';

const AIChatbot = ({ showChatbot = false }) => {
  // 디버깅을 위한 콘솔 로그
  console.log('AIChatbot showChatbot:', showChatbot);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('온도') || input.includes('temperature')) {
      return "현재 온실 내 온도는 23.5°C입니다. 최적 온도 범위는 20-25°C입니다.";
    } else if (input.includes('습도') || input.includes('humidity')) {
      return "현재 습도는 65%입니다. 식물 생장에 적합한 습도 범위는 60-70%입니다.";
    } else if (input.includes('물') || input.includes('water') || input.includes('급수')) {
      return "오늘 급수량은 15L입니다. 수경재배 시스템이 정상 작동 중입니다.";
    } else if (input.includes('조명') || input.includes('light') || input.includes('광량')) {
      return "현재 조명 강도는 450 lux입니다. 식물 생장에 충분한 광량을 제공하고 있습니다.";
    } else if (input.includes('상태') || input.includes('status')) {
      return "모든 센서가 정상 작동 중입니다. 온실 환경이 최적 상태를 유지하고 있습니다.";
    } else if (input.includes('도움') || input.includes('help')) {
      return "다음과 같은 질문을 할 수 있습니다:\n• 온도/습도 상태\n• 급수량 확인\n• 조명 상태\n• 전체 시스템 상태";
    } else {
      return "죄송합니다. 질문을 이해하지 못했습니다. '도움'을 입력하시면 사용 가능한 명령어를 확인할 수 있습니다.";
    }
  };

  // showChatbot이 false면 렌더링하지 않음
  if (!showChatbot) {
    console.log('AIChatbot: not rendering (showChatbot is false)');
    return null;
  }

  console.log('AIChatbot: rendering chatbot button');

  return (
    <div className="ai-chatbot-container">
      {/* 챗봇 버튼 */}
      <button 
        className={`ai-chatbot-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI 챗봇 열기"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
            fill="currentColor"
          />
          <path 
            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
            fill="currentColor"
          />
          <circle cx="9" cy="12" r="1" fill="currentColor"/>
          <circle cx="15" cy="12" r="1" fill="currentColor"/>
          <path 
            d="M12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" 
            fill="currentColor"
          />
        </svg>
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="ai-chatbot-window">
          {/* 헤더 */}
          <div className="ai-chatbot-header">
            <div className="ai-chatbot-title">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
                  fill="currentColor"
                />
                <path 
                  d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
                  fill="currentColor"
                />
                <circle cx="9" cy="12" r="1" fill="currentColor"/>
                <circle cx="15" cy="12" r="1" fill="currentColor"/>
                <path 
                  d="M12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" 
                  fill="currentColor"
                />
              </svg>
              <span>AI 어시스턴트</span>
            </div>
            <button 
              className="ai-chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="ai-chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`ai-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <div className="ai-message-content">
                  {message.text}
                </div>
                <div className="ai-message-time">
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message bot">
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <form className="ai-chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="메시지를 입력하세요..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!inputValue.trim() || isTyping}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot; 