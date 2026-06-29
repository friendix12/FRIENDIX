import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers, formatTime } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  FiThumbsUp, FiMessageSquare, FiShare2, FiMoreHorizontal,
  FiBookmark, FiLink, FiFlag, FiEyeOff, FiEdit2, FiTrash2, FiX, FiSend
} from 'react-icons/fi';
import './PostCard.css';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like', color: '#1877F2' },
  { type: 'love', emoji: '❤️', label: 'Love', color: '#F33E58' },
  { type: 'care', emoji: '🤗', label: 'Care', color: '#F7B125' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: '#F7B125' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: '#F7B125' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#F7B125' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: '#E9710F' },
];

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const [userReaction, setUserReaction] = useState(
    localLikes.includes(currentUser?.id) ? 'like' : null
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const reactionTimer = useRef(null);
  const author = mockUsers.find(u => u.id === post.authorId);

  const handleReactionHover = () => {
    reactionTimer.current = setTimeout(() => setShowReactions(true), 600);
  };
  const handleReactionLeave = () => {
    clearTimeout(reactionTimer.current);
    setTimeout(() => setShowReactions(false), 300);
  };

  const handleReact = (type) => {
    if (userReaction === type) {
      setUserReaction(null);
      setLocalLikes(localLikes.filter(id => id !== currentUser?.id));
    } else {
      setUserReaction(type);
      if (!localLikes.includes(currentUser?.id)) setLocalLikes([...localLikes, currentUser?.id]);
    }
    setShowReactions(false);
  };

  const handleQuickLike = () => {
    if (userReaction) {
      setUserReaction(null);
      setLocalLikes(localLikes.filter(id => id !== currentUser?.id));
    } else {
      setUserReaction('like');
      if (!localLikes.includes(currentUser?.id)) setLocalLikes([...localLikes, currentUser?.id]);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = {
      id: `c${Date.now()}`,
      authorId: currentUser?.id,
      content: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalComments([...localComments, newComment]);
    setComment('');
  };

  const currentReaction = userReaction ? REACTIONS.find(r => r.type === userReaction) : null;

  const totalReactionCount = localLikes.length +
    Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="post-card card animate-fadeIn" id={`post-${post.id}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-info" onClick={() => navigate(`/profile/${author?.id}`)}>
          {author?.avatar ? (
            <img src={author.avatar} alt={author?.fullName} className="avatar avatar-md" />
          ) : (
            <div className="avatar-placeholder avatar-md">
              {author?.firstName?.[0]}{author?.lastName?.[0]}
            </div>
          )}
          <div>
            <p className="post-author-name">{author?.fullName}</p>
            <div className="post-meta">
              {post.feeling && <span className="post-feeling">{post.feeling} · </span>}
              <span>{formatTime(post.createdAt)}</span>
              <span className="post-privacy">· 🌐</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button className="post-menu-btn"><FiBookmark size={18} /></button>
          <button
            className="post-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            id={`post-menu-${post.id}`}
          >
            <FiMoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="post-dropdown animate-scaleIn">
              {post.authorId === currentUser?.id && (
                <>
                  <div className="post-dropdown-item">
                    <FiEdit2 size={16} /> Edit post
                  </div>
                  <div className="post-dropdown-item danger" onClick={() => { onDelete?.(post.id); setShowMenu(false); }}>
                    <FiTrash2 size={16} /> Delete post
                  </div>
                </>
              )}
              <div className="post-dropdown-item"><FiBookmark size={16} /> Save post</div>
              <div className="post-dropdown-item"><FiLink size={16} /> Copy link</div>
              <div className="post-dropdown-item"><FiFlag size={16} /> Report post</div>
              <div className="post-dropdown-item"><FiEyeOff size={16} /> Hide post</div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <div
          className={`post-content ${post.bgColor ? 'post-content-bg' : ''}`}
          style={post.bgColor ? { background: post.bgColor } : {}}
        >
          <p className={`post-text ${post.bgColor ? 'post-text-centered' : ''}`}>
            {post.content}
          </p>
        </div>
      )}

      {post.image && (
        <div className="post-image-wrap">
          <img src={post.image} alt="post" className="post-image" />
        </div>
      )}

      {/* Reactions Summary */}
      <div className="post-stats">
        <div className="post-reactions-summary">
          {(totalReactionCount > 0 || localLikes.length > 0) && (
            <>
              <div className="reaction-icons-small">
                {userReaction && <span>{REACTIONS.find(r => r.type === userReaction)?.emoji}</span>}
                {!userReaction && localLikes.length > 0 && <span>👍</span>}
                {(post.reactions?.love || 0) > 0 && <span>❤️</span>}
                {(post.reactions?.haha || 0) > 0 && <span>😂</span>}
              </div>
              <span className="post-stat-count">
                {localLikes.includes(currentUser?.id)
                  ? localLikes.length > 1 ? `You and ${localLikes.length - 1} others` : 'You'
                  : localLikes.length > 0 ? localLikes.length : ''}
              </span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="post-stat-btn" onClick={() => setShowComments(!showComments)}>
            {localComments.length} comments
          </button>
          <button className="post-stat-btn" onClick={() => setShowShareModal(true)}>
            {shareCount} shares
          </button>
        </div>
      </div>

      <div className="post-divider" />

      {/* Action Buttons */}
      <div className="post-actions">
        <div
          className="reaction-wrap"
          onMouseEnter={handleReactionHover}
          onMouseLeave={handleReactionLeave}
        >
          <button
            className={`post-action-btn ${userReaction ? 'reacted' : ''}`}
            style={currentReaction ? { color: currentReaction.color } : {}}
            onClick={handleQuickLike}
            id={`like-btn-${post.id}`}
          >
            {currentReaction ? (
              <><span style={{ fontSize: '1.1rem' }}>{currentReaction.emoji}</span> <span>{currentReaction.label}</span></>
            ) : (
              <><FiThumbsUp size={18} /> <span>Like</span></>
            )}
          </button>

          {showReactions && (
            <div className="reactions-popup animate-scaleIn">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  className={`reaction-btn ${userReaction === r.type ? 'selected' : ''}`}
                  title={r.label}
                  onClick={() => handleReact(r.type)}
                >
                  <span className="reaction-emoji">{r.emoji}</span>
                  <span className="reaction-label">{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          id={`comment-btn-${post.id}`}
        >
          <FiMessageSquare size={18} /> <span>Comment</span>
        </button>

        <button className="post-action-btn" onClick={() => setShowShareModal(true)} id={`share-btn-${post.id}`}>
          <FiShare2 size={18} /> <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <div className="post-divider" />
          <div className="comment-input-row">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="avatar avatar-sm" />
            ) : (
              <div className="avatar-placeholder avatar-sm">{currentUser?.firstName?.[0]}</div>
            )}
            <form onSubmit={handleComment} className="comment-form">
              <input
                type="text"
                className="comment-input"
                placeholder="Write a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                id={`comment-input-${post.id}`}
              />
              <button type="submit" className="comment-submit" disabled={!comment.trim()}>
                <FiSend size={14} />
              </button>
            </form>
          </div>

          <div className="comments-list">
            {localComments.map(c => {
              const cAuthor = mockUsers.find(u => u.id === c.authorId) || currentUser;
              return (
                <div key={c.id} className="comment-item animate-fadeIn">
                  {cAuthor?.avatar ? (
                    <img src={cAuthor.avatar} alt="" className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder avatar-sm">{cAuthor?.firstName?.[0]}</div>
                  )}
                  <div>
                    <div className="comment-bubble">
                      <p className="comment-author">{cAuthor?.fullName || 'User'}</p>
                      <p className="comment-text">{c.content}</p>
                    </div>
                    <div className="comment-actions">
                      <button className="comment-action">Like</button>
                      <button className="comment-action">Reply</button>
                      <span className="comment-time">{formatTime(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Share post</h3>
              <button className="modal-close" onClick={() => setShowShareModal(false)}><FiX size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '📝', label: 'Share now (Friends)' },
                  { icon: '📋', label: 'Share to your timeline' },
                  { icon: '💬', label: 'Send in Messenger' },
                  { icon: '👥', label: 'Share to a Group' },
                ].map(item => (
                  <button
                    key={item.label}
                    className="dropdown-item"
                    onClick={() => { setShareCount(shareCount + 1); setShowShareModal(false); }}
                  >
                    <div className="icon">{item.icon}</div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
