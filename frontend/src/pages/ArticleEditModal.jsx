import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
};

const  ArticleEditModal=({ open, onClose, article, onSave }) =>{
  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title || '',
        content: article.content || '',
        imageUrl: article.imageUrl || '',
      });
      setError('');
    }
  }, [article, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    setError('');
    try {
      const configRes = await axios.get('/api/config/cloudinary');
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', configRes.data.uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${configRes.data.cloudName}/image/upload`,
        { method: 'POST', body: data }
      );
      const result = await res.json();
      if (result.secure_url) {
        setForm((prev) => ({ ...prev, imageUrl: result.secure_url }));
      } else {
        setError('Image upload failed');
      }
    } catch {
      setError('Image upload failed');
    }
    setImgUploading(false);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.patch(`/articles/edit/${article._id}`, form);
      onSave(res.data.updatedArticle);
      onClose();
    } catch {
      setError('Failed to update article.');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Article</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Content"
            name="content"
            value={form.content}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={5}
            required
          />
          <Box sx={{ my: 2 }}>
            {form.imageUrl ? (
              <Box>
                <img
                  src={form.imageUrl}
                  alt="Article"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                />
                <Button color="error" onClick={handleRemoveImage} sx={{ ml: 2 }}>
                  Remove Image
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" component="label" disabled={imgUploading}>
                {imgUploading ? <CircularProgress size={20} /> : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            )}
          </Box>
          {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
export default ArticleEditModal;