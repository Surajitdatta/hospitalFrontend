import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Drawer
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const API_URL = 'https://hospitalbackend-eight.vercel.app/api/appoinment';

const Appoinment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [viewAppointment, setViewAppointment] = useState(null);
  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    preferredDate: '',
    problemDescription: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setAppointments(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch appointments',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.patientPhone.trim()) newErrors.patientPhone = 'Phone number is required';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Problem description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentAppointment(null);
    setFormData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      preferredDate: '',
      problemDescription: ''
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail || '',
      preferredDate: appointment.preferredDate ? appointment.preferredDate.split('T')[0] : '',
      problemDescription: appointment.problemDescription
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (appointment) => {
    setCurrentAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (currentAppointment) {
        await axios.put(`${API_URL}/${currentAppointment._id}`, formData);
        setSnackbar({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(API_URL, formData);
        setSnackbar({
          open: true,
          message: 'Appointment created successfully',
          severity: 'success'
        });
      }

      fetchAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save appointment',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${currentAppointment._id}`);
      setSnackbar({
        open: true,
        message: 'Appointment deleted successfully',
        severity: 'success'
      });
      fetchAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete appointment',
        severity: 'error'
      });
    }
  };

  const handleOpenViewDrawer = (appointment) => {
    setViewAppointment(appointment);
    setOpenViewDrawer(true);
  };

  const handleCloseViewDrawer = () => {
    setOpenViewDrawer(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appointment Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchAppointments}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Appointment
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Preferred Date</TableCell>
                <TableCell>Problem Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.patientPhone}</TableCell>
                  <TableCell>{appointment.patientEmail || '-'}</TableCell>
                  <TableCell>
                    {appointment.preferredDate ? 
                      new Date(appointment.preferredDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {appointment.problemDescription?.substring(0, 50)}
                    {appointment.problemDescription?.length > 50 && '...'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="info"
                      onClick={() => handleOpenViewDrawer(appointment)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(appointment)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(appointment)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAppointment ? 'Edit Appointment' : 'Add New Appointment'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="patientName"
              label="Patient Name *"
              value={formData.patientName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.patientName}
              helperText={errors.patientName}
              required
            />

            <TextField
              name="patientPhone"
              label="Phone Number *"
              value={formData.patientPhone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.patientPhone}
              helperText={errors.patientPhone}
              required
            />

            <TextField
              name="patientEmail"
              label="Email"
              value={formData.patientEmail}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="preferredDate"
              label="Preferred Date"
              type="date"
              value={formData.preferredDate}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              name="problemDescription"
              label="Problem Description *"
              value={formData.problemDescription}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              error={!!errors.problemDescription}
              helperText={errors.problemDescription}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentAppointment ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete appointment for{' '}
            <strong>{currentAppointment?.patientName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Appointment Drawer */}
      <Drawer
        anchor="right"
        open={openViewDrawer}
        onClose={handleCloseViewDrawer}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Appointment Details</Typography>
            <IconButton onClick={handleCloseViewDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          {viewAppointment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Name:</strong> {viewAppointment.patientName}</Typography>
              <Typography><strong>Phone:</strong> {viewAppointment.patientPhone}</Typography>
              <Typography><strong>Email:</strong> {viewAppointment.patientEmail || '-'}</Typography>
              <Typography><strong>Preferred Date:</strong> {viewAppointment.preferredDate ? new Date(viewAppointment.preferredDate).toLocaleDateString() : '-'}</Typography>
              <Typography><strong>Problem:</strong> {viewAppointment.problemDescription}</Typography>
            </Box>
          )}
        </Box>
      </Drawer>

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
    </Box>
  );
};

export default Appoinment;
