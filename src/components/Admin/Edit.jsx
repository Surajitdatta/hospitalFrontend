import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Edit.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Edit = () => {
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const baseUrl = "https://hospitalbackend-eight.vercel.app";
  const navigate = useNavigate(); // initialize navigate

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const parsedAdmin = JSON.parse(adminData);
      setCurrentUsername(parsedAdmin.username || "");
      setCurrentPassword(parsedAdmin.password || "");
    }
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!currentUsername || !currentPassword || !newUsername || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and Confirm password do not match!");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/admin`);
      const admins = await res.json();
      const admin = admins.find(item => item.username === currentUsername && item.password === currentPassword);

      if (!admin) {
        toast.error("Current username or password is wrong! Please try again.");
        return;
      }

      const updateRes = await fetch(`${baseUrl}/api/admin/${admin._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update admin data!");
      }

      toast.success("Admin credentials updated successfully!");

      localStorage.setItem('admin', JSON.stringify({
        id: admin._id,
        username: newUsername,
        password: newPassword,
      }));

      setCurrentUsername(newUsername);
      setCurrentPassword(newPassword);
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");

      // move to home after 2 sec
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong! Try again.");
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-box">
        <h2 className="edit-title">Edit Admin Credentials</h2>
        <form className="edit-form" onSubmit={handleEdit}>

          <div className="form-group">
            <label htmlFor="currentUsername">Current Username</label>
            <input
              type="text"
              id="currentUsername"
              placeholder="Enter current username"
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newUsername">New Username</label>
            <input
              type="text"
              id="newUsername"
              placeholder="Enter new username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="edit-btn">
            Update Credentials
          </button>

        </form>
      </div>

      {/* Toast Container for toasts */}
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Edit;
