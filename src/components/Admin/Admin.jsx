import React, { useState } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import useApi from '../Api/useApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // import CSS

const Admin = () => {
  const { data, loading, error } = useApi("/api/admin");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Fields cannot be empty!");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("Admin data not loaded!");
      return;
    }

    const adminUser = data.find((admin) => admin.username === username && admin.password === password);

    if (adminUser) {
      localStorage.setItem('admin', JSON.stringify({
        id: adminUser._id,
        username: adminUser.username,
        password: adminUser.password,
      }));

      toast.success("Login Successful!");

      setTimeout(() => {
        navigate('/');
      }, 1500); // Navigate after 1.5 seconds so user can see toast
    } else {
      toast.error("Invalid Username or Password!");
    }
  };

  const handleEditClick = () => {
    navigate('/admin/edit');
  };

  if (loading) return <p>Loading admin data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h2 className="admin-title">Admin Login</h2>

        <form className="admin-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter admin username" 
              value={username} 
              onChange={(e) => setUserName(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" className="admin-btn">Login</button>
        </form>

        <div className="edit-password-box">
          <p className="edit-label">Need to change your password?</p>
          <button className="edit-btn" onClick={handleEditClick}>Edit Password</button>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={2000} // 2 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default Admin;
