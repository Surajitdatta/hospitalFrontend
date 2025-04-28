import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import axios from 'axios';

const HealthPackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    price: '',
    discount: 0,
    duration: '',
    preparationInstructions: '',
    isActive: true,
    inclusions: [{ name: '', description: '' }]
  });

  const [errors, setErrors] = useState({
    packageName: false,
    price: false,
    duration: false
  });

  const API_URL = 'https://hospitalbackend-eight.vercel.app/api/healthpackage';
  const BASE_URL = 'https://hospitalbackend-eight.vercel.app';

  // Check admin authentication
  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchPackages();
    };
    loadData();
  }, []);

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

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setPackages(response.data.data);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar('Failed to fetch packages', { variant: 'error' });
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleDialogOpen = (pkg = null) => {
    if (pkg) {
      setCurrentPackage(pkg);
      setIsEditMode(true);
      setFormData({
        packageName: pkg.packageName,
        price: pkg.price,
        discount: pkg.discount,
        duration: pkg.duration,
        preparationInstructions: pkg.preparationInstructions || '',
        isActive: pkg.isActive,
        inclusions: pkg.inclusions.length > 0 ? pkg.inclusions : [{ name: '', description: '' }]
      });
    } else {
      setIsEditMode(false);
      setFormData({
        packageName: '',
        price: '',
        discount: 0,
        duration: '',
        preparationInstructions: '',
        isActive: true,
        inclusions: [{ name: '', description: '' }]
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentPackage(null);
    setErrors({
      packageName: false,
      price: false,
      duration: false
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

  // Handle inclusion changes
  const handleInclusionChange = (index, field, value) => {
    const updatedInclusions = [...formData.inclusions];
    updatedInclusions[index][field] = value;
    setFormData({
      ...formData,
      inclusions: updatedInclusions
    });
  };

  // Add new inclusion field
  const addInclusion = () => {
    setFormData({
      ...formData,
      inclusions: [...formData.inclusions, { name: '', description: '' }]
    });
  };

  // Remove inclusion field
  const removeInclusion = (index) => {
    if (formData.inclusions.length > 1) {
      const updatedInclusions = [...formData.inclusions];
      updatedInclusions.splice(index, 1);
      setFormData({
        ...formData,
        inclusions: updatedInclusions
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      packageName: !formData.packageName.trim(),
      price: !formData.price || isNaN(formData.price) || formData.price <= 0,
      duration: !formData.duration.trim()
    };

    // Validate inclusions
    const hasEmptyInclusions = formData.inclusions.some(
      inc => !inc.name.trim() || !inc.description.trim()
    );

    if (hasEmptyInclusions) {
      enqueueSnackbar('All inclusions must have both name and description', { variant: 'error' });
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar('Please fill all required fields correctly', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/${currentPackage._id}`, payload);
        enqueueSnackbar('Package updated successfully', { variant: 'success' });
      } else {
        await axios.post(API_URL, payload);
        enqueueSnackbar('Package created successfully', { variant: 'success' });
      }

      fetchPackages();
      handleDialogClose();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${packageToDelete._id}`);
      enqueueSnackbar('Package deleted successfully', { variant: 'success' });
      fetchPackages();
    } catch (error) {
      enqueueSnackbar('Failed to delete package', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setPackageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPackageToDelete(null);
  };

  // Format currency
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospitalIcon sx={{ mr: 1, color: 'primary.main' }} />
          Health Packages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
          sx={{ borderRadius: '8px' }}
        >
          Add Package
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: '12px' }}>
        {loading && !packages.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : packages.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ p: 4 }}>
            No health packages found. Create your first package!
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Package Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Inclusions</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id} hover>
                    <TableCell>{pkg.packageName}</TableCell>
                    <TableCell>{formatCurrency(pkg.price)}</TableCell>
                    <TableCell>{pkg.discount}%</TableCell>
                    <TableCell>{pkg.duration}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {pkg.inclusions.slice(0, 3).map((inc, i) => (
                          <Chip key={i} label={inc.name} size="small" />
                        ))}
                        {pkg.inclusions.length > 3 && (
                          <Tooltip title={pkg.inclusions.slice(3).map(inc => inc.name).join(', ')}>
                            <Chip label={`+${pkg.inclusions.length - 3}`} size="small" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.isActive ? 'Active' : 'Inactive'}
                        color={pkg.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            color="primary"
                            onClick={() => handleDialogOpen(pkg)}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="secondary"
                            onClick={() => handleDialogOpen(pkg)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(pkg)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
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
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditMode ? 'Edit Health Package' : 'Add New Health Package'}
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Package Name *"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  error={errors.packageName}
                  helperText={errors.packageName && 'Package name is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                  label={formData.isActive ? 'Active' : 'Inactive'}
                  labelPlacement="start"
                  sx={{ ml: 0, mt: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (INR) *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  helperText={errors.price && 'Valid price is required'}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    startAdornment: '₹'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration *"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  error={errors.duration}
                  helperText={errors.duration && 'Duration is required'}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preparation Instructions"
                  name="preparationInstructions"
                  value={formData.preparationInstructions}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Package Inclusions
                </Typography>
                {formData.inclusions.map((inclusion, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Test/Service Name *"
                          value={inclusion.name}
                          onChange={(e) =>
                            handleInclusionChange(index, 'name', e.target.value)
                          }
                          margin="normal"
                          variant="outlined"
                          error={!inclusion.name.trim()}
                          helperText={!inclusion.name.trim() && 'Name is required'}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Description *"
                          value={inclusion.description}
                          onChange={(e) =>
                            handleInclusionChange(index, 'description', e.target.value)
                          }
                          margin="normal"
                          variant="outlined"
                          error={!inclusion.description.trim()}
                          helperText={!inclusion.description.trim() && 'Description is required'}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Tooltip title="Remove inclusion">
                          <IconButton
                            color="error"
                            onClick={() => removeInclusion(index)}
                            disabled={formData.inclusions.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addInclusion}
                  sx={{ mt: 1 }}
                >
                  Add Inclusion
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
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
            Are you sure you want to delete "{packageToDelete?.packageName}" package?
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
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthPackage;