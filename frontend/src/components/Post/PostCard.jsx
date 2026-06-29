import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import {
  FiThumbsUp, FiMessageSquare, FiShare2, FiMoreHorizontal,
  FiBookmark, FiLink, FiFlag, FiEyeOff, FiEdit2, FiTrash2, FiX, FiSend, FiGlobe
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
    localLikes.includes(currentUser?.id || currentUser?._id) ? 'like' : null
  );
  
  // Menu and Edit States
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [postContent, setPostContent] = useState(post.content || '');

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const reactionTimer = useRef(null);
  const author = post.authorId || {};

  const handleReactionHover = () => {
    reactionTimer.current = setTimeout(() => setShowReactions(true), 600);
  };
  const handleReactionLeave = () => {
    clearTimeout(reactionTimer.current);
    setTimeout(() => setShowReactions(false), 300);
  };

  const handleReact = async (type) => {
    try {
      await postsAPI.reactToPost(post._id || post.id, type);
      if (userReaction === type) {
        setUserReaction(null);
        setLocalLikes(localLikes.filter(id => id !== (currentUser?.id || currentUser?._id)));
      } else {
        setUserReaction(type);
        if (!localLikes.includes(currentUser?.id || currentUser?._id)) {
          setLocalLikes([...localLikes, currentUser?.id || currentUser?._id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setShowReactions(false);
  };

  const handleQuickLike = async () => {
    try {
      await postsAPI.reactToPost(post._id || post.id, 'like');
      if (userReaction) {
        setUserReaction(null);
        setLocalLikes(localLikes.filter(id => id !== (currentUser?.id || currentUser?._id)));
      } else {
        setUserReaction('like');
        if (!localLikes.includes(currentUser?.id || currentUser?._id)) {
          setLocalLikes([...localLikes, currentUser?.id || currentUser?._id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await postsAPI.addComment(post._id || post.id, comment.trim());
      setLocalComments(res.post.comments || []);
      setComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('পোস্টটি ডিলিট করতে চান?')) return;
    try {
      const postId = post._id || post.id;
      await postsAPI.deletePost(postId);
      onDelete?.(postId);
    } catch (err) {
      console.error(err);
      alert('পোস্ট ডিলিট করা যায়নি।');
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await postsAPI.updatePost(post._id || post.id, { content: editContent.trim() });
      setPostContent(res.post.content || '');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('পোস্ট এডিট করা যায়নি।');
    }
  };

  const authorIdStr = author?._id || author?.id || '';
  const currentUserIdStr = currentUser?.id || currentUser?._id || '';
  const isOwner = authorIdStr && currentUserIdStr && authorIdStr.toString() === currentUserIdStr.toString();

  const currentReaction = userReaction ? REACTIONS.find(r => r.type === userReaction) : null;
  const totalReactionCount = localLikes.length;

  // Render text content and detect blue clickable links
  const renderPostText = (text) => {
    if (!text) return null;
    const parts = text.split(/(https?:\/\/[^\s]+)/gi);
    return parts.map((part, index) => {
      if (part.match(/https?:\/\/[^\s]+/i)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Extract YouTube ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Find first link in post to display rich preview cards
  const firstUrlMatch = postContent.match(/(https?:\/\/[^\s]+)/i);
  const firstUrl = firstUrlMatch ? firstUrlMatch[0] : null;
  const youtubeVideoId = firstUrl ? getYouTubeId(firstUrl) : null;

  return (
    <div className="post-card card animate-fadeIn" id={`post-${post._id || post.id}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-info" onClick={() => navigate(`/profile/${authorIdStr}`)}>
          {author?.avatar ? (
            <img src={author.avatar} alt={author?.fullName} className="avatar avatar-md" />
          ) : (
            <div className="avatar-placeholder avatar-md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: 'var(--primary)', color: 'white' }}>
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
          <button className="post-menu-btn" title="Bookmark"><FiBookmark size={18} /></button>
          <button
            className="post-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            id={`post-menu-${post._id || post.id}`}
          >
            <FiMoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="post-dropdown animate-scaleIn">
              {isOwner && (
                <>
                  <div className="post-dropdown-item" onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                    <FiEdit2 size={16} /> Edit post
                  </div>
                  <div className="post-dropdown-item danger" onClick={handleDeletePost}>
                    <FiTrash2 size={16} /> Delete post
                  </div>
                </>
              )}
              <div className="post-dropdown-item"><FiBookmark size={16} /> Save post</div>
              <div className="post-dropdown-item" onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${post._id || post.id}`); alert('Link copied!'); setShowMenu(false); }}><FiLink size={16} /> Copy link</div>
              <div className="post-dropdown-item"><FiFlag size={16} /> Report post</div>
              <div className="post-dropdown-item"><FiEyeOff size={16} /> Hide post</div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            className="form-input"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Save</button>
          </div>
        </div>
      ) : (
        <>
          {postContent && (
            <div
              className={`post-content ${post.bgColor ? 'post-content-bg' : ''}`}
              style={post.bgColor ? { background: post.bgColor } : {}}
            >
              <p className={`post-text ${post.bgColor ? 'post-text-centered' : ''}`}>
                {renderPostText(postContent)}
              </p>
            </div>
          )}

          {/* If there is no custom post image, but there is a YouTube or Generic Link preview card */}
          {!post.image && youtubeVideoId && (
            <div style={{ padding: '0 16px 12px 16px' }}>
              <div className="youtube-embed" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', background: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            </div>
          )}

          {!post.image && !youtubeVideoId && firstUrl && (
            <div style={{ padding: '0 16px 12px 16px' }}>
              <a
                href={firstUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-preview-card"
                style={{
                  display: 'flex',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  background: 'var(--bg-hover)',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary)' }}>Link Preview</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{new URL(firstUrl).hostname}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstUrl}</span>
                </div>
                <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white' }}>
                  <FiLink size={24} />
                </div>
              </a>
            </div>
          )}
        </>
      )}

      {post.image && (
        <div className="post-image-wrap">
          {post.image.match(/\.(mp4|mov|avi|mkv|webm|3gp)/i) ? (
            <video src={post.image} controls style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', background: '#000' }} />
          ) : (
            <img src={post.image} alt="post" className="post-image" />
          )}
        </div>
      )}

      {/* Reactions Summary */}
      <div className="post-stats">
        <div className="post-reactions-summary">
          {totalReactionCount > 0 && (
            <>
              <div className="reaction-icons-small">
                {userReaction && <span>{REACTIONS.find(r => r.type === userReaction)?.emoji}</span>}
                {!userReaction && <span>👍</span>}
              </div>
              <span className="post-stat-count">
                {localLikes.includes(currentUser?.id || currentUser?._id)
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
            id={`like-btn-${post._id || post.id}`}
          >
            {currentReaction ? (
              <><span style={{ fontSize: '1.1rem' }}>{currentReaction.emoji}</span> <span>{currentReaction.label}</span></>
            ) : (
              <><FiThumbsUp size={18} /> <span>Like</span></>
            )}
          </button>

          {showReactions && (
            <div className="reactions-container animate-scaleIn">
              {REACTIONS.map(reaction => (
                <button
                  key={reaction.type}
                  className="reaction-emoji-btn"
                  onClick={() => handleReact(reaction.type)}
                  title={reaction.label}
                  id={`react-${reaction.type}-${post._id || post.id}`}
                >
                  <span className="emoji-graphic">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="post-action-btn" onClick={() => setShowComments(!showComments)}>
          <FiMessageSquare size={18} />
          <span>Comment</span>
        </button>

        <button className="post-action-btn" onClick={() => { setShareCount(shareCount + 1); alert('Post shared successfully!'); }}>
          <FiShare2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-divider" />
          <div className="comments-list">
            {localComments.map(c => {
              const cAuthor = c.authorId || {};
              const cId = c._id || c.id;
              return (
                <div key={cId} className="comment-item">
                  {cAuthor.avatar ? (
                    <img src={cAuthor.avatar} alt="" className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar-placeholder avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                      {cAuthor.firstName?.[0]}{cAuthor.lastName?.[0]}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="comment-bubble">
                      <p className="comment-author">{cAuthor.fullName || 'User'}</p>
                      <p className="comment-text">{c.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleComment} className="comment-input-row" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              className="form-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ flex: 1, borderRadius: '20px', padding: '6px 14px' }}
            />
            <button type="submit" className="icon-btn" disabled={!comment.trim()} style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '50%' }}><FiSend size={16} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
