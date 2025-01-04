import React, { useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import config from '../config';

const AiGenerated = () => {
  const [text, setText] = useState(''); // Text input state
  const [image, setImage] = useState(null); // Image input state
  const [isText, setIsText] = useState(true); // Toggle for text or image
  const [response, setResponse] = useState(null); // Response from backend
  const [loading, setLoading] = useState(false); // Loading state

  // Configure AWS S3
  AWS.config.update({
    accessKeyId: `${config.REACT_APP_ACCESS_KEY}`,
    secretAccessKey: `${config.REACT_APP_SECRET_ACCESS_KEY}`,
    region: 'ap-southeast-2',
  });

  const s3 = new AWS.S3();
  const bucketName = `${config.REACT_APP_BUCKET_NAME}`;
  const bucketRegion = 'ap-southeast-2';

  const handleTextChange = (e) => setText(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);

  // Upload image to S3
  const uploadImageToS3 = async (imageFile) => {
    const params = {
      Bucket: bucketName,
      Key: `uploadedimage.jpg`,
      Body: imageFile,
      ContentType: imageFile.type,
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`;
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Failed to upload image to S3.');
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      setResponse({ message: 'Please provide text or upload an image for AI generation.' });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      let result;

      if (isText && text.trim()) {
        const payload = { text };
        result = await axios.post(`${config.REACT_APP_AI_GEN_TEXT_API}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!isText && image) {
        const fileUrl = await uploadImageToS3(image);
        const payload = { img_url: fileUrl };
        result = await axios.post(`${config.REACT_APP_AI_GEN_IMAGE_API}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ message: 'Error occurred while generating AI content.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          AI Generated Content
        </Typography>

        {/* Input Type Toggle */}
        <RadioGroup
          row
          value={isText ? 'text' : 'image'}
          onChange={(e) => setIsText(e.target.value === 'text')}
        >
          <FormControlLabel value="text" control={<Radio />} label="Text" />
          <FormControlLabel value="image" control={<Radio />} label="Image" />
        </RadioGroup>

        {/* Text Input */}
        {isText && (
          <TextField
            label="Enter text for AI generation"
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={handleTextChange}
            sx={{ marginBottom: '20px' }}
          />
        )}

        {/* Image Upload */}
        {!isText && (
          <Button
            variant="outlined"
            component="label"
            sx={{ marginBottom: '20px' }}
          >
            Upload Image
            <input type="file" hidden onChange={handleImageChange} />
          </Button>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
          sx={{ marginBottom: '20px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Content'}
        </Button>

        {/* Display Response */}
        {response && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Result
            </Typography>
            {response.message && <Alert severity="info">{response.message}</Alert>}
            {response.data && (
              <Box
                sx={{
                  marginTop: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AiGenerated;
