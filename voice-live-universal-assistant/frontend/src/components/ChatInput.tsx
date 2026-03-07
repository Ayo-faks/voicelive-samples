import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={barStyle}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
        aria-label="Message input"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          ...sendBtnStyle,
          opacity: disabled || !text.trim() ? 0.4 : 1,
        }}
        aria-label="Send message"
        title="Send"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
};

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderTop: '1px solid var(--border-subtle)',
  background: 'var(--bg-2)',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-1)',
  color: 'var(--fg-1)',
  fontSize: '0.95rem',
  outline: 'none',
};

const sendBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--brand-blue)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};
