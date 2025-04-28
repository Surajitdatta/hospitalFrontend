import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const API_URL = 'https://hospitalbackend-eight.vercel.app/api/ambulance';

const Ambulance = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAmbulance, setCurrentAmbulance] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    ambulanceType: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    status: 'available',
    locationCoverage: '',
    baseLocation: '',
    charges: '',
    equipment: '',
    isAvailable: true
  });

  const ambulanceTypes = [
    'Basic Life Support',
    'Advanced Life Support',
    'Patient Transport Ambulance',
    'Neonatal Ambulance'
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'on-mission', label: 'On Mission' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setAmbulances(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch ambulances',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOpenAddDialog = () => {
    setCurrentAmbulance(null);
    setFormData({
      ambulanceType: '',
      vehicleNumber: '',
      driverName: '',
      driverContact: '',
      status: 'available',
      locationCoverage: '',
      baseLocation: '',
      charges: '',
      equipment: '',
      isAvailable: true
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (ambulance) => {
    setCurrentAmbulance(ambulance);
    setFormData({
      ambulanceType: ambulance.ambulanceType,
      vehicleNumber: ambulance.vehicleNumber,
      driverName: ambulance.driverName,
      driverContact: ambulance.driverContact,
      status: ambulance.status,
      locationCoverage: ambulance.locationCoverage,
      baseLocation: ambulance.baseLocation,
      charges: ambulance.charges,
      equipment: ambulance.equipment || '',
      isAvailable: ambulance.isAvailable
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (ambulance) => {
    setCurrentAmbulance(ambulance);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.ambulanceType ||
        !formData.vehicleNumber ||
        !formData.driverName ||
        !formData.driverContact ||
        !formData.baseLocation ||
        !formData.charges
      ) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }

      if (currentAmbulance) {
        // Update existing ambulance
        await axios.put(`${API_URL}/${currentAmbulance._id}`, formData);
        setSnackbar({
          open: true,
          message: 'Ambulance updated successfully',
          severity: 'success'
        });
      } else {
        // Create new ambulance
        await axios.post(API_URL, formData);
        setSnackbar({
          open: true,
          message: 'Ambulance created successfully',
          severity: 'success'
        });
      }

      fetchAmbulances();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving ambulance:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save ambulance',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${currentAmbulance._id}`);
      setSnackbar({
        open: true,
        message: 'Ambulance deleted successfully',
        severity: 'success'
      });
      fetchAmbulances();
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting ambulance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete ambulance',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Ambulance Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchAmbulances}
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
            Add Ambulance
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
                <TableCell>Vehicle No.</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Base Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Charges</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ambulances.map((ambulance) => (
                <TableRow key={ambulance._id}>
                  <TableCell>{ambulance.vehicleNumber}</TableCell>
                  <TableCell>{ambulance.ambulanceType}</TableCell>
                  <TableCell>{ambulance.driverName}</TableCell>
                  <TableCell>{ambulance.driverContact}</TableCell>
                  <TableCell>{ambulance.baseLocation}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          ambulance.status === 'available'
                            ? 'success.light'
                            : ambulance.status === 'on-mission'
                            ? 'warning.light'
                            : 'error.light',
                        color:
                          ambulance.status === 'available'
                            ? 'success.dark'
                            : ambulance.status === 'on-mission'
                            ? 'warning.dark'
                            : 'error.dark'
                      }}
                    >
                      {ambulance.status === 'available'
                        ? 'Available'
                        : ambulance.status === 'on-mission'
                        ? 'On Mission'
                        : 'Maintenance'}
                    </Box>
                  </TableCell>
                  <TableCell>₹{ambulance.charges}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(ambulance)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(ambulance)}
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
          {currentAmbulance ? 'Edit Ambulance' : 'Add New Ambulance'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Ambulance Type *</InputLabel>
              <Select
                name="ambulanceType"
                value={formData.ambulanceType}
                onChange={handleInputChange}
                label="Ambulance Type *"
                required
              >
                {ambulanceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="vehicleNumber"
              label="Vehicle Number *"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              name="driverName"
              label="Driver Name *"
              value={formData.driverName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              name="driverContact"
              label="Driver Contact *"
              value={formData.driverContact}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status *</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status *"
                required
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="locationCoverage"
              label="Location Coverage"
              value={formData.locationCoverage}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="baseLocation"
              label="Base Location *"
              value={formData.baseLocation}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              name="charges"
              label="Charges (₹) *"
              type="number"
              value={formData.charges}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              name="equipment"
              label="Equipment Details"
              value={formData.equipment}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Availability</InputLabel>
              <Select
                name="isAvailable"
                value={formData.isAvailable}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isAvailable: e.target.value
                  })
                }
                label="Availability"
              >
                <MenuItem value={true}>Available</MenuItem>
                <MenuItem value={false}>Not Available</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentAmbulance ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete ambulance{' '}
            <strong>{currentAmbulance?.vehicleNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
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
    </Box>
  );
};

export default Ambulance;