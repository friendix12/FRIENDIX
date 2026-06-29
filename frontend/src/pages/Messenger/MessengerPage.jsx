import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { mockUsers, mockMessages, formatTime } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiSettings, FiSearch, FiPhone, FiVideo, FiInfo, FiImage, FiSmile, FiSend, FiFile, FiPaperclip } from 'react-icons/fi';
import './MessengerPage.css';

const MessengerPage = () => {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(mockUsers.find(u => u.id !== currentUser?.id));
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const contacts = mockUsers.filter(u => u.id !== currentUser?.id);
  const filteredContacts = contacts.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const chatMessages = messages[activeChat?.id] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: currentUser?.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages({
      ...messages,
      [activeChat?.id]: [...(messages[activeChat?.id] || []), newMsg],
    });
    setInput('');
  };

  return (
    <div className="app-layout">
      <Navbar activePage="messenger" />

      <div className="messenger-layout">
        {/* Sidebar: Contact List */}
        <div className="messenger-sidebar" id="messenger-sidebar">
          <div className="messenger-sidebar-header">
            <h2 className="messenger-title">Chats</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="messenger-icon-btn" title="New Message"><FiEdit size={16} /></button>
              <button className="messenger-icon-btn" title="Settings"><FiSettings size={16} /></button>
            </div>
          </div>

          <div className="messenger-search-wrap">
            <FiSearch size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search Messenger"
              className="messenger-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="messenger-search"
            />
          </div>

          <div className="contact-list">
            {filteredContacts.map((user, i) => {
              const lastMsg = (messages[user.id] || []).slice(-1)[0];
              const isActive = activeChat?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`contact-list-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveChat(user)}
                  id={`contact-${user.id}`}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={user.avatar} alt={user.fullName} className="avatar avatar-lg" />
                    {i < 3 && <span className="online-dot" />}
                  </div>
                  <div className="contact-info">
                    <p className="contact-list-name">{user.fullName}</p>
                    <p className="contact-last-msg">
                      {lastMsg
                        ? `${lastMsg.senderId === currentUser?.id ? 'You: ' : ''}${lastMsg.content}`
                        : i < 3 ? 'Active now' : 'Send a message'}
                    </p>
                  </div>
                  <div className="contact-meta">
                    {lastMsg && <span className="contact-time">{formatTime(lastMsg.createdAt)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window" id="chat-window">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={activeChat?.avatar} alt={activeChat?.fullName} className="avatar avatar-md" />
                    <span className="online-dot" />
                  </div>
                  <div>
                    <p className="chat-user-name">{activeChat?.fullName}</p>
                    <p className="chat-user-status">Active now</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="chat-action-btn" title="Voice Call"><FiPhone size={18} /></button>
                  <button className="chat-action-btn" title="Video Call"><FiVideo size={18} /></button>
                  <button className="chat-action-btn" title="Info"><FiInfo size={18} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages" id="chat-messages">
                {chatMessages.length === 0 && (
                  <div className="chat-empty">
                    <img src={activeChat?.avatar} alt="" className="avatar avatar-2xl" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeChat?.fullName}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '4px' }}>
                      Start your conversation by sending a message.
                    </p>
                  </div>
                )}

                {chatMessages.map(msg => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && (
                        <img src={activeChat?.avatar} alt="" className="avatar avatar-xs" style={{ flexShrink: 0 }} />
                      )}
                      <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="chat-input-section">
                <div className="chat-input-actions">
                  <button className="chat-input-btn" title="Attach file"><FiPaperclip size={18} /></button>
                  <button className="chat-input-btn" title="Send photo"><FiImage size={18} /></button>
                  <button className="chat-input-btn" title="Emoji"><FiSmile size={18} /></button>
                </div>

                <form onSubmit={handleSend} className="chat-form">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    id="chat-message-input"
                  />
                </form>

                <button className="chat-send-btn" onClick={handleSend} id="send-message-btn">
                  <FiSend size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="chat-empty" style={{ height: '100%' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</p>
              <h3>Your Messages</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Chat privately with your friends.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerPage;
