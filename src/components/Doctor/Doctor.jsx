import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FiEdit2, FiTrash2, FiEye, FiX, FiPlus, FiUpload } from "react-icons/fi";
import "./doctor.css";

const baseURL = "https://hospitalbackend-eight.vercel.app/api/doctor";

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    doctor_id: "",
    qualification: "",
    experience: "",
    language: "",
    availability: "",
    bio: "",
    doctorPhoto: null,
  });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(baseURL);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch doctors!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "doctorPhoto") {
      setFormData({ ...formData, doctorPhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingDoctor) {
        await axios.put(`${baseURL}/${editingDoctor._id}`, data);
        toast.success("Doctor updated successfully!");
      } else {
        await axios.post(baseURL, data);
        toast.success("Doctor added successfully!");
      }
      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      doctor_id: "",
      qualification: "",
      experience: "",
      language: "",
      availability: "",
      bio: "",
      doctorPhoto: null,
    });
    setEditingDoctor(null);
    setIsFormOpen(false);
  };

  const handleEdit = (doc) => {
    setFormData({
      name: doc.name,
      doctor_id: doc.doctor_id,
      qualification: doc.qualification,
      experience: doc.experience,
      language: doc.language,
      availability: doc.availability,
      bio: doc.bio,
      doctorPhoto: null,
    });
    setEditingDoctor(doc);
    setIsFormOpen(true);
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doc.name}?`)) return;
    try {
      await axios.delete(`${baseURL}/${doc._id}`);
      toast.success("Doctor deleted successfully!");
      fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete doctor!");
    }
  };

  const handleView = (doc) => {
    setViewingDoctor(doc);
  };

  const handleCloseView = () => setViewingDoctor(null);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.doctor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="doctor-container">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      <div className="header-section">
        <h1 className="doctor-title">Doctor Management</h1>
        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="add-doctor-btn"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
          >
            <FiPlus /> Add Doctor
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>
              <button onClick={resetForm} className="close-form-btn">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Doctor ID</label>
                  <input
                    type="text"
                    name="doctor_id"
                    placeholder="DOC-12345"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="MD, MBBS, etc."
                    value={formData.qualification}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    placeholder="5 years"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Languages</label>
                  <input
                    type="text"
                    name="language"
                    placeholder="English, Spanish, etc."
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    placeholder="Mon-Fri, 9am-5pm"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    placeholder="Brief professional bio..."
                    rows="4"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="file-upload-label">
                    <FiUpload /> {formData.doctorPhoto ? formData.doctorPhoto.name : "Upload Photo"}
                    <input
                      type="file"
                      name="doctorPhoto"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="file-upload-input"
                    />
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : editingDoctor
                    ? "Update Doctor"
                    : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="doctor-list">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div className="card-image-container">
                {doc.doctorPhoto ? (
                  <img
                    src={doc.doctorPhoto}
                    alt={doc.name}
                    className="doctor-photo"
                  />
                ) : (
                  <div className="photo-placeholder">
                    {doc.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="card-badge">{doc.experience}</div>
              </div>
              
              <div className="card-content">
                <h3 className="doctor-name">{doc.name}</h3>
                <p className="doctor-id">ID: {doc.doctor_id}</p>
                
                <div className="doctor-meta">
                  <span className="meta-item">
                    <strong>Qualification:</strong> {doc.qualification}
                  </span>
                  <span className="meta-item">
                    <strong>Speaks:</strong> {doc.language}
                  </span>
                </div>
                
                <p className="availability">
                  <strong>Available:</strong> {doc.availability}
                </p>
                
                <div className="card-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleView(doc)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(doc)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? (
              <p>No doctors found matching your search.</p>
            ) : (
              <p>No doctors available. Add a new doctor to get started.</p>
            )}
          </div>
        )}
      </div>

      {viewingDoctor && (
        <div className="view-modal">
          <div className="view-modal-content">
            <button className="close-modal-btn" onClick={handleCloseView}>
              <FiX />
            </button>
            
            <div className="doctor-profile">
              <div className="profile-image-container">
                {viewingDoctor.doctorPhoto ? (
                  <img
                    src={viewingDoctor.doctorPhoto}
                    alt={viewingDoctor.name}
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-placeholder">
                    {viewingDoctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              
              <div className="profile-details">
                <h2>{viewingDoctor.name}</h2>
                <p className="profile-id">ID: {viewingDoctor.doctor_id}</p>
                
                <div className="detail-section">
                  <h3>Professional Information</h3>
                  <p><strong>Qualification:</strong> {viewingDoctor.qualification}</p>
                  <p><strong>Experience:</strong> {viewingDoctor.experience}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Availability</h3>
                  <p>{viewingDoctor.availability}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Languages Spoken</h3>
                  <p>{viewingDoctor.language}</p>
                </div>
                
                <div className="detail-section">
                  <h3>About</h3>
                  <p className="profile-bio">{viewingDoctor.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctor;