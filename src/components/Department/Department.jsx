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
  CardMedia,
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
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon
} from "@mui/icons-material";

const API_URL = "https://hospitalbackend-eight.vercel.app/api/department";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: null
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      showSnackbar("Failed to fetch departments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "icon") {
      const file = e.target.files[0];
      setFormData({ ...formData, icon: file });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    if (formData.icon) {
      submitData.append("icon", formData.icon);
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showSnackbar("Department updated successfully!", "success");
      } else {
        await axios.post(API_URL, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showSnackbar("Department created successfully!", "success");
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      console.error("Error submitting department:", err);
      showSnackbar("Failed to submit department", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      description: dept.description,
      icon: null
    });
    setPreview(dept.icon || null);
    setEditId(dept._id);
    setOpenDialog(true);
  };

  const handleView = (dept) => {
    setSelectedDepartment(dept);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      showSnackbar("Department deleted successfully!", "success");
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting department:", err);
      showSnackbar("Failed to delete department", "error");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: null
    });
    setPreview(null);
    setEditId(null);
    setOpenDialog(false);
  };

  const showSnackbar = (message, severity) => {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Department Management
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
          Add Department
        </Button>
      </Box>

      {/* Departments List */}
      {loading && departments.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : departments.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: "center",
          backgroundColor: "background.paper",
          boxShadow: 2,
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No departments found. Create your first department!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept._id}>
              <Card sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
                {dept.icon ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={dept.icon}
                    alt={dept.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "action.hover"
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, color: "action.active" }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    {dept.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1
                  }}>
                    {dept.description}
                  </Typography>
                  <Chip 
                    label="Active" 
                    color="success" 
                    size="small" 
                    icon={<CheckCircleIcon fontSize="small" />}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
                <CardActions sx={{ 
                  justifyContent: "space-between",
                  px: 2,
                  pb: 2
                }}>
                  <Tooltip title="View Details">
                    <IconButton
                      aria-label="view"
                      color="primary"
                      onClick={() => handleView(dept)}
                      sx={{
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        aria-label="edit"
                        color="secondary"
                        onClick={() => handleEdit(dept)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteClick(dept._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={resetForm} fullWidth maxWidth="sm">
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <CategoryIcon sx={{ mr: 1 }} />
          {editId ? "Edit Department" : "Add New Department"}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Department Icon {editId ? "(optional)" : ""}
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload Icon
                    <input
                      type="file"
                      name="icon"
                      accept="image/*"
                      onChange={handleChange}
                      hidden
                    />
                  </Button>
                  {preview && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "4px"
                        }}
                      />
                    </Box>
                  )}
                </Box>
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

      {/* View Department Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <CategoryIcon sx={{ mr: 1 }} />
          Department Details
          <IconButton
            aria-label="close"
            onClick={() => setOpenViewDialog(false)}
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
          {selectedDepartment && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 3
              }}>
                {selectedDepartment.icon ? (
                  <img
                    src={selectedDepartment.icon}
                    alt={selectedDepartment.name}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Avatar sx={{ 
                    width: 120, 
                    height: 120,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }}>
                    <CategoryIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                )}
              </Box>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CategoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Department Name" 
                    secondary={selectedDepartment.name}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <ImageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Description" 
                    secondary={selectedDepartment.description}
                    secondaryTypographyProps={{ 
                      sx: { whiteSpace: 'pre-line' } 
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Status" 
                    secondary="Active"
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)}
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
            Are you sure you want to delete this department?
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

export default Department;