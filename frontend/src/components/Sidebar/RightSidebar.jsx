import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import './Sidebar.css';

const RightSidebar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const contacts = mockUsers.filter(u => u.id !== currentUser?.id);
  const birthdayUser = mockUsers.find(u => u.id === '4');

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

      {/* Birthdays */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title" style={{ marginBottom: '10px' }}>Birthdays</h3>
        <div className="birthday-card">
          <span style={{ fontSize: '1.4rem' }}>🎂</span>
          <p style={{ fontSize: '0.87rem', color: 'var(--text-primary)', flex: 1 }}>
            <span style={{ fontWeight: 700 }}>{birthdayUser?.fullName}</span> has a birthday today.{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
              Send wishes!
            </span>
          </p>
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
          {contacts.map((user, i) => (
            <div
              key={user.id}
              className="contact-item"
              onClick={() => navigate('/messenger')}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={user.avatar} alt={user.fullName} className="avatar avatar-md" />
                {i < 3 && <span className="online-dot" />}
              </div>
              <span className="contact-name">{user.fullName}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
