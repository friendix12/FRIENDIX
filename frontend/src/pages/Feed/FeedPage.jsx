import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/Sidebar/LeftSidebar';
import RightSidebar from '../../components/Sidebar/RightSidebar';
import Stories from '../../components/Stories/Stories';
import CreatePost from '../../components/Post/CreatePost';
import PostCard from '../../components/Post/PostCard';
import { mockPosts } from '../../data/mockData';
import './FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([...mockPosts].reverse());

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <div className="app-layout">
      <Navbar activePage="home" />

      <div className="feed-layout">
        <LeftSidebar />

        <main className="feed-main" id="feed-main">
          <Stories />
          <CreatePost onPost={handleNewPost} />
          <div className="posts-feed" id="posts-feed">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
};

export default FeedPage;
