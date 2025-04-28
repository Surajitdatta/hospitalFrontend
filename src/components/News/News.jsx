import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Box
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Image as ImageIcon
} from "@mui/icons-material";

const BASE_URL = "https://hospitalbackend-eight.vercel.app/api/news-events";
const ADMIN_API_URL = "https://hospitalbackend-eight.vercel.app/api/admin";

const News = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    type: "news",
    img: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setPosts(res.data);
      setFilteredPosts(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch posts.");
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      await checkAdmin();
      await fetchPosts();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  const handleChange = (e) => {
    if (e.target.name === "img") {
      setForm({ ...form, img: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("type", form.type);

      if (form.img instanceof File) {
        formData.append("img", form.img);
      } else if (editingId) {
        formData.append("img", form.img);
      }

      if (editingId) {
        await axios.put(`${BASE_URL}/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Post updated successfully!");
      } else {
        await axios.post(BASE_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Post created successfully!");
      }

      setForm({
        title: "",
        description: "",
        date: "",
        type: "news",
        img: null,
      });
      setEditingId(null);
      fetchPosts();
    } catch (error) {
      console.error(error);
      setErrorMsg("Operation failed.");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setForm({
      title: post.title,
      description: post.description,
      date: post.date.split("T")[0],
      type: post.type,
      img: post.img,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${BASE_URL}/${postToDelete._id}`);
      setSuccessMsg("Post deleted successfully!");
      fetchPosts();
    } catch (error) {
      console.error(error);
      setErrorMsg("Delete failed.");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setPostToDelete(null);
  };

  const handleViewClick = (post) => {
    setSelectedPost(post);
    setViewDrawerOpen(true);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (adminLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (adminError) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {adminError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/admin')} sx={{ ml: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        News & Events Management
      </Typography>

      <Stack spacing={2} mb={3}>
        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      </Stack>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <IconButton onClick={clearSearch} size="small">
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
      </Paper>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              name="title"
              fullWidth
              value={form.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Date"
              name="date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={form.type}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="news">News</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" component="label" fullWidth>
              {form.img ? "Change Image" : "Upload Image"}
              <input
                type="file"
                name="img"
                hidden
                accept="image/*"
                onChange={handleChange}
              />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color={editingId ? "warning" : "primary"}
              type="submit"
              fullWidth
            >
              {editingId ? "Update Post" : "Create Post"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {filteredPosts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            {searchTerm ? "No matching posts found" : "No posts available"}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Create First Post
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} sm={6} key={post._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.img}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {post.description.length > 100
                      ? `${post.description.substring(0, 100)}...`
                      : post.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.date).toDateString()} • {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Typography>
                </CardContent>
                <CardContent sx={{ pt: 0 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewClick(post)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(post)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the post titled:
            <br />
            <strong>"{postToDelete?.title}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Drawer */}
      <Drawer
        anchor="right"
        open={viewDrawerOpen}
        onClose={handleCloseViewDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '500px' },
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Post Details</Typography>
            <IconButton onClick={handleCloseViewDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedPost && (
            <>
              <Box sx={{ mb: 3 }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={selectedPost.img}
                  alt={selectedPost.title}
                  sx={{ borderRadius: 1, objectFit: 'cover' }}
                />
              </Box>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DescriptionIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Title" 
                    secondary={selectedPost.title}
                    secondaryTypographyProps={{ variant: 'h6' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <CategoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Type" 
                    secondary={
                      <Chip 
                        label={selectedPost.type.charAt(0).toUpperCase() + selectedPost.type.slice(1)}
                        color={selectedPost.type === 'news' ? 'primary' : 'secondary'}
                      />
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Date" 
                    secondary={new Date(selectedPost.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <DescriptionIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Description" 
                    secondary={selectedPost.description}
                    secondaryTypographyProps={{ sx: { whiteSpace: 'pre-line' } }}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleEdit(selectedPost);
                    handleCloseViewDrawer();
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handleCloseViewDrawer();
                    handleDeleteClick(selectedPost);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Container>
  );
};

export default News;