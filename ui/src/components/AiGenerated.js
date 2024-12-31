import React, { useState } from 'react';
import AWS from 'aws-sdk';
import axios from 'axios';
import config from '../config';

const AiGenerated = () => {
  const [text, setText] = useState(''); // Text input state
  const [image, setImage] = useState(null); // Image input state
  const [isText, setIsText] = useState(true); // Toggle for text or image
  const [response, setResponse] = useState(null); // Response from backend

  // Configure AWS S3
  AWS.config.update({
    accessKeyId: 'AWS_ACCESS_KEY', // Replace with your AWS Access Key ID
    secretAccessKey: 'AWS_SECRET_KEY', // Replace with your AWS Secret Access Key
    region: 'AWS_REGION', // Replace with your AWS S3 bucket region
  });

  const s3 = new AWS.S3();
  const bucketName = 'BUCKET_NAME'; // Replace with your bucket name
  const bucketRegion = 'BUCKET_REGION'; // The region of your bucket (update if necessary)

  // Handle text input change
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle image input change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Upload image to S3
  const uploadImageToS3 = async (imageFile) => {
    const params = {
      Bucket: bucketName,
      Key: `uploadedimage.jpg`, // Use a folder and the original file name or modify this as needed
      Body: imageFile,
      ContentType: imageFile.type,
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`; // Construct the full URL
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Failed to upload image to S3.');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      setResponse({ message: 'Please provide text or upload an image for AI generation.' });
      return;
    }

    try {
      let result;

      // If text input
      if (isText && text.trim()) {
        const payload = { text }; // Prepare JSON payload with text
        result = await axios.post('API_ENDPOINT_URL', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // If image input
      if (!isText && image) {
        // Upload image to S3 and get the file URL
        const fileUrl = await uploadImageToS3(image);
        console.log(fileUrl);

        const payload = { img_url: fileUrl }; // Prepare JSON payload with the image URL as "img_url"
        result = await axios.post('API_ENDPOINT_URL', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      console.log('Response from backend:');
      console.log(result.data)
      // Set the response state with the result from backend
      setResponse(result.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ message: 'Error occurred while generating AI content.' });
    }
  };

  return (
    <div className="ai-generated">
      <h2>AI Generated Content</h2>

      {/* Toggle between Text or Image */}
      <div>
        <label>
          <input
            type="radio"
            name="inputType"
            checked={isText}
            onChange={() => setIsText(true)}
          />
          Text
        </label>
        <label>
          <input
            type="radio"
            name="inputType"
            checked={!isText}
            onChange={() => setIsText(false)}
          />
          Image
        </label>
      </div>

      {/* Conditionally render text input or image upload based on selection */}
      {isText ? (
        <div>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text for AI generation"
            rows="4"
            cols="50"
          />
        </div>
      ) : (
        <div>
          <input type="file" onChange={handleImageChange} />
        </div>
      )}

      {/* Submit button */}
      <div>
        <button onClick={handleSubmit}>Generate AI Content</button>
      </div>

      {/* Display result */}
      {response && (
        <div className="result">
          <h3>Result:</h3>
          <p>{response.message}</p>
          {response.data && (
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default AiGenerated;


