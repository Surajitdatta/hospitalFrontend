import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";

const BASE_URL = "https://hospitalbackend-eight.vercel.app/api/news-events";

const News = () => {
  const [posts, setPosts] = useState([]);
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

  const fetchPosts = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setPosts(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch posts.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
        formData.append("img", form.img); // Keep old image URL
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        setSuccessMsg("Post deleted successfully!");
        fetchPosts();
      } catch (error) {
        console.error(error);
        setErrorMsg("Delete failed.");
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        News & Events Management
      </Typography>

      <Stack spacing={2} mb={3}>
        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      </Stack>

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

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} key={post._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={post.img}
                alt={post.title}
              />
              <CardContent>
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.date).toDateString()} ({post.type})
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default News;
