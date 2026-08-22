const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mianisback59_db_user:n0dxouZjCQFC1P0k@cluster0.zm6ckjm.mongodb.net/medverify?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 1. Medicine Schema
const medicineSchema = new mongoose.Schema({
  medicine_name: String,
  brand_name: String,
  batch_number: String,
  manufacturing_date: String,
  expiry_date: String,
  qr_hash: String,
  status: { type: String, default: 'AUTHENTIC' }
});

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

// 2. Report Schema
const reportSchema = new mongoose.Schema({
  batch_number: { type: String, required: true },
  reason: { type: String, required: true },
  store_location: { type: String, default: 'Not specified' },
  reported_at: { type: Date, default: Date.now }
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('MedVerify AI Backend API is Running');
});

// Verification API Endpoint (Supports FND-2023-12, 570441, & GS1 Formats)
app.get('/api/verify/:batch', async (req, res) => {
  try {
    const rawInput = decodeURIComponent(req.params.batch).replace(/[\r\n]+/g, '').trim();
    console.log("🔍 Search Request For Batch:", rawInput);

    if (!rawInput || rawInput.length < 2) {
      return res.status(404).json({
        success: false,
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        message: "Invalid or too short batch code entered."
      });
    }

    // Smart GS1 Parsing: Only extracts if string starts with GS1 Prefix (01) & is long
    let targetBatch = rawInput;
    if (rawInput.length > 18 && rawInput.startsWith('01') && rawInput.includes('10')) {
      const gs1Match = rawInput.match(/10([A-Za-z0-9\-]{3,15})(11|17|21|240|$)/);
      if (gs1Match && gs1Match[1]) {
        targetBatch = gs1Match[1];
      }
    }

    const rawInputLower = targetBatch.toLowerCase();
    const cleanInput = targetBatch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Flexible Query Matching
    const allMedicines = await Medicine.find({});
    const found = allMedicines.find(med => {
      const dbBatchRaw = (med.batch_number || '').trim().toLowerCase();
      const dbHashRaw = (med.qr_hash || '').trim().toLowerCase();
      
      const dbClean = dbBatchRaw.replace(/[^a-zA-Z0-9]/g, '');
      const dbHashClean = dbHashRaw.replace(/[^a-zA-Z0-9]/g, '');

      return (
        dbBatchRaw === rawInputLower ||
        dbHashRaw === rawInputLower ||
        dbClean === cleanInput ||
        dbHashClean === cleanInput
      );
    });

    // Handle Unverified / Fake
    if (!found) {
      return res.status(404).json({
        success: false,
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        message: "This batch number was not found in the official registry."
      });
    }

    // Check Blacklisted Status
    const dbStatus = String(found.status || 'AUTHENTIC').toUpperCase();
    if (dbStatus.includes('FAKE') || dbStatus.includes('SUSPICIOUS') || dbStatus.includes('INVALID')) {
      return res.json({
        success: false,
        status: "FAKE",
        title: "🚨 COUNTERFEIT FLAGGED",
        message: "Warning! This product batch has been officially blacklisted.",
        data: {
          medicine_name: found.medicine_name,
          brand_name: found.brand_name,
          batch_number: found.batch_number,
          manufacturing_date: found.manufacturing_date,
          expiry_date: found.expiry_date
        }
      });
    }

    // Expiry Check Logic
    const today = new Date().toISOString().split('T')[0];
    const isExpired = found.expiry_date && found.expiry_date < today;

    return res.json({
      success: true,
      status: isExpired ? "EXPIRED" : "AUTHENTIC",
      title: isExpired ? "⚠️ EXPIRED MEDICINE" : "✅ VERIFIED AUTHENTIC",
      message: isExpired ? `Product expired on ${found.expiry_date}. Do not distribute or consume.` : "Guaranteed original product and safe for consumption.",
      data: {
        medicine_name: found.medicine_name,
        brand_name: found.brand_name,
        batch_number: found.batch_number,
        manufacturing_date: found.manufacturing_date,
        expiry_date: found.expiry_date
      }
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, status: "FAKE", message: "Server error querying database." });
  }
});

// Report Submission Endpoint
app.post('/api/report', async (req, res) => {
  try {
    const { batch_number, reason, store_location } = req.body;

    if (!batch_number || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Batch number and reason are required.'
      });
    }

    const newReport = new Report({
      batch_number,
      reason,
      store_location
    });

    await newReport.save();
    console.log("🚨 Counterfeit Report Saved to MongoDB:", newReport);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully to database.',
      reportId: newReport._id
    });
  } catch (error) {
    console.error("Report saving error:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save report to database.'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));