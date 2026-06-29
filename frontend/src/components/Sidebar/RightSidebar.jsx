import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import './Sidebar.css';

const RightSidebar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const contacts = currentUser?.friends || [];

  return (
    <aside className="right-sidebar" id="right-sidebar">
      {/* Sponsored */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title" style={{ marginBottom: '10px' }}>Sponsored</h3>
        <div className="ad-card">
          <img
            src="https://picsum.photos/seed/ad1/260/140"
            alt="Sponsored"
            style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
          />
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-primary)' }}>FRIENDIX Premium</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>friendix.com</p>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }} />

      {/* Contacts */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h3 className="sidebar-section-title">Contacts</h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="sidebar-icon-btn"><FiSearch size={16} /></button>
            <button className="sidebar-icon-btn"><FiMoreHorizontal size={16} /></button>
          </div>
        </div>

        <div className="contacts-list">
          {contacts.map((user) => {
            const userId = user._id || user.id;
            return (
              <div
                key={userId}
                className="contact-item"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="avatar avatar-md" />
                  ) : (
                    <div className="avatar-placeholder avatar-md">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  )}
                  <span className="online-dot" />
                </div>
                <span className="contact-name">{user.fullName}</span>
              </div>
            );
          })}
          {contacts.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
              No active contacts. Add friends to chat!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
