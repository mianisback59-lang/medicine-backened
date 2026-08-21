const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Main Route Test
app.get('/', (req, res) => {
  res.send('✅ Backend Server is Running Successfully!');
});

// Verification API Route
app.get('/api/verify/:batch', (req, res) => {
  const { batch } = req.params;
  res.json({
    success: true,
    message: `Batch ${batch} verified successfully!`,
    batchNumber: batch
  });
});

// Vercel Serverless Export (Sab se zaroori line)
module.exports = app;