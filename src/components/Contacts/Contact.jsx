import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = "https://hospitalbackend-eight.vercel.app";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', msg: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchContacts();
    };
    loadData();
  }, []);

  const checkAdmin = async () => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      setAdminLoading(false);
      navigate('/admin');
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/admin`);
      if (!res.ok) throw new Error('Failed to verify admin');
      const admins = await res.json();
      const storedAdmin = JSON.parse(adminData);
      const admin = admins.find(a => a.username === storedAdmin.username && a.password === storedAdmin.password);
      
      if (!admin) {
        localStorage.removeItem('admin');
        navigate('/admin');
      }
    } catch (err) {
      setAdminError(err.message);
      navigate('/admin');
    } finally {
      setAdminLoading(false);
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
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedContact(null);
  };

  if (adminLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (adminError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {adminError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/admin')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
        Contact Management
      </Typography>

      <Grid container spacing={4}>
        {/* Add Contact Form */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AddIcon sx={{ mr: 1 }} /> Add New Contact
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="form" onSubmit={handleAddContact}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Message"
                  name="msg"
                  value={formData.msg}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                >
                  Add Contact
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact List */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Contact Messages</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by Name..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>

            <TableContainer sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact._id} hover>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.subject}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.msg}
                        </TableCell>
                        <TableCell>
                          {new Date(contact.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewContact(contact)}
                            aria-label="view"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteContact(contact._id)}
                            aria-label="delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Contact Details
          <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedContact && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Name:</strong> {selectedContact.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Email:</strong> {selectedContact.email}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Subject:</strong> {selectedContact.subject}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date:</strong> {new Date(selectedContact.date).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                <strong>Message:</strong>
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography>{selectedContact.msg}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-center" autoClose={2000} />
    </Container>
  );
};

export default Contact;