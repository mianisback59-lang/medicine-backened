const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection Link
const MONGO_URI = "mongodb+srv://mianisback59_db_user:n0dxouZjCQFC1P0k@cluster0.zm6ckjm.mongodb.net/medverify?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud Database'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 1. Medicine Schema & Model
const medicineSchema = new mongoose.Schema({
  id: Number,
  medicine_name: String,
  brand_name: String,
  batch_number: String,
  manufacturing_date: String,
  expiry_date: String,
  qr_hash: String,
  status: String
});

const Medicine = mongoose.model('Medicine', medicineSchema);

// 2. Report Schema & Model (NEWLY ADDED)
const reportSchema = new mongoose.Schema({
  batch_number: { type: String, required: true },
  reason: { type: String, default: 'Counterfeit / Unverified scan' },
  store_location: { type: String, default: 'Not specified' },
  reported_at: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Verification API Route
app.get('/api/verify/:batch', async (req, res) => {
  try {
    // 1. Newlines aur Extra spaces filter karein
    let rawInput = decodeURIComponent(req.params.batch).replace(/[\r\n]+/g, '').trim();
    console.log("🔍 Backend Received Raw Text:", rawInput);

    // 2. GS1 Format Extractor: String mein se Batch Number (10 ke baad) parse karein
    let extractedBatch = rawInput;
    if (rawInput.includes('10')) {
      const match = rawInput.match(/10([A-Za-z0-9]+)11/);
      if (match && match[1]) {
        extractedBatch = match[1];
      }
    }

    console.log("🎯 Extracted Batch Target:", extractedBatch);

    // 3. Flexible MongoDB Query
    const found = await Medicine.findOne({
      $or: [
        { batch_number: extractedBatch },
        { batch_number: rawInput },
        { qr_hash: rawInput },
        { qr_hash: { $regex: extractedBatch, $options: 'i' } }
      ]
    });

    if (!found) {
      return res.status(404).json({
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        message: "This batch number or QR code was not found in the official registry."
      });
    }

    if (found.status && (found.status.includes('Fake') || found.status.includes('Invalid'))) {
      return res.json({
        status: "FAKE",
        title: "🚨 COUNTERFEIT FLAGGED",
        data: found,
        message: "Warning! This product batch has been officially blacklisted."
      });
    }

    if (found.status && (found.status.includes('Suspicious') || found.status.includes('Duplicate'))) {
      return res.json({
        status: "SUSPICIOUS",
        title: "⚠️ SUSPICIOUS / DUPLICATE SCAN",
        data: found,
        message: "Duplicate scan limit exceeded. This package code might be duplicated."
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (found.expiry_date < today) {
      return res.json({
        status: "EXPIRED",
        title: "⚠️ EXPIRED MEDICINE",
        data: found,
        message: `Product expired on ${found.expiry_date}. Do not distribute or consume.`
      });
    }

    return res.json({
      status: "AUTHENTIC",
      title: "✅ VERIFIED AUTHENTIC",
      data: found,
      message: "Guaranteed original product and safe for consumption."
    });

  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ status: "ERROR", message: "Server database query failed." });
  }
});

// Report Counterfeit API Route (NEWLY ADDED)
app.post('/api/report', async (req, res) => {
  try {
    const { batch_number, reason, store_location } = req.body;
    console.log("📥 Incoming Report Data:", req.body);

    // Naya report document create karke database mein save karein
    const newReport = new Report({
      batch_number: batch_number || 'UNKNOWN',
      reason: reason || 'Counterfeit / Unverified scan',
      store_location: store_location || 'Not specified',
      reported_at: new Date()
    });

    await newReport.save();
    console.log("✅ Report Saved to MongoDB Atlas successfully!");

    return res.status(201).json({
      status: "SUCCESS",
      message: "Report successfully saved to cloud database."
    });

  } catch (error) {
    console.error("❌ Error Saving Report to DB:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Failed to store report in database."
    });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Server running on http://192.168.1.5:${PORT}`);
});