import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

interface ForumPost {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  timestamp: string;
  like_count: number;
  user_name?: string;
}

interface User {
  user_id: number;
  name: string;
}

const ForumPosts: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        adminAPI.getForumPosts(),
        adminAPI.getUsers(),
      ]);

      const postsWithUsers = (postsResponse.data || []).map((post: ForumPost) => ({
        ...post,
        user_name: usersResponse.data?.find((user: User) => user.user_id === post.user_id)?.name || `User ${post.user_id}`
      }));

      setPosts(postsWithUsers);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await adminAPI.deleteForumPost(postId);
        setPosts(posts.filter(post => post.post_id !== postId));
        alert("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesUser = filterUser ? post.user_id === filterUser : true;
    const matchesSearch = searchTerm 
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesUser && matchesSearch;
  });

  const getUserName = (userId: number) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.name : `User ${userId}`;
  };

  if (loading) {
    return <div className="loading">Loading forum posts...</div>;
  }

  return (
    <div>
      <header className="page-header">
        <h1>💬 Forum Posts</h1>
        <p>Manage community forum posts and discussions</p>
      </header>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="userFilter">Filter by User:</label>
          <select
            id="userFilter"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <label htmlFor="searchPosts">Search Posts:</label>
          <input
            id="searchPosts"
            type="text"
            placeholder="Search by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="posts-stats">
          <span>Total Posts: {posts.length}</span>
          {filterUser && <span>Filtered: {filteredPosts.length}</span>}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Post ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Likes</th>
              <th>Date</th>
              <th>Content Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  No forum posts found
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.post_id}>
                  <td>#{post.post_id}</td>
                  <td>
                    <strong>{post.title}</strong>
                  </td>
                  <td>
                    <span className="user-badge">
                      {getUserName(post.user_id)}
                    </span>
                  </td>
                  <td>
                    <span className="likes-count">
                      ❤️ {post.like_count}
                    </span>
                  </td>
                  <td>{formatDate(post.timestamp)}</td>
                  <td>
                    <div className="content-preview">
                      {post.content.length > 100 
                        ? `${post.content.substring(0, 100)}...` 
                        : post.content
                      }
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          // View post details - you can implement a modal for this
                          alert(`Post Content:\n\n${post.content}`);
                        }}
                        className="btn-view"
                        title="View Post"
                      >
                        👁️ View
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.post_id)}
                        className="btn-delete"
                        title="Delete Post"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForumPosts;