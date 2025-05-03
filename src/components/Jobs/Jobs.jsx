import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Work,
  School,
  Event,
  Phone,
  Email,
  Business,
  CalendarToday,
  Visibility,
  Edit,
  Delete,
  Add,
  Close,
  Check
} from '@mui/icons-material';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_URL = "https://hospitalbackend-eight.vercel.app/api/jobs";

  // Form state
  const [formData, setFormData] = useState({
    postName: '',
    experience: '',
    location: '',
    qualification: '',
    companyOverview: '',
    positionSummary: '',
    keyResponsibilities: '',
    phoneNumber: '',
    email: '',
    department: '',
    lastDate: '',
    isActive: true
  });

  const [errors, setErrors] = useState({
    postName: false,
    experience: false,
    location: false,
    qualification: false,
    lastDate: false
  });

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError('Failed to fetch jobs');
        showSnackbar('Failed to fetch jobs', 'error');
      }
    } catch (err) {
      setError('Error fetching jobs');
      showSnackbar('Error fetching jobs', 'error');
      console.error("Error fetching jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // View job details
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  // Handle form dialog open/close
  const handleFormDialogOpen = (job = null) => {
    if (job) {
      setCurrentJob(job);
      setIsEditMode(true);
      setFormData({
        postName: job.postName,
        experience: job.experience,
        location: job.location,
        qualification: job.qualification,
        companyOverview: job.companyOverview,
        positionSummary: job.positionSummary,
        keyResponsibilities: job.keyResponsibilities,
        phoneNumber: job.phoneNumber,
        email: job.email,
        department: job.department,
        lastDate: job.lastDate.split('T')[0],
        isActive: job.isActive !== undefined ? job.isActive : true
      });
    } else {
      setIsEditMode(false);
      setFormData({
        postName: '',
        experience: '',
        location: '',
        qualification: '',
        companyOverview: '',
        positionSummary: '',
        keyResponsibilities: '',
        phoneNumber: '',
        email: '',
        department: '',
        lastDate: '',
        isActive: true
      });
    }
    setFormDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
    setCurrentJob(null);
    setErrors({
      postName: false,
      experience: false,
      location: false,
      qualification: false,
      lastDate: false
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      postName: !formData.postName.trim(),
      experience: !formData.experience.trim(),
      location: !formData.location.trim(),
      qualification: !formData.qualification.trim(),
      lastDate: !formData.lastDate.trim()
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        lastDate: new Date(formData.lastDate).toISOString()
      };

      let response;
      if (isEditMode) {
        response = await fetch(`${API_URL}/${currentJob._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (data.success) {
        showSnackbar(
          isEditMode ? 'Job updated successfully' : 'Job created successfully',
          'success'
        );
        fetchJobs();
        handleFormDialogClose();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      showSnackbar(error.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${jobToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        showSnackbar('Job deleted successfully', 'success');
        fetchJobs();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      showSnackbar(error.message || 'Failed to delete job', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setJobToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !jobs.length) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress size={60} />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Job Portal Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleFormDialogOpen()}
          sx={{ borderRadius: '8px' }}
        >
          Post New Job
        </Button>
      </Box>

      <Grid container spacing={3}>
        {jobs.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">No job openings currently available</Typography>
            </Paper>
          </Grid>
        ) : (
          jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job._id}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {job.postName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">{job.experience}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">{job.qualification}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Chip 
                      label={job.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={job.isActive ? 'success' : 'error'} 
                    />
                    <Box>
                      <IconButton color="primary" onClick={() => handleViewJob(job)}>
                        <Visibility />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleFormDialogOpen(job)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(job)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* View Job Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedJob?.postName} Details
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Location:</strong> &nbsp;{selectedJob.location}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Work sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Experience:</strong> &nbsp;{selectedJob.experience}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <School sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Qualification:</strong> &nbsp;{selectedJob.qualification}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Department:</strong> &nbsp;{selectedJob.department}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Last Date:</strong> &nbsp;{formatDate(selectedJob.lastDate)}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Contact Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Phone:</strong> &nbsp;{selectedJob.phoneNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <strong>Email:</strong> &nbsp;{selectedJob.email}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Company Overview
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ wordWrap: 'break-word', mb: 2 }}>
                    {selectedJob.companyOverview}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Position Summary
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ wordWrap: 'break-word', mb: 2 }}>
                    {selectedJob.positionSummary}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Key Responsibilities
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ wordWrap: 'break-word' }}>
                    {selectedJob.keyResponsibilities}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={formDialogOpen} onClose={handleFormDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
          <IconButton onClick={handleFormDialogClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title *"
                  name="postName"
                  value={formData.postName}
                  onChange={handleInputChange}
                  error={errors.postName}
                  helperText={errors.postName && 'Job title is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department *"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Experience *"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  error={errors.experience}
                  helperText={errors.experience && 'Experience is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={errors.location}
                  helperText={errors.location && 'Location is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Qualification *"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  error={errors.qualification}
                  helperText={errors.qualification && 'Qualification is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Deadline *"
                  name="lastDate"
                  type="date"
                  value={formData.lastDate}
                  onChange={handleInputChange}
                  error={errors.lastDate}
                  helperText={errors.lastDate && 'Deadline is required'}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Overview"
                  name="companyOverview"
                  value={formData.companyOverview}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Position Summary"
                  name="positionSummary"
                  value={formData.positionSummary}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Key Responsibilities"
                  name="keyResponsibilities"
                  value={formData.keyResponsibilities}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label={formData.isActive ? 'Active Listing' : 'Inactive Listing'}
                  labelPlacement="start"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleFormDialogClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the "{jobToDelete?.postName}" job posting?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Jobs;