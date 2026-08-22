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

// Medicine Schema
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

// Base Route
app.get('/', (req, res) => {
  res.status(200).send('✅ Backend Server is Running Successfully!');
});

// Verification API Route with Database Check
app.get('/api/verify/:batch', async (req, res) => {
  try {
    let rawInput = decodeURIComponent(req.params.batch).replace(/[\r\n]+/g, '').trim();
    console.log("🔍 Search Request For Batch:", rawInput);

    if (!rawInput || rawInput.length < 2) {
      return res.status(404).json({
        success: false,
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        message: "Invalid or too short batch code entered."
      });
    }

    let targetBatch = rawInput;
    if (rawInput.includes('10')) {
      const gs1Match = rawInput.match(/10([A-Za-z0-9\-]{3,12}?)(11|17|21|240|[A-Za-z\s\/]|$)/);
      if (gs1Match && gs1Match[1]) {
        targetBatch = gs1Match[1];
      }
    }

    const rawInputLower = targetBatch.toLowerCase();
    const cleanInput = targetBatch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Query MongoDB Database
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
        dbHashClean === cleanInput ||
        rawInput.toLowerCase().includes(dbClean)
      );
    });

    if (!found) {
      return res.status(404).json({
        success: false,
        status: "FAKE",
        title: "🚨 UNVERIFIED / COUNTERFEIT",
        message: "This batch number was not found in the official registry."
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

// Vercel deployment ke liye export zaroori hai
module.exports = app;