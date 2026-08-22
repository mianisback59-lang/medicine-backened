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

app.get('/', (req, res) => {
  res.send('✅ Backend Server is Running Successfully!');
});

// 1. Medicine Schema & Model
const medicineSchema = new mongoose.Schema({
  id: Number,
  medicine_name: String,
  brand_name: String,
  batch_number: String,
  manufacturing_date: String,
  expiry_date: String,
  qr_hash: String,
  status: String,
  image_url: String
});

const Medicine = mongoose.model('Medicine', medicineSchema);

// 2. Report Schema & Model
const reportSchema = new mongoose.Schema({
  batch_number: { type: String, required: true },
  reason: { type: String, default: 'Counterfeit / Unverified scan' },
  store_location: { type: String, default: 'Not specified' },
  reported_at: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Normalization helper (hyphens aur special characters remove karke lowercasing)
const normalize = (str) => String(str || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Smart Verification Route
app.get('/api/verify/:batch', async (req, res) => {
  try {
    const rawInput = decodeURIComponent(req.params.batch).replace(/[\r\n]+/g, '').trim();
    const cleanInput = normalize(rawInput);
    
    console.log("🔍 Search Received - Raw:", rawInput, "| Clean:", cleanInput);

    if (!cleanInput) {
      return res.status(400).json({
        success: false,
        status: "FAKE",
        title: "🚨 INVALID CODE",
        message: "Scanned text or batch code is empty."
      });
    }

    const allMedicines = await Medicine.find({});

    // Precise Matching Engine for GS1 QR Strings & Manual Inputs
    let found = allMedicines.find(med => {
      const dbBatchClean = normalize(med.batch_number);
      const dbHashClean = normalize(med.qr_hash);

      // 1. Direct/Exact Match on Batch or Hash
      if (dbBatchClean && cleanInput === dbBatchClean) return true;
      if (dbHashClean && cleanInput === dbHashClean) return true;

      // 2. Scanned QR String Contains DB Batch/Hash
      if (cleanInput.length > 5) {
        if (dbBatchClean && dbBatchClean.length >= 3 && cleanInput.includes(dbBatchClean)) return true;
        if (dbHashClean && dbHashClean.length >= 5 && cleanInput.includes(dbHashClean)) return true;
      }

      return false;
    });

    // Code Database me na hone par FAKE Status return karega
    if (!found) {
      console.log("❌ Result: NOT FOUND in Registry");
      return res.status(404).json({
        success: false,
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        batchNumber: rawInput,
        message: "This batch number or scanned QR code was not found in the official registry."
      });
    }

    console.log(`🎯 Result: FOUND -> ${found.medicine_name} (${found.batch_number})`);

    const dbStatus = String(found.status || '').toLowerCase();

    // Blacklisted / Fake Status Check
    if (dbStatus.includes('fake') || dbStatus.includes('invalid') || dbStatus.includes('counterfeit')) {
      return res.json({
        success: false,
        status: "FAKE",
        title: "🚨 COUNTERFEIT FLAGGED",
        batchNumber: found.batch_number || rawInput,
        data: found,
        message: "Warning! This product batch has been blacklisted in database."
      });
    }

    // Expiry Date Check
    const today = new Date().toISOString().split('T')[0];
    if (found.expiry_date && found.expiry_date < today) {
      return res.json({
        success: true,
        status: "EXPIRED",
        title: "⚠️ EXPIRED MEDICINE",
        batchNumber: found.batch_number || rawInput,
        data: found,
        message: `Product expired on ${found.expiry_date}. Do not consume.`
      });
    }

    // Authentic Response
    return res.json({
      success: true,
      status: "AUTHENTIC",
      title: "✅ VERIFIED AUTHENTIC",
      batchNumber: found.batch_number || rawInput,
      data: found,
      message: "Guaranteed original product and safe for consumption."
    });

  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ success: false, status: "ERROR", message: "Server database query failed." });
  }
});

// Report Counterfeit API Route
app.post('/api/report', async (req, res) => {
  try {
    const { batch_number, reason, store_location } = req.body;
    console.log("📥 Storing Report in DB:", req.body);

    const newReport = new Report({
      batch_number: batch_number || 'UNKNOWN',
      reason: reason || 'Counterfeit / Unverified scan',
      store_location: store_location || 'Not specified',
      reported_at: new Date()
    });

    await newReport.save();
    console.log("✅ Report Saved to MongoDB Atlas!");

    return res.status(201).json({
      success: true,
      status: "SUCCESS",
      message: "Report saved successfully in database."
    });

  } catch (error) {
    console.error("❌ Error Saving Report:", error);
    return res.status(500).json({
      success: false,
      status: "ERROR",
      message: "Failed to save report in database."
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;