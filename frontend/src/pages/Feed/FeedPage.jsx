import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/Sidebar/LeftSidebar';
import RightSidebar from '../../components/Sidebar/RightSidebar';
import Stories from '../../components/Stories/Stories';
import CreatePost from '../../components/Post/CreatePost';
import PostCard from '../../components/Post/PostCard';
import { postsAPI } from '../../services/api';
import './FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getFeed();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching feed posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => (p._id || p.id) !== postId));
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  return (
    <div className="app-layout">
      <Navbar activePage="home" />

      <div className="feed-layout">
        <LeftSidebar />

        <main className="feed-main" id="feed-main">
          <Stories />
          <CreatePost onPost={handleNewPost} />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Loading posts...
            </div>
          ) : (
            <div className="posts-feed" id="posts-feed">
              {posts.map(post => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onDelete={handleDeletePost}
                />
              ))}
              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No posts to display. Be the first to share something!
                </div>
              )}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
};

export default FeedPage;
