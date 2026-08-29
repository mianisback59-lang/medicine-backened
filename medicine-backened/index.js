require('dotenv').config();
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Resend } = require('resend'); // Resend Added

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Resend with API Key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

// MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI;

// Serverless connection caching
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  cachedDb = await mongoose.connect(MONGO_URI, { bufferCommands: false });
  return cachedDb;
}

// 1. Medicine Schema
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

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);

// 2. Report Schema
const reportSchema = new mongoose.Schema({
  batch_number: { type: String, required: true },
  reason: { type: String, required: true },
  store_location: { type: String, default: 'Not specified' },
  reported_at: { type: Date, default: Date.now }
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

// 3. User Schema (added resetCode field)
const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetCode: { type: String }, // OTP store karne ke liye
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- ROUTES ---

app.get('/', (req, res) => {
  res.status(200).send('✅ MedVerify AI Backend API is Running Successfully!');
});

// --- AUTHENTICATION ROUTES ---

// Register Endpoint
app.post('/api/register', async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const newUser = new User({
      name: name ? name.trim() : '',
      email: email.toLowerCase().trim(),
      password: password.trim()
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token: newUser._id.toString()
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== password.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: user._id.toString()
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Forgot Password Endpoint (Updated to use Resend API)
app.post('/api/forgot-password', async (req, res) => {
  try {
    await connectToDatabase();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address.' 
      });
    }

    // 6-Digit Security OTP Code Generate
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Database mein code store karna
    user.resetCode = resetCode;
    await user.save();

    // Send email using Resend API (English Template)
    await resend.emails.send({
      from: 'MedVerify AI <onboarding@resend.dev>',
      to: cleanEmail,
      subject: 'Password Reset Request - MedVerify AI',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0A0F1D; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #3B82F6;">MedVerify AI</h2>
          <p>Hi ${user.name || 'User'},</p>
          <p>You have requested to reset your password.</p>
          <p>Your 6-digit Security Verification Code is:</p>
          <div style="background-color: #1E293B; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #60A5FA;">${resetCode}</span>
          </div>
          <p style="color: #94A3B8; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Password reset code sent to ${cleanEmail}`
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: 'Failed to send email. Please check Resend API key.' });
  }
});

// Confirm Reset OTP & Update New Password Endpoint
app.post('/api/reset-password-confirm', async (req, res) => {
  try {
    await connectToDatabase();
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.resetCode || user.resetCode !== code.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Password Update & Clear OTP Code
    user.password = newPassword.trim();
    user.resetCode = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in.'
    });

  } catch (error) {
    console.error("Reset Confirm Error:", error);
    return res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
});

// Verification API Endpoint
app.get('/api/verify/:batch', async (req, res) => {
  try {
    await connectToDatabase();

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

    let targetBatch = rawInput;

    if (rawInput.includes('10')) {
      const gs1Match = rawInput.match(/10([A-Za-z0-9\-]{3,12}?)(11|17|21|240|[A-Za-z\s\/]|$)/);
      if (gs1Match && gs1Match[1]) {
        targetBatch = gs1Match[1];
      }
    }

    const rawInputLower = targetBatch.toLowerCase();
    const cleanInput = targetBatch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

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

    const dbStatus = String(found.status || '').toLowerCase();
    if (dbStatus.includes('fake') || dbStatus.includes('invalid') || dbStatus.includes('counterfeit')) {
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
    await connectToDatabase();
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;