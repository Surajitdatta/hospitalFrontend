import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  Grid,
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
  DialogContentText,
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
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Card,
  CardContent,
  Badge,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Money as MoneyIcon,
  MedicalServices as EquipmentIcon
} from '@mui/icons-material';

const API_URL = 'https://hospitalbackend-eight.vercel.app/api/ambulance';
const BASE_URL = 'https://hospitalbackend-eight.vercel.app';

const Ambulance = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
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
  const [errors, setErrors] = useState({
    ambulanceType: false,
    vehicleNumber: false,
    driverName: false,
    driverContact: false,
    baseLocation: false,
    charges: false
  });
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  const ambulanceTypes = [
    'Basic Life Support',
    'Advanced Life Support',
    'Patient Transport Ambulance',
    'Neonatal Ambulance'
  ];

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'success' },
    { value: 'on-mission', label: 'On Mission', color: 'warning' },
    { value: 'maintenance', label: 'Maintenance', color: 'error' }
  ];

  // Check admin authentication
  const checkAdmin = async () => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      setAdminLoading(false);
      window.location.href = '/admin';
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/admin`);
      const admins = res.data;
      const storedAdmin = JSON.parse(adminData);
      const admin = admins.find(a => a.username === storedAdmin.username && a.password === storedAdmin.password);
      
      if (!admin) {
        localStorage.removeItem('admin');
        window.location.href = '/admin';
      }
    } catch (err) {
      setAdminError(err.message);
      window.location.href = '/admin';
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setAmbulances(response.data.data || []);
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

  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchAmbulances();
    };
    loadData();
  }, []);

  const validateForm = () => {
    const newErrors = {
      ambulanceType: !formData.ambulanceType,
      vehicleNumber: !formData.vehicleNumber,
      driverName: !formData.driverName,
      driverContact: !formData.driverContact,
      baseLocation: !formData.baseLocation,
      charges: !formData.charges
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
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
    setErrors({
      ambulanceType: false,
      vehicleNumber: false,
      driverName: false,
      driverContact: false,
      baseLocation: false,
      charges: false
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
      locationCoverage: ambulance.locationCoverage || '',
      baseLocation: ambulance.baseLocation,
      charges: ambulance.charges,
      equipment: ambulance.equipment || '',
      isAvailable: ambulance.isAvailable
    });
    setOpenDialog(true);
  };

  const handleOpenViewDialog = (ambulance) => {
    setCurrentAmbulance(ambulance);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
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
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        charges: Number(formData.charges)
      };

      if (currentAmbulance) {
        await axios.put(`${API_URL}/${currentAmbulance._id}`, payload);
        setSnackbar({
          open: true,
          message: 'Ambulance updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post(API_URL, payload);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {adminError}
        </Alert>
        <Button variant="contained" onClick={() => window.location.href = '/admin'}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        p: 3,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Ambulance Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
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

      {loading && !ambulances.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : ambulances.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          backgroundColor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No ambulances found. Add your first ambulance!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'primary.contrastText' }}>Vehicle No.</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Type</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Driver</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Contact</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Base Location</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Status</TableCell>
                <TableCell sx={{ color: 'primary.contrastText' }}>Charges</TableCell>
                <TableCell sx={{ color: 'primary.contrastText', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ambulances.map((ambulance) => (
                <TableRow key={ambulance._id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{ambulance.vehicleNumber}</Typography>
                  </TableCell>
                  <TableCell>{ambulance.ambulanceType}</TableCell>
                  <TableCell>{ambulance.driverName}</TableCell>
                  <TableCell>{ambulance.driverContact}</TableCell>
                  <TableCell>{ambulance.baseLocation}</TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        ambulance.status === 'available' ? 'Available' : 
                        ambulance.status === 'on-mission' ? 'On Mission' : 'Maintenance'
                      }
                      color={getStatusColor(ambulance.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {formatCurrency(ambulance.charges)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenViewDialog(ambulance)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(ambulance)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(ambulance)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <HospitalIcon sx={{ mr: 1 }} />
          {currentAmbulance ? 'Edit Ambulance' : 'Add New Ambulance'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.contrastText'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={errors.ambulanceType}>
                <InputLabel>Ambulance Type *</InputLabel>
                <Select
                  name="ambulanceType"
                  value={formData.ambulanceType}
                  onChange={handleInputChange}
                  label="Ambulance Type *"
                >
                  {ambulanceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.ambulanceType && (
                  <Typography variant="caption" color="error">
                    Ambulance type is required
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="vehicleNumber"
                label="Vehicle Number *"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={errors.vehicleNumber}
                helperText={errors.vehicleNumber && 'Vehicle number is required'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="driverName"
                label="Driver Name *"
                value={formData.driverName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={errors.driverName}
                helperText={errors.driverName && 'Driver name is required'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="driverContact"
                label="Driver Contact *"
                value={formData.driverContact}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={errors.driverContact}
                helperText={errors.driverContact && 'Driver contact is required'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="baseLocation"
                label="Base Location *"
                value={formData.baseLocation}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={errors.baseLocation}
                helperText={errors.baseLocation && 'Base location is required'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="locationCoverage"
                label="Location Coverage"
                value={formData.locationCoverage}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="charges"
                label="Charges (₹) *"
                type="number"
                value={formData.charges}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={errors.charges}
                helperText={errors.charges && 'Charges are required'}
                InputProps={{
                  startAdornment: '₹'
                }}
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked
                      })
                    }
                    color="primary"
                  />
                }
                label="Available for service"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {currentAmbulance ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <HospitalIcon sx={{ mr: 1 }} />
          Ambulance Details
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.contrastText'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {currentAmbulance && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ 
                      width: 120, 
                      height: 120,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <HospitalIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      {currentAmbulance.vehicleNumber}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {currentAmbulance.ambulanceType}
                    </Typography>
                    <Chip 
                      label={
                        currentAmbulance.status === 'available' ? 'Available' : 
                        currentAmbulance.status === 'on-mission' ? 'On Mission' : 'Maintenance'
                      }
                      color={getStatusColor(currentAmbulance.status)}
                      sx={{ mb: 2 }}
                    />
                    <Badge
                      color={currentAmbulance.isAvailable ? 'success' : 'error'}
                      variant="dot"
                      sx={{ mr: 1 }}
                    >
                      <Typography>
                        {currentAmbulance.isAvailable ? 'Available for service' : 'Not available for service'}
                      </Typography>
                    </Badge>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Driver Contact" 
                      secondary={currentAmbulance.driverContact}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Base Location" 
                      secondary={currentAmbulance.baseLocation}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  {currentAmbulance.locationCoverage && (
                    <>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <LocationIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Location Coverage" 
                          secondary={currentAmbulance.locationCoverage}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </>
                  )}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <MoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Charges" 
                      secondary={formatCurrency(currentAmbulance.charges)}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 600 }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  {currentAmbulance.equipment && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <EquipmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Equipment Details" 
                        secondary={currentAmbulance.equipment}
                        secondaryTypographyProps={{ sx: { whiteSpace: 'pre-line' } }}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseViewDialog}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: 'error.main',
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Confirm Delete
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'error.contrastText'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete ambulance{' '}
            <strong>{currentAmbulance?.vehicleNumber}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All related data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Ambulance;