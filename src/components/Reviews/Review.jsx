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
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Slide
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const API_URL = 'https://hospitalbackend-eight.vercel.app/api/reviews'; // <-- your API URL

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newReview, setNewReview] = useState({
    patientName: '',
    comment: '',
    rating: 0
  });
  const [openViewBar, setOpenViewBar] = useState(false); // For the view details bar

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setReviews(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setSnackbar({ open: true, message: 'Failed to fetch reviews', severity: 'error' });
      setLoading(false);
    }
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedReview._id}`);
      setSnackbar({ open: true, message: 'Review deleted successfully', severity: 'success' });
      fetchReviews();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting review:', error);
      setSnackbar({ open: true, message: 'Failed to delete review', severity: 'error' });
      setOpenDeleteDialog(false);
    }
  };

  const handleAddReviewOpen = () => {
    setNewReview({ patientName: '', comment: '', rating: 0 });
    setOpenAddDialog(true);
  };

  const handleAddReviewClose = () => {
    setOpenAddDialog(false);
  };

  const handleAddReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event, newValue) => {
    setNewReview((prev) => ({ ...prev, rating: newValue }));
  };

  const handleAddReviewSubmit = async () => {
    if (!newReview.patientName || !newReview.comment || !newReview.rating) {
      setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
      return;
    }

    try {
      await axios.post(API_URL, newReview);
      setSnackbar({ open: true, message: 'Review added successfully', severity: 'success' });
      fetchReviews();
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding review:', error);
      setSnackbar({ open: true, message: 'Failed to add review', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false); // <-- This function was missing
  };

  const handleViewClick = (review) => {
    setSelectedReview(review);
    setOpenViewBar(true); // Open the view bar when clicked
  };

  const handleCloseViewBar = () => {
    setOpenViewBar(false); // Close the view bar
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Reviews
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleAddReviewOpen}
            sx={{ mr: 2 }}
          >
            Add Review
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchReviews}
          >
            Refresh
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
                <TableCell>ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>{review._id.slice(-5)}</TableCell>
                    <TableCell>{review.patientName}</TableCell>
                    <TableCell>
                      {review.comment.length > 50
                        ? review.comment.substring(0, 50) + '...'
                        : review.comment}
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly precision={0.5} />
                    </TableCell>
                    <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewClick(review)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(review)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No reviews found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review by{' '}
            <strong>{selectedReview?.patientName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddReviewClose}>
        <DialogTitle>Add New Review</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Patient Name"
            name="patientName"
            value={newReview.patientName}
            onChange={handleAddReviewChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Comment"
            name="comment"
            value={newReview.comment}
            onChange={handleAddReviewChange}
            margin="dense"
            multiline
            rows={3}
          />
          <Box sx={{ mt: 2 }}>
            <Typography>Rating</Typography>
            <Rating
              name="rating"
              value={newReview.rating}
              precision={0.5}
              onChange={handleRatingChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddReviewClose}>Cancel</Button>
          <Button onClick={handleAddReviewSubmit} variant="contained" color="success">
            Add Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* View Details Bar */}
      <Slide direction="up" in={openViewBar} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #ccc',
            padding: '16px',
            boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: 1300,
          }}
        >
          <Typography variant="h6">Review Details</Typography>
          <Typography><strong>Patient Name:</strong> {selectedReview?.patientName}</Typography>
          <Typography><strong>Comment:</strong> {selectedReview?.comment}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography><strong>Rating:</strong></Typography>
            <Rating value={selectedReview?.rating} readOnly precision={0.5} sx={{ ml: 2 }} />
          </Box>
          <Button variant="contained" color="error" onClick={handleCloseViewBar} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Slide>
    </Box>
  );
};

export default Review;
