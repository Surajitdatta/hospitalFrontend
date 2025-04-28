import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Save, 
  Cancel, 
  Undo, 
  Redo,
  History,
  CheckCircle,
  Error
} from '@mui/icons-material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Terms = () => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const navigate = useNavigate();
  const baseUrl = "https://hospitalbackend-eight.vercel.app";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch terms on mount
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/terms`);
        setTerms(response.data);
        setEditedText(response.data.text);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch terms');
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  // Save history for undo/redo
  useEffect(() => {
    if (editedText && isEditing) {
      const newHistory = [...history.slice(0, historyIndex + 1), editedText];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [editedText]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(terms?.text || '');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`${baseUrl}/api/terms`, { text: editedText });
      setTerms(response.data);
      setIsEditing(false);
      setSuccessMessage('✅ Terms & Conditions updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update terms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/api/terms`);
      setTerms(null);
      setEditedText('');
      setSuccessMessage('🗑️ Terms & Conditions deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete terms');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedText(history[historyIndex + 1]);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={60} thickness={4} />
        </motion.div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Slide direction="down" in={true}>
          <Alert severity="error" icon={<Error fontSize="large" />}>
            <Typography variant="h6">{error}</Typography>
          </Alert>
        </Slide>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate(-1)}
            sx={{ borderRadius: '20px', px: 4 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message (Top Floating) */}
      {successMessage && (
        <Zoom in={!!successMessage}>
          <Box sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <Alert 
              severity="success" 
              icon={<CheckCircle fontSize="large" />}
              sx={{ 
                boxShadow: theme.shadows[6],
                borderRadius: '12px',
                minWidth: '300px'
              }}
            >
              <Typography fontWeight="bold">{successMessage}</Typography>
            </Alert>
          </Box>
        </Zoom>
      )}

      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="700"
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#fff' : '#1a1a1a',
              fontSize: isMobile ? '2rem' : '2.5rem'
            }}
          >
            Terms & Conditions
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your hospital's legal terms
          </Typography>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'flex', gap: '8px' }}
        >
          {terms && !isEditing && (
            <>
              <Tooltip title="Edit Terms">
                <IconButton 
                  onClick={handleEdit}
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.primary.dark }
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Terms">
                <IconButton 
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ 
                    bgcolor: theme.palette.error.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.error.dark }
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
          {isEditing && (
            <>
              <Tooltip title="Save Changes">
                <IconButton 
                  onClick={handleSave}
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.success.dark }
                  }}
                >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton 
                  onClick={handleCancelEdit}
                  sx={{ 
                    bgcolor: theme.palette.warning.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.warning.dark }
                  }}
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
              <Tooltip title="Undo (Ctrl+Z)">
                <IconButton 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo />
                </IconButton>
              </Tooltip>
              <Tooltip title="Redo (Ctrl+Y)">
                <IconButton 
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo />
                </IconButton>
              </Tooltip>
            </>
          )}
        </motion.div>
      </Box>

      {/* Main Content */}
      {!terms ? (
        <Fade in={true}>
          <Card 
            sx={{ 
              textAlign: 'center', 
              p: 4, 
              borderRadius: '16px',
              boxShadow: theme.shadows[3],
              bgcolor: theme.palette.background.paper
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                No Terms & Conditions Found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Start by creating your hospital's legal terms.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => {
                  setEditedText('# Welcome to Our Hospital\n\n**Terms & Conditions**\n\n1. Privacy Policy\n2. User Responsibilities\n3. Data Usage');
                  setIsEditing(true);
                }}
                sx={{ borderRadius: '12px', px: 4 }}
              >
                Create New Terms
              </Button>
            </CardActions>
          </Card>
        </Fade>
      ) : isEditing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              boxShadow: theme.shadows[2],
              bgcolor: theme.palette.background.paper
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={12}
              variant="outlined"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }
              }}
              placeholder="Write your terms in Markdown format..."
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<History />}
                onClick={() => setEditedText(terms.text)}
              >
                Reset to Original
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              <strong>Tip:</strong> Use Markdown for formatting (e.g., **bold**, *italic*, # headings).
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <Fade in={true}>
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: '12px',
              boxShadow: theme.shadows[1],
              bgcolor: theme.palette.background.paper
            }}
          >
            <ReactMarkdown>{terms.text}</ReactMarkdown>
            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(terms.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            p: 2,
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          🗑️ Delete Terms & Conditions
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>permanently delete</strong> these terms? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Terms;