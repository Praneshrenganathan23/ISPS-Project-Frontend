import { useState, useEffect, useRef } from 'react';
import api from '../api';

export default function Chat({ currentUser, otherUser, projectId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    fetchMessages();
    markAsRead(); // Mark as read when opening chat
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [otherUser.id, projectId]);

  const markAsRead = async () => {
    try {
      await api.put(`/messages/read/${otherUser.id}?project_id=${projectId}`);
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${otherUser.id}?project_id=${projectId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/messages', {
        receiver_id: otherUser.id,
        project_id: projectId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="chat-overlay" style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '450px',
      zIndex: 1000, display: 'flex', flexDirection: 'column'
    }}>
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <div className="flex justify-between items-center mb-2" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0 }}>Chat with {otherUser.name}</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
        
        <div className="messages-container" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '0.5rem' }}>
          {messages.map((m) => (
            <div key={m.id} style={{
              textAlign: m.sender_id === currentUser.id ? 'right' : 'left',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                background: m.sender_id === currentUser.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                fontSize: '0.9rem',
                maxWidth: '80%'
              }}>
                {m.content}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)} 
            placeholder="Type a message..." 
            style={{ marginBottom: 0, padding: '0.5rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Send</button>
        </form>
      </div>
    </div>
  );
}
