import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { mockUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUserCheck, FiUserPlus, FiUsers, FiGift,
  FiCheck, FiMessageSquare, FiUserMinus, FiTrash2
} from 'react-icons/fi';
import './FriendsPage.css';

const TABS = [
  { id: 'requests', label: 'Friend Requests', icon: <FiUserCheck size={18} /> },
  { id: 'suggestions', label: 'Suggestions', icon: <FiUserPlus size={18} /> },
  { id: 'all', label: 'All Friends', icon: <FiUsers size={18} /> },
  { id: 'birthdays', label: 'Birthdays', icon: <FiGift size={18} /> }
];

const EXTRA_SUGGESTIONS = [
  { id: 's101', fullName: 'Subir Das', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 's102', fullName: 'Mimi Roy', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 's103', fullName: 'Tanveer Alam', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 's104', fullName: 'Jannat Ara', avatar: 'https://i.pravatar.cc/150?img=5' }
];

const FriendsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');

  // Initialize data from mock data
  const defaultRequests = mockUsers.filter(u =>
    !currentUser?.friends?.includes(u.id) && u.id !== currentUser?.id
  ).slice(0, 3);

  const defaultFriends = mockUsers.filter(u =>
    currentUser?.friends?.includes(u.id) || u.id === '3' || u.id === '4' // mock some default friends
  );

  const [requests, setRequests] = useState(defaultRequests);
  const [suggestions, setSuggestions] = useState(EXTRA_SUGGESTIONS);
  const [friends, setFriends] = useState(defaultFriends);
  const [sentRequests, setSentRequests] = useState({});
  const [confirmedRequests, setConfirmedRequests] = useState({});

  const handleConfirm = (user) => {
    setConfirmedRequests(prev => ({ ...prev, [user.id]: true }));
    // Add to friends list
    setFriends(prev => [...prev, user]);
    // Remove from request list after animation
    setTimeout(() => {
      setRequests(prev => prev.filter(u => u.id !== user.id));
    }, 1500);
  };

  const handleDelete = (id) => {
    setRequests(prev => prev.filter(u => u.id !== id));
  };

  const handleAddFriend = (id) => {
    setSentRequests(prev => ({ ...prev, [id]: true }));
  };

  const handleUnfriend = (id) => {
    setFriends(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="app-layout">
      <Navbar activePage="friends" />

      <div className="friends-layout">
        {/* Sidebar */}
        <aside className="friends-sidebar">
          <h2 className="friends-title">Friends</h2>
          <nav className="friends-nav">
            {TABS.map(tab => {
              let badgeCount = 0;
              if (tab.id === 'requests') badgeCount = requests.length;
              
              return (
                <button
                  key={tab.id}
                  id={`friends-tab-${tab.id}`}
                  className={`friends-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="friends-nav-icon">{tab.icon}</span>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  {badgeCount > 0 && (
                    <span className="badge" style={{ background: 'var(--danger)', color: 'white', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', borderRadius: '50%' }}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="friends-main">
          {/* Friend Requests Tab */}
          {activeTab === 'requests' && (
            <div className="animate-fadeIn">
              <h3 className="friends-section-title">Friend Requests</h3>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  No pending friend requests.
                </div>
              ) : (
                <div className="friends-grid">
                  {requests.map(user => {
                    const isConfirmed = confirmedRequests[user.id] || false;
                    return (
                      <div key={user.id} className="friend-card animate-fadeIn">
                        <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }} />
                        <div className="friend-card-info">
                          <p className="friend-card-name" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                          <p className="friend-card-meta">3 mutual friends</p>
                          <div className="friend-card-actions">
                            {isConfirmed ? (
                              <button className="btn btn-success btn-full btn-sm" disabled style={{ background: 'var(--success-light)', color: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <FiCheck /> Request Confirmed
                              </button>
                            ) : (
                              <>
                                <button className="btn btn-primary btn-full btn-sm" onClick={() => handleConfirm(user)} id={`confirm-btn-${user.id}`}>Confirm</button>
                                <button className="btn btn-secondary btn-full btn-sm" onClick={() => handleDelete(user.id)} id={`delete-btn-${user.id}`}>Delete</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="animate-fadeIn">
              <h3 className="friends-section-title">People You May Know</h3>
              {suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No suggestions available.</div>
              ) : (
                <div className="friends-grid">
                  {suggestions.map(user => {
                    const isSent = sentRequests[user.id] || false;
                    return (
                      <div key={user.id} className="friend-card animate-fadeIn">
                        <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }} />
                        <div className="friend-card-info">
                          <p className="friend-card-name" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                          <p className="friend-card-meta">5 mutual friends</p>
                          <div className="friend-card-actions">
                            {isSent ? (
                              <button className="btn btn-success btn-full btn-sm" disabled style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <FiCheck /> Request Sent
                              </button>
                            ) : (
                              <>
                                <button className="btn btn-primary btn-full btn-sm" onClick={() => handleAddFriend(user.id)} id={`add-btn-${user.id}`}>
                                  Add Friend
                                </button>
                                <button className="btn btn-secondary btn-full btn-sm" onClick={() => navigate(`/profile/${user.id}`)}>
                                  View Profile
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* All Friends Tab */}
          {activeTab === 'all' && (
            <div className="animate-fadeIn">
              <h3 className="friends-section-title">All Friends</h3>
              {friends.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>You haven't added any friends yet.</div>
              ) : (
                <div className="friends-grid">
                  {friends.map(user => (
                    <div key={user.id} className="friend-card animate-fadeIn">
                      <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }} />
                      <div className="friend-card-info">
                        <p className="friend-card-name" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                        <p className="friend-card-meta">Friend</p>
                        <div className="friend-card-actions">
                          <button className="btn btn-primary btn-full btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => navigate('/messenger')}>
                            <FiMessageSquare /> Message
                          </button>
                          <button className="btn btn-secondary btn-full btn-sm" onClick={() => handleUnfriend(user.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--danger)' }} id={`unfriend-btn-${user.id}`}>
                            <FiUserMinus /> Unfriend
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Birthdays Tab */}
          {activeTab === 'birthdays' && (
            <div className="animate-fadeIn">
              <h3 className="friends-section-title">Today's Birthdays</h3>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>🎂</span>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Karim Ahmed has a birthday today!</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Send him a warm message on his special day.</p>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/messenger')}>Send Wish</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
