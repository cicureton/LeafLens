import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

interface User {
  user_id: number;
  name: string;
  email: string;
  user_type: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    email: "", 
    user_type: "",
    password_hash: "temporary_password_123" // Keep the temporary password for backend compatibility
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(user => user.user_id !== userId));
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      password_hash: "temporary_password_123" // Use temporary password for updates
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Send all required fields including the temporary password
      const updatePayload = {
        name: editForm.name,
        email: editForm.email,
        user_type: editForm.user_type,
        password_hash: editForm.password_hash
      };

      console.log("Sending update payload:", updatePayload);

      await adminAPI.updateUser(editingUser.user_id, updatePayload);
      
      // Update local state (don't include password in the UI)
      setUsers(users.map(user => 
        user.user_id === editingUser.user_id 
          ? { 
              ...user, 
              name: editForm.name, 
              email: editForm.email, 
              user_type: editForm.user_type 
            }
          : user
      ));
      setEditingUser(null);
      alert("User updated successfully");
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(`Error updating user: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "", user_type: "", password_hash: "temporary_password_123" });
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div>
      <header className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage user accounts and roles</p>
      </header>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User #{editingUser.user_id}</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={editForm.user_type}
                  onChange={(e) => setEditForm({...editForm, user_type: e.target.value})}
                  required
                >
                  <option value="user">User</option>
                  <option value="farmer">Farmer</option>
                  <option value="gardener">Gardener</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update User</button>
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.user_type}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="btn-edit"
                        title="Edit User"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="btn-delete"
                        title="Delete User"
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

export default Users;