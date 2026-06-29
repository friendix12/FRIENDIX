import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { FiUsers, FiGlobe, FiLock, FiX, FiCheck, FiImage } from 'react-icons/fi';

const INITIAL_GROUPS = [
  { id: 'g1', name: 'Bangladesh Photography', members: 12400, img: 'https://picsum.photos/seed/grp1/300/150', logo: 'https://picsum.photos/seed/logo1/50/50', privacy: 'Public', joined: false },
  { id: 'g2', name: 'Tech Bangladesh', members: 45000, img: 'https://picsum.photos/seed/grp2/300/150', logo: 'https://picsum.photos/seed/logo2/50/50', privacy: 'Public', joined: false },
  { id: 'g3', name: 'Cooking Recipes BD', members: 8700, img: 'https://picsum.photos/seed/grp3/300/150', logo: 'https://picsum.photos/seed/logo3/50/50', privacy: 'Private', joined: false },
  { id: 'g4', name: 'Wanderlust Travelers', members: 32000, img: 'https://picsum.photos/seed/grp4/300/150', logo: 'https://picsum.photos/seed/logo4/50/50', privacy: 'Public', joined: false },
  { id: 'g5', name: 'Startup Bangladesh', members: 18000, img: 'https://picsum.photos/seed/grp5/300/150', logo: 'https://picsum.photos/seed/logo5/50/50', privacy: 'Public', joined: false },
  { id: 'g6', name: 'Book Club Members', members: 6200, img: 'https://picsum.photos/seed/grp6/300/150', logo: 'https://picsum.photos/seed/logo6/50/50', privacy: 'Private', joined: false },
];

const GroupsPage = () => {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // File inputs state
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    privacy: 'Public'
  });

  const handleJoinToggle = (groupId) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          joined: !g.joined,
          members: g.joined ? g.members - 1 : g.members + 1
        };
      }
      return g;
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'cover') setCoverPreview(url);
      if (type === 'logo') setLogoPreview(url);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;

    const newGroup = {
      id: `g_${Date.now()}`,
      name: newGroupForm.name.trim(),
      members: 1,
      img: coverPreview || 'https://picsum.photos/seed/default/300/150',
      logo: logoPreview || 'https://picsum.photos/seed/logo/50/50',
      privacy: newGroupForm.privacy,
      joined: true
    };

    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
    setNewGroupForm({ name: '', privacy: 'Public' });
    setCoverPreview(null);
    setLogoPreview(null);
  };

  const formatMembers = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {groups.map(g => (
              <div
                key={g.id}
                className="card"
                style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                id={`group-card-${g.id}`}
              >
                <img src={g.img} alt={g.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{ padding: '12px' }}>
                  {/* Logo and Name inline */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <img src={g.logo} alt="" className="avatar avatar-sm" style={{ border: '1px solid var(--border-light)', flexShrink: 0 }} />
                    <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.name}
                    </p>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {g.privacy === 'Public' ? <FiGlobe size={12} /> : <FiLock size={12} />} {g.privacy} · {formatMembers(g.members)} members
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`btn btn-sm ${g.joined ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => handleJoinToggle(g.id)}
                      id={`join-btn-${g.id}`}
                    >
                      {g.joined ? <><FiCheck size={14} /> Joined</> : 'Join Group'}
                    </button>
                    <button className="btn btn-secondary btn-sm">•••</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <FiImage size={18} /> Choose Cover Image (Gallery)
                </label>
                <input
                  id="group-cover-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'cover')}
                  style={{ marginTop: '4px' }}
                  required
                />
                {coverPreview && (
                  <img src={coverPreview} alt="Cover Preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '1px solid var(--border-light)' }} />
                )}
              </div>

              {/* Group Logo Selection */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <FiImage size={18} /> Choose Group Logo (Gallery)
                </label>
                <input
                  id="group-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'logo')}
                  style={{ marginTop: '4px' }}
                  required
                />
                {logoPreview && (
                  <img src={logoPreview} alt="Logo Preview" className="avatar avatar-md" style={{ marginTop: '8px', border: '1px solid var(--border-light)' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-group-btn">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
