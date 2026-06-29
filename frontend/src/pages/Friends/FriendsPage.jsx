import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  FiUserCheck, FiUserPlus, FiUsers, FiGift,
  FiCheck, FiMessageSquare, FiUserMinus
} from 'react-icons/fi';
import './FriendsPage.css';

const TABS = [
  { id: 'requests', label: 'Friend Requests', icon: <FiUserCheck size={18} /> },
  { id: 'suggestions', label: 'Suggestions', icon: <FiUserPlus size={18} /> },
  { id: 'all', label: 'All Friends', icon: <FiUsers size={18} /> },
  { id: 'birthdays', label: 'Birthdays', icon: <FiGift size={18} /> }
];

const FriendsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [sentRequests, setSentRequests] = useState({});
  const [confirmedRequests, setConfirmedRequests] = useState({});

  const requests = currentUser?.friendRequests || [];
  const friends = currentUser?.friends || [];

  // Fetch real suggestions from backend
  useEffect(() => {
    if (activeTab === 'suggestions') {
      const fetchSuggestions = async () => {
        try {
          setLoadingSuggestions(true);
          const data = await usersAPI.getSuggestions();
          setSuggestions(data.users || []);
        } catch (err) {
          console.error('Failed to fetch suggestions:', err);
        } finally {
          setLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [activeTab]);

  const handleConfirm = async (user) => {
    const userId = user._id || user.id;
    try {
      await usersAPI.acceptFriendRequest(userId);
      setConfirmedRequests(prev => ({ ...prev, [userId]: true }));
      
      setTimeout(() => {
        const updatedRequests = requests.filter(r => (r._id || r.id) !== userId);
        const updatedFriends = [...friends, user];
        updateProfile({ friendRequests: updatedRequests, friends: updatedFriends });
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('রিকোয়েস্ট গ্রহণ করা যায়নি।');
    }
  };

  const handleDelete = async (id) => {
    try {
      await usersAPI.declineFriendRequest(id);
      const updatedRequests = requests.filter(r => (r._id || r.id) !== id);
      updateProfile({ friendRequests: updatedRequests });
    } catch (err) {
      console.error(err);
      alert('রিকোয়েস্ট বাতিল করা যায়নি।');
    }
  };

  const handleAddFriend = async (id) => {
    try {
      await usersAPI.sendFriendRequest(id);
      setSentRequests(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error(err);
      alert('রিকোয়েস্ট পাঠানো যায়নি।');
    }
  };

  const handleUnfriend = async (id) => {
    if (!window.confirm('Are you sure you want to unfriend this user?')) return;
    try {
      await usersAPI.unfriend(id);
      const updatedFriends = friends.filter(f => (f._id || f.id) !== id);
      updateProfile({ friends: updatedFriends });
    } catch (err) {
      console.error(err);
      alert('আনফ্রেন্ড করা যায়নি।');
    }
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
                    const userId = user._id || user.id;
                    const isConfirmed = confirmedRequests[userId] || false;
                    return (
                      <div key={userId} className="friend-card animate-fadeIn">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }} />
                        ) : (
                          <div className="avatar-placeholder friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-secondary)' }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div className="friend-card-info">
                          <p className="friend-card-name" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                          <p className="friend-card-meta">Friend Request</p>
                          <div className="friend-card-actions">
                            {isConfirmed ? (
                              <button className="btn btn-success btn-full btn-sm" disabled style={{ background: 'var(--success-light)', color: 'var(--success)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <FiCheck /> Request Confirmed
                              </button>
                            ) : (
                              <>
                                <button className="btn btn-primary btn-full btn-sm" onClick={() => handleConfirm(user)} id={`confirm-btn-${userId}`}>Confirm</button>
                                <button className="btn btn-secondary btn-full btn-sm" onClick={() => handleDelete(userId)} id={`delete-btn-${userId}`}>Delete</button>
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
              {loadingSuggestions ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading suggestions...</div>
              ) : suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>No suggestions available.</div>
              ) : (
                <div className="friends-grid">
                  {suggestions.map(user => {
                    const userId = user._id || user.id;
                    const isSent = sentRequests[userId] || false;
                    return (
                      <div key={userId} className="friend-card animate-fadeIn">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }} />
                        ) : (
                          <div className="avatar-placeholder friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-secondary)' }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div className="friend-card-info">
                          <p className="friend-card-name" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                          <p className="friend-card-meta">{user.bio || 'Friendix user'}</p>
                          <div className="friend-card-actions">
                            {isSent ? (
                              <button className="btn btn-success btn-full btn-sm" disabled style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <FiCheck /> Request Sent
                              </button>
                            ) : (
                              <>
                                <button className="btn btn-primary btn-full btn-sm" onClick={() => handleAddFriend(userId)} id={`add-btn-${userId}`}>
                                  Add Friend
                                </button>
                                <button className="btn btn-secondary btn-full btn-sm" onClick={() => navigate(`/profile/${userId}`)}>
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
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>You haven't added any friends yet.</div>
              ) : (
                <div className="friends-grid">
                  {friends.map(user => {
                    const userId = user._id || user.id;
                    return (
                      <div key={userId} className="friend-card animate-fadeIn">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }} />
                        ) : (
                          <div className="avatar-placeholder friend-card-img" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-secondary)' }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <div className="friend-card-info">
                          <p className="friend-card-name" onClick={() => navigate(`/profile/${userId}`)} style={{ cursor: 'pointer' }}>{user.fullName}</p>
                          <p className="friend-card-meta">Friend</p>
                          <div className="friend-card-actions">
                            <button className="btn btn-primary btn-full btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => navigate('/messenger')}>
                              <FiMessageSquare /> Message
                            </button>
                            <button className="btn btn-secondary btn-full btn-sm" onClick={() => handleUnfriend(userId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--danger)' }} id={`unfriend-btn-${userId}`}>
                              <FiUserMinus /> Unfriend
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Birthdays Tab */}
          {activeTab === 'birthdays' && (
            <div className="animate-fadeIn">
              <h3 className="friends-section-title">Today's Birthdays</h3>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎂</span>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>No birthdays today.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
