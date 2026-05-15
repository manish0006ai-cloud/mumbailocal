import { useState, useRef, useEffect } from 'react';
import { processAgentQuery } from '../data/aiEngine';
import timetableData from '../data/accurate_timetable.json';
import './TimetableAgent.css';

export default function TimetableAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: "Hello! I'm your Mumbai Rail Agent. Ask me anything about train times, fast trains, or last trains." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsTyping(true);
    
    // Artificial delay for "thinking"
    setTimeout(async () => {
      try {
        const response = await processAgentQuery(userMsg, timetableData);
        setMessages(prev => [...prev, { role: 'agent', text: response.message }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'agent', text: "Sorry, I had trouble checking the timetable. Please try again." }]);
      } finally {
        setIsTyping(false);
      }
    }, 800);
  };

  const handleSuggestion = (text) => {
    setInput(text);
    // We don't auto-send so user can see what they're asking
  };

  return (
    <div className="timetable-agent">
      {isOpen && (
        <div className="agent-window">
          <div className="agent-header">
            <div className="agent-header-info">
              <div className="agent-avatar">🤖</div>
              <div className="agent-status-tag">
                <h4>Rail Agent</h4>
                <span className="status-online">Timetable Expert</span>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="agent-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="agent-typing">Agent is checking records...</div>
            )}
            
            {!isTyping && messages.length < 3 && (
              <div className="suggested-queries">
                <div className="suggestion-chip" onClick={() => handleSuggestion("Fast trains from Borivali to Churchgate")}>Fast to CCG</div>
                <div className="suggestion-chip" onClick={() => handleSuggestion("Last train to Kalyan")}>Last to Kalyan</div>
                <div className="suggestion-chip" onClick={() => handleSuggestion("Next trains from Thane to Panvel")}>TNA to PNL</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="agent-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              className="agent-input" 
              placeholder="Ask about trains..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              id="agent-query-input"
            />
            <button className="agent-send-btn" type="submit" disabled={!input.trim() || isTyping} id="agent-send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <button 
        className={`agent-bubble ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Talk to Rail Agent"
        id="agent-toggle-btn"
      >
        {isOpen ? (
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
             <path d="M18 6L6 18M6 6l12 12"/>
           </svg>
        ) : (
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
             <circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>
           </svg>
        )}
      </button>
    </div>
  );
}
