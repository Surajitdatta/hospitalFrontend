import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = "https://hospitalbackend-eight.vercel.app";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', msg: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null); // State for the selected contact
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    fetchContacts();
  }, []);

  const checkAdmin = async () => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) return navigate('/admin');
    try {
      const res = await fetch(`${baseUrl}/api/admin`);
      const admins = await res.json();
      const storedAdmin = JSON.parse(adminData);
      const admin = admins.find(a => a.username === storedAdmin.username && a.password === storedAdmin.password);
      if (!admin) navigate('/admin');
    } catch (err) {
      navigate('/admin');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/contact`);
      const data = await res.json();
      setContacts(data.reverse());
      setFilteredContacts(data.reverse());
    } catch (err) {
      toast.error('Failed to fetch contacts.');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success('Contact added!');
      setFormData({ name: '', email: '', subject: '', msg: '' });
      fetchContacts();
    } catch (err) {
      toast.error('Failed to add contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/contact/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete contact');
      }
      toast.success('Contact deleted!');
      setContacts(prev => prev.filter(contact => contact._id !== id));
      setFilteredContacts(prev => prev.filter(contact => contact._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete contact.');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Management</h2>

      <form className="contact-form" onSubmit={handleAddContact}>
        <h3>Add New Contact</h3>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
        <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} required />
        <textarea name="msg" placeholder="Message" value={formData.msg} onChange={handleInputChange} required></textarea>
        <button type="submit">Add Contact</button>
      </form>

      {/* 🔍 Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="contact-list">
        <h3>Contact Messages</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.subject}</td>
                  <td style={{ maxWidth: '250px', overflowWrap: 'break-word' }}>{contact.msg}</td>
                  <td>{new Date(contact.date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewContact(contact)}>View</button>
                      <button className="delete-btn" onClick={() => handleDeleteContact(contact._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6">No contacts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing contact */}
      {isModalOpen && selectedContact && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>X</span>
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> {selectedContact.name}</p>
            <p><strong>Email:</strong> {selectedContact.email}</p>
            <p><strong>Subject:</strong> {selectedContact.subject}</p>
            <p><strong>Message:</strong> {selectedContact.msg}</p>
            <p><strong>Date:</strong> {new Date(selectedContact.date).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Contact;
