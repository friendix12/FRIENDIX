import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI, postsAPI } from '../../services/api';
import { FiUsers, FiGlobe, FiLock, FiX, FiCheck, FiImage } from 'react-icons/fi';

const GroupsPage = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // File inputs state
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
    privacy: 'Public'
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.getAll();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinToggle = async (group) => {
    const groupId = group._id || group.id;
    const isJoined = group.members.includes(currentUser?.id || currentUser?._id);
    
    try {
      if (isJoined) {
        await groupsAPI.leave(groupId);
      } else {
        await groupsAPI.join(groupId);
      }
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'cover') {
        setCoverFile(file);
        setCoverPreview(url);
      }
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(url);
      }
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;

    try {
      setSubmitting(true);
      
      let coverUrl = '';
      let logoUrl = '';

      if (coverFile) {
        const coverRes = await postsAPI.uploadFile(coverFile);
        coverUrl = coverRes.url;
      }

      if (logoFile) {
        const logoRes = await postsAPI.uploadFile(logoFile);
        logoUrl = logoRes.url;
      }

      await groupsAPI.create({
        name: newGroupForm.name.trim(),
        description: newGroupForm.description.trim(),
        privacy: newGroupForm.privacy,
        cover: coverUrl,
        logo: logoUrl
      });

      setShowCreateModal(false);
      setNewGroupForm({ name: '', description: '', privacy: 'Public' });
      setCoverFile(null);
      setLogoFile(null);
      setCoverPreview(null);
      setLogoPreview(null);
      
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert('গ্রুপ তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar activePage="groups" />
      <div className="simple-layout">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 80px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers /> Groups
            </h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              id="create-group-btn"
            >
              + Create New Group
            </button>
          </div>

          <h2 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '1.07rem' }}>Suggested for You</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem' }}>👥</span>
              <p style={{ marginTop: '12px', fontWeight: 600 }}>No groups found.</p>
              <p style={{ fontSize: '0.82rem' }}>Be the first to create a group!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {groups.map(g => {
                const grpId = g._id || g.id;
                const isJoined = g.members.includes(currentUser?.id || currentUser?._id);
                return (
                  <div
                    key={grpId}
                    className="card"
                    style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    id={`group-card-${grpId}`}
                  >
                    <img src={g.cover || `https://picsum.photos/seed/cover_${grpId}/300/120`} alt={g.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px' }}>
                      {/* Logo and Name inline */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        {g.logo ? (
                          <img src={g.logo} alt="" className="avatar avatar-sm" style={{ border: '1px solid var(--border-light)', flexShrink: 0 }} />
                        ) : (
                          <div className="avatar-placeholder avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', background: 'var(--primary)', color: 'white' }}>
                            {g.name?.[0]}
                          </div>
                        )}
                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {g.name}
                        </p>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {g.privacy === 'Public' ? <FiGlobe size={12} /> : <FiLock size={12} />} {g.privacy} · {g.members.length} members
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${isJoined ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          onClick={() => handleJoinToggle(g)}
                          id={`join-btn-${grpId}`}
                        >
                          {isJoined ? <><FiCheck size={14} /> Joined</> : 'Join Group'}
                        </button>
                        <button className="btn btn-secondary btn-sm">•••</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="story-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create Group</h3>
              <button className="icon-btn" onClick={() => setShowCreateModal(false)}><FiX size={18} /></button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input
                  id="group-name-input"
                  type="text"
                  className="form-input"
                  value={newGroupForm.name}
                  onChange={e => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  placeholder="Enter group name..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  value={newGroupForm.description}
                  onChange={e => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                  placeholder="Describe your group..."
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Privacy Option</label>
                <select
                  id="group-privacy-select"
                  className="form-input"
                  value={newGroupForm.privacy}
                  onChange={e => setNewGroupForm({ ...newGroupForm, privacy: e.target.value })}
                >
                  <option value="Public">🌐 Public (Anyone can see members & posts)</option>
                  <option value="Private">🔒 Private (Only members can see posts)</option>
                </select>
              </div>

              {/* Group Cover Selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <FiImage size={18} /> Choose Cover Image
                </label>
                <input
                  id="group-cover-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'cover')}
                  style={{ marginTop: '4px' }}
                />
                {coverPreview && (
                  <img src={coverPreview} alt="Cover Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '1px solid var(--border-light)' }} />
                )}
              </div>

              {/* Group Logo Selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <FiImage size={18} /> Choose Group Logo
                </label>
                <input
                  id="group-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'logo')}
                  style={{ marginTop: '4px' }}
                />
                {logoPreview && (
                  <img src={logoPreview} alt="Logo Preview" className="avatar avatar-md" style={{ marginTop: '8px', border: '1px solid var(--border-light)' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-group-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
