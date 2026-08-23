const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.status(200).send('✅ Backend Server is Running Successfully!');
});

// Verification API Route
app.get('/api/verify/:batch', (req, res) => {
  const { batch } = req.params;
  res.status(200).json({
    success: true,
    message: `Batch ${batch} verified successfully!`,
    batchNumber: batch
  });
});

// IMPORTANT: Express app instance ko export karein
module.exports = app;