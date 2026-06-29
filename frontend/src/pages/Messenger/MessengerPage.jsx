import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { messagesAPI } from '../../services/api';
import { FiEdit, FiSettings, FiSearch, FiPhone, FiVideo, FiInfo, FiImage, FiSmile, FiSend, FiPaperclip } from 'react-icons/fi';
import './MessengerPage.css';

const MessengerPage = () => {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const contacts = currentUser?.friends || [];
  const filteredContacts = contacts.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const fetchChatMessages = async (userId) => {
    try {
      const data = await messagesAPI.getMessages(userId);
      setChatMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  useEffect(() => {
    if (activeChat) {
      const activeId = activeChat._id || activeChat.id;
      fetchChatMessages(activeId);
      // Auto-poll messages every 4 seconds for a pseudo-realtime feel without sockets overhead
      const interval = setInterval(() => {
        fetchChatMessages(activeId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const activeId = activeChat._id || activeChat.id;
    const content = input.trim();
    setInput('');

    // Prepend locally for immediate feel
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      senderId: currentUser?.id,
      content,
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, tempMsg]);

    try {
      await messagesAPI.sendMessage(activeId, content);
      fetchChatMessages(activeId);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
            {filteredContacts.map((user) => {
              const userId = user._id || user.id;
              const isActive = activeChat && (activeChat._id || activeChat.id) === userId;
              return (
                <div
                  key={userId}
                  className={`contact-list-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveChat(user)}
                  id={`contact-${userId}`}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="avatar avatar-lg" />
                    ) : (
                      <div className="avatar-placeholder avatar-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    <span className="online-dot" />
                  </div>
                  <div className="contact-info">
                    <p className="contact-list-name">{user.fullName}</p>
                    <p className="contact-last-msg">Active now</p>
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No chats found. Add friends to start chatting!
              </p>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window" id="chat-window">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {activeChat.avatar ? (
                      <img src={activeChat.avatar} alt={activeChat.fullName} className="avatar avatar-md" />
                    ) : (
                      <div className="avatar-placeholder avatar-md">
                        {activeChat.firstName?.[0]}{activeChat.lastName?.[0]}
                      </div>
                    )}
                    <span className="online-dot" />
                  </div>
                  <div>
                    <p className="chat-user-name">{activeChat.fullName}</p>
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
                    {activeChat.avatar ? (
                      <img src={activeChat.avatar} alt="" className="avatar avatar-2xl" style={{ margin: '0 auto 12px' }} />
                    ) : (
                      <div className="avatar-placeholder avatar-2xl" style={{ margin: '0 auto 12px' }}>
                        {activeChat.firstName?.[0]}{activeChat.lastName?.[0]}
                      </div>
                    )}
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeChat.fullName}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '4px' }}>
                      Start your conversation by sending a message.
                    </p>
                  </div>
                )}

                {chatMessages.map(msg => {
                  const isMine = msg.senderId === currentUser?.id;
                  const msgId = msg._id || msg.id;
                  return (
                    <div key={msgId} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && (
                        activeChat.avatar ? (
                          <img src={activeChat.avatar} alt="" className="avatar avatar-xs" style={{ flexShrink: 0 }} />
                        ) : (
                          <div className="avatar-placeholder avatar-xs" style={{ flexShrink: 0 }}>
                            {activeChat.firstName?.[0]}{activeChat.lastName?.[0]}
                          </div>
                        )
                      )}
                      <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
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
            <div className="chat-empty" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px', margin: 0 }}>💬</p>
              <h3 style={{ margin: 0 }}>Your Messages</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', margin: 0 }}>
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
