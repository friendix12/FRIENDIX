import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import {
  FiThumbsUp, FiMessageSquare, FiShare2, FiMoreHorizontal,
  FiBookmark, FiLink, FiFlag, FiEyeOff, FiEdit2, FiTrash2, FiX, FiSend, FiGlobe,
  FiCopy
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
  const [localReactions, setLocalReactions] = useState(post.reactions || { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
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
  const [copied, setCopied] = useState(false);
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
        setLocalReactions(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
      } else {
        if (userReaction) {
          setLocalReactions(prev => ({ ...prev, [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1) }));
        }
        setUserReaction(type);
        setLocalReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
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
    const type = 'like';
    try {
      await postsAPI.reactToPost(post._id || post.id, type);
      if (userReaction) {
        setLocalReactions(prev => ({ ...prev, [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1) }));
        setUserReaction(null);
        setLocalLikes(localLikes.filter(id => id !== (currentUser?.id || currentUser?._id)));
      } else {
        setUserReaction(type);
        setLocalReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
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
  const totalReactionCount = Object.values(localReactions).reduce((a, b) => a + b, 0);

  const getTopReactions = () => {
    const sorted = REACTIONS
      .filter(r => localReactions[r.type] > 0)
      .sort((a, b) => (localReactions[b.type] || 0) - (localReactions[a.type] || 0));
    return sorted.slice(0, 3);
  };

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
                {getTopReactions().map(r => (
                  <span key={r.type} style={{ fontSize: '1rem', marginLeft: '-2px' }}>{r.emoji}</span>
                ))}
              </div>
              <span className="post-stat-count">
                {localLikes.includes(currentUser?.id || currentUser?._id)
                  ? totalReactionCount > 1 ? `You and ${totalReactionCount - 1} others` : 'You'
                  : totalReactionCount > 0 ? totalReactionCount : ''}
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

        <button className="post-action-btn" onClick={() => setShowShareModal(true)}>
          <FiShare2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => { setShowShareModal(false); setCopied(false); }}>
          <div className="modal share-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Share to</h3>
              <button className="modal-close" onClick={() => { setShowShareModal(false); setCopied(false); }}><FiX size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: '8px 0' }}>
              <div className="share-option-item" onClick={() => {
                const url = window.location.origin + '/post/' + (post._id || post.id);
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}>
                <div className="share-option-icon" style={{ background: 'var(--bg-hover)' }}><FiCopy size={20} /></div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Copy link</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{copied ? 'Link copied!' : 'Copy the post link to clipboard'}</p>
                </div>
              </div>
              <div className="share-option-item" onClick={() => {
                const url = encodeURIComponent(window.location.origin + '/post/' + (post._id || post.id));
                window.open(`https://api.whatsapp.com/send?text=${url}`, '_blank');
                setShareCount(shareCount + 1);
                setShowShareModal(false);
              }}>
                <div className="share-option-icon" style={{ background: '#25D366' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>WhatsApp</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Share via WhatsApp</p>
                </div>
              </div>
              <div className="share-option-item" onClick={() => {
                const url = encodeURIComponent(window.location.origin + '/post/' + (post._id || post.id));
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                setShareCount(shareCount + 1);
                setShowShareModal(false);
              }}>
                <div className="share-option-icon" style={{ background: '#1877F2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Facebook</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Share on your timeline</p>
                </div>
              </div>
              <div className="share-option-item" onClick={() => {
                const url = encodeURIComponent(window.location.origin + '/post/' + (post._id || post.id));
                const text = encodeURIComponent('Check this out!');
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                setShareCount(shareCount + 1);
                setShowShareModal(false);
              }}>
                <div className="share-option-icon" style={{ background: '#000' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>X (Twitter)</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Share on X</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
