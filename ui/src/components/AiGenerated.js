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
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [isText, setIsText] = useState(true);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

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
      console.log('Uploaded Image URL:', imageUrl);
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
        console.log('Submitting text payload:', payload);
        result = await axios.post(`${config.REACT_APP_AI_GEN_TEXT_API}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!isText && image) {
        const fileUrl = await uploadImageToS3(image);
        const payload = { img_url: fileUrl };
        console.log('Submitting image payload:', payload);
        result = await axios.post(`${config.REACT_APP_AI_GEN_IMAGE_API}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('Response from backend:', result.data);
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ message: 'Error occurred while generating AI content.' });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!response) return null;

    console.log('Rendering response:', response);

    const resultBody = response.body?.result || '';
    let parsedResult;

    try {
      parsedResult = JSON.parse(resultBody);
    } catch (error) {
      console.error('Error parsing API response:', error);
      return <Alert severity="error">Error parsing result from backend.</Alert>;
    }

    if (isText) {
      const isFake = parsedResult[0]?.fake === 'no' ? 'not fake or AI-generated' : 'fake or AI-generated';
      return (
        <Box>
          <Typography variant="h6">Text Detection Result:</Typography>
          <Alert severity={isFake === 'not fake or AI-generated' ? 'success' : 'error'}>
            The text is {isFake}.
          </Alert>
        </Box>
      );
    }

    if (!isText) {
      const isFake = parsedResult.answer === 'No' ? 'not fake or AI-generated' : 'fake or AI-generated';
      return (
        <Box>
          <Typography variant="h6">Image Detection Result:</Typography>
          <Alert severity={isFake === 'not fake or AI-generated' ? 'success' : 'error'}>
            The image is {isFake}.
          </Alert>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          AI Generated Content Detection
        </Typography>

        <RadioGroup
          row
          value={isText ? 'text' : 'image'}
          onChange={(e) => setIsText(e.target.value === 'text')}
        >
          <FormControlLabel value="text" control={<Radio />} label="Text" />
          <FormControlLabel value="image" control={<Radio />} label="Image" />
        </RadioGroup>

        {isText && (
          <TextField
            label="Enter text to analyze"
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={handleTextChange}
            sx={{ marginBottom: '20px' }}
          />
        )}

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

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
          sx={{ marginBottom: '20px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Content'}
        </Button>

        {response && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Result
            </Typography>
            {renderResult()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AiGenerated;
