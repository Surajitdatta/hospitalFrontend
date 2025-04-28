import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API_URL = 'https://hospitalbackend-eight.vercel.app/api/jobs';
const ADMIN_API_URL = 'https://hospitalbackend-eight.vercel.app/api/admin';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    lastDate: null
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    department: false,
    lastDate: false
  });

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Emergency',
    'Surgery',
    'Oncology',
    'Dermatology',
    'Psychiatry'
  ];

  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchJobs();
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
      const res = await axios.get(ADMIN_API_URL);
      const admins = res.data;
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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showSnackbar('Failed to fetch jobs', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFormErrors({
      ...formErrors,
      [name]: false
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      lastDate: date
    });
    setFormErrors({
      ...formErrors,
      lastDate: false
    });
  };

  const validateForm = () => {
    const errors = {
      title: !formData.title,
      description: !formData.description,
      department: !formData.department,
      lastDate: !formData.lastDate
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      department: '',
      lastDate: null
    });
    setFormErrors({
      title: false,
      description: false,
      department: false,
      lastDate: false
    });
  };

  const handleOpenAdd = () => {
    setCurrentJob(null);
    resetForm();
    setOpenForm(true);
  };

  const handleOpenEdit = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      department: job.department,
      lastDate: new Date(job.lastDate)
    });
    setOpenForm(true);
  };

  const handleOpenView = (job) => {
    setCurrentJob(job);
    setOpenView(true);
  };

  const handleOpenDelete = (job) => {
    setCurrentJob(job);
    setOpenDelete(true);
  };

  const handleClose = () => {
    setOpenForm(false);
    setOpenView(false);
    setOpenDelete(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (currentJob) {
        await axios.put(`${API_URL}/${currentJob._id}`, formData);
        showSnackbar('Job updated successfully');
      } else {
        await axios.post(API_URL, formData);
        showSnackbar('Job created successfully');
      }
      fetchJobs();
      handleClose();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${currentJob._id}`);
      showSnackbar('Job deleted successfully');
      fetchJobs();
      handleClose();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (adminLoading) {
    return (
      <Container maxWidth="lg" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (adminError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {adminError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/admin')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">Loading jobs...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Job Openings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Add Job
          </Button>
        </Box>

        {jobs.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No job openings available at the moment.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Department: {job.department}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {job.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posted: {formatDate(job.postedOn)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Deadline: {formatDate(job.lastDate)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      aria-label="view"
                      color="primary"
                      onClick={() => handleOpenView(job)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      aria-label="edit"
                      color="secondary"
                      onClick={() => handleOpenEdit(job)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleOpenDelete(job)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Job Dialog */}
        <Dialog open={openForm} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>
            {currentJob ? 'Edit Job' : 'Add New Job'}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={formErrors.title}
                    helperText={formErrors.title ? 'Title is required' : ''}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={formErrors.description}
                    helperText={formErrors.description ? 'Description is required' : ''}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    error={formErrors.department}
                    helperText={formErrors.department ? 'Department is required' : ''}
                    margin="normal"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Last Date to Apply"
                    value={formData.lastDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={formErrors.lastDate}
                        helperText={formErrors.lastDate ? 'Last date is required' : ''}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {currentJob ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Job Dialog */}
        <Dialog open={openView} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>
            Job Details
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {currentJob && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {currentJob.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Department: {currentJob.department}
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {currentJob.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Posted: {formatDate(currentJob.postedOn)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Deadline: {formatDate(currentJob.lastDate)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDelete} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle>
            Confirm Delete
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1">
              Are you sure you want to delete the job "{currentJob?.title}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default Jobs;