import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import PostCard from '../../components/Post/PostCard';
import CreateReelModal from '../../components/CreateReel/CreateReelModal';
import { usersAPI, postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCamera, FiEdit2, FiPlus, FiMessageSquare, FiMoreHorizontal, FiMail, FiBriefcase, FiBookOpen, FiMapPin, FiHeart, FiCalendar, FiVideo, FiPlay } from 'react-icons/fi';
import './ProfilePage.css';

const TABS = ['Posts', 'About', 'Friends', 'Photos', 'Reels'];

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showCreateReel, setShowCreateReel] = useState(false);
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleCoverClick = () => {
    if (coverInputRef.current) coverInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await postsAPI.uploadFile(file);
      await updateProfile({ avatar: res.url });
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await postsAPI.uploadFile(file);
      await updateProfile({ coverPhoto: res.url });
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      alert('Failed to upload cover photo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Real Profile States
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetId = userId || currentUser?.id || currentUser?._id;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (targetId === currentUser?.id || targetId === currentUser?._id) {
        setProfileUser(currentUser);
      } else {
        const res = await usersAPI.getProfile(targetId);
        setProfileUser(res.user);
      }

      const postsRes = await postsAPI.getUserPosts(targetId);
      setUserPosts(postsRes.posts || []);
    } catch (err) {
      console.error('Error fetching profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchProfileData();
    }
  }, [userId, currentUser]);

  const isOwner = profileUser?._id === currentUser?._id || profileUser?.id === currentUser?.id;
  const isFriend = currentUser?.friends?.some(f => (f._id || f) === (profileUser?._id || profileUser?.id));
  const userPhotos = userPosts.filter(p => p.image && !p.image.match(/\.(mp4|mov|avi|mkv|webm|3gp)/i));
  const profileReels = userPosts.filter(p => p.image && p.image.match(/\.(mp4|mov|avi|mkv|webm|3gp)/i));

  const handleEditOpen = () => {
    setEditForm({
      bio: profileUser?.bio || '',
      location: profileUser?.location || '',
      work: profileUser?.work || '',
      education: profileUser?.education || '',
      relationship: profileUser?.relationship || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      // In the backend, we can update profile data
      updateProfile(editForm);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading Profile...
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="app-layout">
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem' }}>😢</p>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '12px' }}>User not found.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar activePage="profile" />

      <div className="profile-wrapper">
        {/* Cover + Profile Header */}
        <div className="profile-header-section">
          {/* Cover Photo */}
          <div className="profile-cover-wrap">
            <img
              src={profileUser?.coverPhoto || `https://picsum.photos/seed/cover_${profileUser?._id || profileUser?.id}/900/300`}
              alt="Cover"
              className="profile-cover-img"
            />
            {isOwner && (
              <>
                <button className="cover-edit-btn" onClick={handleCoverClick}>
                  <FiCamera style={{ marginRight: '6px' }} /> Change Cover Photo
                </button>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          {/* Profile Info Bar */}
          <div className="profile-info-bar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrap">
                {profileUser?.avatar ? (
                  <img src={profileUser.avatar} alt={profileUser?.fullName} className="profile-avatar" />
                ) : (
                  <div className="avatar-placeholder" style={{ width: '168px', height: '168px', fontSize: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', fontWeight: 800 }}>
                    {profileUser?.firstName?.[0]}{profileUser?.lastName?.[0]}
                  </div>
                )}
                {isOwner && (
                  <>
                    <button className="avatar-edit-btn" onClick={handleAvatarClick}>
                      <FiCamera size={16} />
                    </button>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="profile-name-section">
              <div>
                <h1 className="profile-full-name">{profileUser?.fullName}</h1>
                <p className="profile-friend-count">
                  {(profileUser?.friends || []).length} friends
                </p>
                {/* Friend Avatars overlaps */}
                <div className="friend-avatars" style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
                  {(profileUser?.friends || []).slice(0, 6).map((f, i) => (
                    f.avatar ? (
                      <img
                        key={f._id || f.id}
                        src={f.avatar}
                        alt=""
                        className="avatar avatar-xs friend-avatar-overlap"
                        style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: 6 - i }}
                      />
                    ) : (
                      <div
                        key={f._id || f.id}
                        className="avatar avatar-xs avatar-placeholder friend-avatar-overlap"
                        style={{ marginLeft: i === 0 ? 0 : '-8px', zIndex: 6 - i, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', fontSize: '0.6rem', fontWeight: 700 }}
                      >
                        {f.firstName?.[0]}
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="profile-actions">
                {isOwner ? (
                  <>
                    <button className="btn btn-primary" id="edit-profile-btn" onClick={handleEditOpen}>
                      <FiEdit2 style={{ marginRight: '6px' }} /> Edit Profile
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                      <FiPlus style={{ marginRight: '6px' }} /> Add to Story
                    </button>
                    <button className="btn btn-secondary"><FiMoreHorizontal /></button>
                  </>
                ) : (
                  <>
                    {isFriend ? (
                      <button className="btn btn-secondary">✓ Friends</button>
                    ) : (
                      <button className="btn btn-primary">Add Friend</button>
                    )}
                    <button className="btn btn-secondary" onClick={() => navigate('/messenger')}>
                      <FiMessageSquare style={{ marginRight: '6px' }} /> Message
                    </button>
                    <button className="btn btn-secondary"><FiMoreHorizontal /></button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="profile-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                id={`profile-tab-${tab.toLowerCase()}`}
                className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {activeTab === 'Posts' && (
            <div className="profile-posts-layout">
              {/* Left: Intro */}
              <div className="profile-intro-column">
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '14px' }}>Intro</h3>
                  {profileUser?.bio && (
                    <p style={{ textAlign: 'center', fontSize: '0.93rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                      {profileUser.bio}
                    </p>
                  )}
                  {isOwner && !profileUser?.bio && (
                    <button className="btn btn-secondary btn-full" style={{ marginBottom: '12px' }} onClick={handleEditOpen}>
                      Add Bio
                    </button>
                  )}

                  <div className="intro-details">
                    {profileUser?.work && (
                      <div className="intro-item">
                        <FiBriefcase style={{ color: 'var(--text-secondary)' }} /> <span>Works at <strong>{profileUser.work}</strong></span>
                      </div>
                    )}
                    {profileUser?.education && (
                      <div className="intro-item">
                        <FiBookOpen style={{ color: 'var(--text-secondary)' }} /> <span>Studied at <strong>{profileUser.education}</strong></span>
                      </div>
                    )}
                    {profileUser?.location && (
                      <div className="intro-item">
                        <FiMapPin style={{ color: 'var(--text-secondary)' }} /> <span>Lives in <strong>{profileUser.location}</strong></span>
                      </div>
                    )}
                    {profileUser?.relationship && (
                      <div className="intro-item">
                        <FiHeart style={{ color: 'var(--text-secondary)' }} /> <span>Relationship: <strong>{profileUser.relationship}</strong></span>
                      </div>
                    )}
                    {profileUser?.createdAt && (
                      <div className="intro-item">
                        <FiCalendar style={{ color: 'var(--text-secondary)' }} /> <span>Joined <strong>{new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</strong></span>
                      </div>
                    )}
                  </div>

                  {isOwner && (
                    <button className="btn btn-secondary btn-full" style={{ marginTop: '12px' }} onClick={handleEditOpen}>
                      Edit Details
                    </button>
                  )}
                </div>

                {/* Photos Card */}
                {userPhotos.length > 0 && (
                  <div className="card" style={{ padding: '16px', marginTop: '16px' }}>
                    <div className="sidebar-section-header">
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Photos</h3>
                      <button
                        className="sidebar-section-link"
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.87rem' }}
                        onClick={() => setActiveTab('Photos')}
                      >
                        See all photos
                      </button>
                    </div>
                    <div className="photo-grid">
                      {userPhotos.slice(0, 9).map(p => (
                        <img key={p._id || p.id} src={p.image} alt="Thumb" className="photo-thumb" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-posts-column">
                {userPosts.length > 0 ? (
                  userPosts.map(post => <PostCard key={post._id || post.id} post={post} onDelete={fetchProfileData} />)
                ) : (
                  <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem' }}>📝</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No posts available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '20px' }}>About</h2>
                <div className="intro-details">
                  {[
                    { icon: <FiMail />, label: 'Email/Phone', value: profileUser?.email || profileUser?.phone },
                    { icon: <FiBriefcase />, label: 'Workplace', value: profileUser?.work },
                    { icon: <FiBookOpen />, label: 'Education', value: profileUser?.education },
                    { icon: <FiMapPin />, label: 'Location', value: profileUser?.location },
                    { icon: <FiHeart />, label: 'Relationship', value: profileUser?.relationship },
                  ].map(item => item.value && (
                    <div key={item.label} className="about-row">
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{item.icon}</span>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{item.label}</p>
                        <p style={{ fontWeight: 600 }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Friends' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px' }}>
                  Friends · {(profileUser?.friends || []).length}
                </h2>
                {(!profileUser?.friends || profileUser.friends.length === 0) ? (
                  <p style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>No friends added yet.</p>
                ) : (
                  <div className="friends-grid">
                    {profileUser.friends.map(user => {
                      const userId = user._id || user.id;
                      return (
                        <div
                          key={userId}
                          className="friend-card"
                          onClick={() => navigate(`/profile/${userId}`)}
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.fullName} className="friend-card-img" />
                          ) : (
                            <div className="avatar-placeholder friend-card-img" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'var(--primary)', color: 'white', fontWeight: 700 }}>
                              {user.firstName?.[0]}
                            </div>
                          )}
                          <p className="friend-card-name">{user.fullName}</p>
                          <p className="friend-card-mutual">Friend</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Photos' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '16px' }}>Photos</h2>
                {userPhotos.length > 0 ? (
                  <div className="photo-grid-large">
                    {userPhotos.map(p => (
                      <img key={p._id || p.id} src={p.image} alt="User upload" className="photo-thumb-large" />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                    No photos found.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Reels' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.93rem', borderBottom: '3px solid var(--primary)', paddingBottom: '10px', color: 'var(--primary)', cursor: 'pointer' }}>Your reels</span>
                  </div>
                  {isOwner && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                      onClick={() => setShowCreateReel(true)}
                      id="profile-create-reel-btn"
                    >
                      <FiPlus size={14} /> Create reel
                    </button>
                  )}
                </div>

                {profileReels.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No reels uploaded yet.</p>
                ) : (
                  <div className="profile-reels-grid">
                    {profileReels.map(reel => {
                      const reelId = reel._id || reel.id;
                      return (
                        <div key={reelId} className="profile-reel-card" onClick={() => navigate('/watch')}>
                          <video src={reel.image} muted className="profile-reel-thumb" />
                          <div className="profile-reel-overlay">
                            <FiPlay size={16} style={{ color: 'white', fill: 'white' }} />
                            <span className="profile-reel-views">{(reel.likes || []).length} likes</span>
                          </div>
                          {reel.content && (
                            <p className="profile-reel-desc">{reel.content}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'bio', label: 'Bio', placeholder: 'Describe yourself...', type: 'textarea' },
                { name: 'work', label: 'Work', placeholder: 'Where do you work?', type: 'text' },
                { name: 'education', label: 'Education', placeholder: 'Where did you study?', type: 'text' },
                { name: 'location', label: 'Location', placeholder: 'Where do you live?', type: 'text' },
                { name: 'relationship', label: 'Relationship Status', placeholder: 'Relationship status', type: 'select' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`edit-${field.name}`}
                      className="form-input"
                      style={{ resize: 'vertical', minHeight: '80px' }}
                      placeholder={field.placeholder}
                      value={editForm[field.name] || ''}
                      onChange={e => setEditForm({ ...editForm, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`edit-${field.name}`}
                      className="form-input"
                      value={editForm[field.name] || ''}
                      onChange={e => setEditForm({ ...editForm, [field.name]: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {['Single', 'In a relationship', 'Married', 'Divorced', 'It\'s complicated'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`edit-${field.name}`}
                      type="text"
                      className="form-input"
                      placeholder={field.placeholder}
                      value={editForm[field.name] || ''}
                      onChange={e => setEditForm({ ...editForm, [field.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" id="save-profile-btn" onClick={handleSaveProfile}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reel Wizard Modal */}
      <CreateReelModal
        isOpen={showCreateReel}
        onClose={() => setShowCreateReel(false)}
        onUpload={fetchProfileData}
      />
    </div>
  );
};

export default ProfilePage;
