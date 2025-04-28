import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Badge
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  MonetizationOn as CashIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";

const API_URL = "https://hospitalbackend-eight.vercel.app/api/insurance";
const BASE_URL = "https://hospitalbackend-eight.vercel.app";

const Insurance = () => {
  // State management
  const [insurances, setInsurances] = useState([]);
  const [formData, setFormData] = useState({
    providerName: "",
    contactNumber: "",
    email: "",
    policyCoverage: [],
    claimsProcess: "",
    isCashless: true,
    hospitalEmpanelmentCode: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Available coverage options
  const coverageOptions = [
    "Inpatient",
    "Outpatient",
    "Surgery",
    "Maternity",
    "Dental",
    "Vision",
    "Emergency",
    "Prescription"
  ];

  // Check admin authentication
  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchInsurances();
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

  // Fetch insurance data
  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setInsurances(response.data.data || []);
    } catch (err) {
      console.error("Error fetching insurances:", err);
      showSnackbar("Failed to fetch insurance providers", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle policy coverage changes
  const handleCoverageChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      policyCoverage: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.providerName.trim()) {
      showSnackbar("Provider name is required", "error");
      return;
    }
    if (!formData.contactNumber.trim()) {
      showSnackbar("Contact number is required", "error");
      return;
    }
    if (!formData.claimsProcess.trim()) {
      showSnackbar("Claims process description is required", "error");
      return;
    }

    setLoading(true);

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        showSnackbar("Insurance provider updated successfully!", "success");
      } else {
        await axios.post(API_URL, formData);
        showSnackbar("Insurance provider created successfully!", "success");
      }
      resetForm();
      fetchInsurances();
    } catch (err) {
      console.error("Error submitting insurance:", err);
      showSnackbar("Failed to submit insurance provider", "error");
    } finally {
      setLoading(false);
    }
  };

  // Edit insurance provider
  const handleEdit = (insurance) => {
    setFormData({
      providerName: insurance.providerName,
      contactNumber: insurance.contactNumber,
      email: insurance.email || "",
      policyCoverage: insurance.policyCoverage || [],
      claimsProcess: insurance.claimsProcess,
      isCashless: insurance.isCashless,
      hospitalEmpanelmentCode: insurance.hospitalEmpanelmentCode || ""
    });
    setEditId(insurance._id);
    setOpenDialog(true);
  };

  // View insurance details
  const handleView = (insurance) => {
    setSelectedInsurance(insurance);
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setSelectedInsurance(null);
  };

  // Delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // Delete insurance provider
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      showSnackbar("Insurance provider deleted successfully!", "success");
      fetchInsurances();
    } catch (err) {
      console.error("Error deleting insurance:", err);
      showSnackbar("Failed to delete insurance provider", "error");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      providerName: "",
      contactNumber: "",
      email: "",
      policyCoverage: [],
      claimsProcess: "",
      isCashless: true,
      hospitalEmpanelmentCode: ""
    });
    setEditId(null);
    setOpenDialog(false);
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter insurances based on search term and filters
  const filteredInsurances = insurances.filter((insurance) => {
    const matchesSearch = insurance.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insurance.contactNumber.includes(searchTerm) ||
                         (insurance.email && insurance.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCashlessFilter = filter === "all" || 
                                (filter === "cashless" && insurance.isCashless) || 
                                (filter === "non-cashless" && !insurance.isCashless);

    const matchesCoverageFilter = coverageFilter.length === 0 || 
                                coverageFilter.some(coverage => 
                                  insurance.policyCoverage && 
                                  insurance.policyCoverage.includes(coverage));

    return matchesSearch && matchesCashlessFilter && matchesCoverageFilter;
  });

  // Pagination
  const paginatedInsurances = filteredInsurances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 4,
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        p: 3,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Insurance Provider Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          Add Provider
        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Cashless Filter</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Cashless Filter"
              >
                <MenuItem value="all">All Providers</MenuItem>
                <MenuItem value="cashless">Cashless Only</MenuItem>
                <MenuItem value="non-cashless">Non-Cashless</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Coverage Types</InputLabel>
              <Select
                multiple
                value={coverageFilter}
                onChange={(e) => setCoverageFilter(e.target.value)}
                label="Coverage Types"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {coverageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={coverageFilter.indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Insurance Providers Table */}
      {loading && insurances.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : insurances.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: "center",
          backgroundColor: "background.paper",
          boxShadow: 2,
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No insurance providers found. Add your first provider!
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="insurance providers table">
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'primary.contrastText' }}>Provider</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText' }}>Coverage</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText' }}>Cashless</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInsurances.map((insurance) => (
                  <TableRow
                    key={insurance._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <HospitalIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {insurance.providerName}
                          </Typography>
                          {insurance.hospitalEmpanelmentCode && (
                            <Typography variant="caption" color="text.secondary">
                              Code: {insurance.hospitalEmpanelmentCode}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                          {insurance.contactNumber}
                        </Typography>
                        {insurance.email && (
                          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                            {insurance.email}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {insurance.policyCoverage && insurance.policyCoverage.length > 0 ? (
                          insurance.policyCoverage.slice(0, 3).map((coverage) => (
                            <Chip 
                              key={coverage} 
                              label={coverage} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No coverage specified
                          </Typography>
                        )}
                        {insurance.policyCoverage && insurance.policyCoverage.length > 3 && (
                          <Tooltip title={insurance.policyCoverage.slice(3).join(', ')}>
                            <Chip 
                              label={`+${insurance.policyCoverage.length - 3}`} 
                              size="small" 
                              color="secondary"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={insurance.isCashless ? "Cashless" : "Non-Cashless"} 
                        color={insurance.isCashless ? "success" : "default"}
                        icon={insurance.isCashless ? <CashIcon fontSize="small" /> : undefined}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            aria-label="view"
                            color="info"
                            onClick={() => handleView(insurance)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            aria-label="edit"
                            color="secondary"
                            onClick={() => handleEdit(insurance)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleDeleteClick(insurance._id)}
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

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInsurances.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <HospitalIcon sx={{ mr: 1 }} />
          {editId ? "Edit Insurance Provider" : "Add New Insurance Provider"}
          <IconButton
            aria-label="close"
            onClick={resetForm}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: 'primary.contrastText'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Provider Name *"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={!formData.providerName.trim()}
                  helperText={!formData.providerName.trim() ? "Provider name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number *"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={!formData.contactNumber.trim()}
                  helperText={!formData.contactNumber.trim() ? "Contact number is required" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Policy Coverage</InputLabel>
                  <Select
                    multiple
                    name="policyCoverage"
                    value={formData.policyCoverage}
                    onChange={handleCoverageChange}
                    label="Policy Coverage"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {coverageOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={formData.policyCoverage.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Claims Process *"
                  name="claimsProcess"
                  value={formData.claimsProcess}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  error={!formData.claimsProcess.trim()}
                  helperText={!formData.claimsProcess.trim() ? "Claims process description is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isCashless}
                      onChange={handleChange}
                      name="isCashless"
                      color="primary"
                    />
                  }
                  label="Cashless Facility Available"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hospital Empanelment Code"
                  name="hospitalEmpanelmentCode"
                  value={formData.hospitalEmpanelmentCode}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={resetForm}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 120 }}
            >
              {editId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Insurance Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseView} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <HospitalIcon sx={{ mr: 1 }} />
          Insurance Provider Details
          <IconButton
            aria-label="close"
            onClick={handleCloseView}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: 'primary.contrastText'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {selectedInsurance && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
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
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {selectedInsurance.providerName}
                  </Typography>
                  {selectedInsurance.hospitalEmpanelmentCode && (
                    <Chip 
                      label={`Empanelment Code: ${selectedInsurance.hospitalEmpanelmentCode}`}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Chip 
                    label={selectedInsurance.isCashless ? "Cashless Facility" : "Non-Cashless"} 
                    color={selectedInsurance.isCashless ? "success" : "default"}
                    icon={selectedInsurance.isCashless ? <CashIcon /> : undefined}
                    sx={{ mb: 3 }}
                  />
                </Paper>
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
                      primary="Contact Number" 
                      secondary={selectedInsurance.contactNumber}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  {selectedInsurance.email && (
                    <>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <EmailIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Email Address" 
                          secondary={selectedInsurance.email}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </>
                  )}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <DescriptionIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Policy Coverage" 
                      secondary={
                        selectedInsurance.policyCoverage && selectedInsurance.policyCoverage.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedInsurance.policyCoverage.map((coverage) => (
                              <Chip 
                                key={coverage} 
                                label={coverage} 
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : "No coverage specified"
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <DescriptionIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Claims Process" 
                      secondary={selectedInsurance.claimsProcess}
                      secondaryTypographyProps={{ sx: { whiteSpace: 'pre-line' } }}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseView}
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
        onClose={() => setOpenDeleteDialog(false)}
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
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              position: "absolute",
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
            Are you sure you want to delete this insurance provider?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All related data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Insurance;