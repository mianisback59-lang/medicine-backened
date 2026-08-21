const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

// Username set kar diya gaya hai
const MONGO_URI = "mongodb+srv://mianisback59_db_user:n0dxouZjCQFC1P0k@cluster0.zm6ckjm.mongodb.net/medverify?retryWrites=true&w=majority&appName=Cluster0";

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

const medicinesDatabase = [
  {"id": 1, "medicine_name": "Panadol Extra 500mg", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "PND-2025-01", "manufacturing_date": "2025-01-10", "expiry_date": "2027-01-10", "qr_hash": "a1b2c3d4e5f6g7h8", "status": "Authentic / Valid"},
  {"id": 2, "medicine_name": "Brufen 400mg", "brand_name": "Abbott Laboratories", "batch_number": "BRF-2024-88", "manufacturing_date": "2024-05-15", "expiry_date": "2026-05-15", "qr_hash": "x9y8z7w6v5u4t3s2", "status": "Expired Batch"},
  {"id": 3, "medicine_name": "Augmentin 625mg", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "AUG-2026-12", "manufacturing_date": "2026-02-01", "expiry_date": "2028-02-01", "qr_hash": "m1n2o3p4q5r6s7t8", "status": "Authentic / Valid"},
  {"id": 4, "medicine_name": "Arinac Forte", "brand_name": "Abbott Laboratories", "batch_number": "ARN-2023-05", "manufacturing_date": "2023-03-20", "expiry_date": "2025-03-20", "qr_hash": "k9j8h7g6f5d4s3a2", "status": "Expired Batch"},
  {"id": 5, "medicine_name": "Disprin 300mg", "brand_name": "Reckitt Benckiser", "batch_number": "DSP-2025-99", "manufacturing_date": "2025-08-11", "expiry_date": "2027-08-11", "qr_hash": "q1w2e3r4t5y6u7i8", "status": "Authentic / Valid"},
  {"id": 6, "medicine_name": "Flagyl 400mg", "brand_name": "Sanofi", "batch_number": "FLG-2025-44", "manufacturing_date": "2025-11-01", "expiry_date": "2027-11-01", "qr_hash": "z1x2c3v4b5n6m7q8", "status": "Authentic / Valid"},
  {"id": 7, "medicine_name": "Risek 20mg", "brand_name": "Getz Pharma", "batch_number": "RSK-2024-19", "manufacturing_date": "2024-01-15", "expiry_date": "2026-01-15", "qr_hash": "p9o8i7u6y5t4r3e2", "status": "Expired Batch"},
  {"id": 8, "medicine_name": "Softin 10mg", "brand_name": "Ferozsons Laboratories", "batch_number": "SFT-2026-03", "manufacturing_date": "2026-04-10", "expiry_date": "2028-04-10", "qr_hash": "l1k2j3h4g5f6d7s8", "status": "Authentic / Valid"},
  {"id": 9, "medicine_name": "Calpol 120mg/5ml", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "CLP-2025-09", "manufacturing_date": "2025-03-12", "expiry_date": "2027-03-12", "qr_hash": "c9a8l7p6o5l4m3n2", "status": "Authentic / Valid"},
  {"id": 10, "medicine_name": "Ponstan 250mg", "brand_name": "Pfizer", "batch_number": "PNS-2024-11", "manufacturing_date": "2024-02-10", "expiry_date": "2026-02-10", "qr_hash": "p7f6i5z4e3r2p1n0", "status": "Expired Batch"},
  {"id": 11, "medicine_name": "Surbex-Z", "brand_name": "Abbott Laboratories", "batch_number": "SBX-2026-01", "manufacturing_date": "2026-01-05", "expiry_date": "2028-01-05", "qr_hash": "s8u7r6b5e4x3z210", "status": "Authentic / Valid"},
  {"id": 12, "medicine_name": "Glucophage 500mg", "brand_name": "Merck", "batch_number": "GLC-2025-67", "manufacturing_date": "2025-06-18", "expiry_date": "2027-06-18", "qr_hash": "g5l4u3c2o1p0h9a8", "status": "Authentic / Valid"},
  {"id": 13, "medicine_name": "Loprin 75mg", "brand_name": "Highnoon Laboratories", "batch_number": "LPR-2025-33", "manufacturing_date": "2025-09-01", "expiry_date": "2027-09-01", "qr_hash": "l9o8p7r6i5n4m3k2", "status": "Authentic / Valid"},
  {"id": 14, "medicine_name": "Avelox 400mg", "brand_name": "Bayer", "batch_number": "AVL-2024-02", "manufacturing_date": "2024-04-01", "expiry_date": "2026-04-01", "qr_hash": "a1v2e3l4o5x6b7y8", "status": "Expired Batch"},
  {"id": 15, "medicine_name": "Klaricid 250mg", "brand_name": "Abbott Laboratories", "batch_number": "KLR-2026-05", "manufacturing_date": "2026-03-14", "expiry_date": "2028-03-14", "qr_hash": "k7l6a5r4i3c2i1d0", "status": "Authentic / Valid"},
  {"id": 16, "medicine_name": "Zyrtec 10mg", "brand_name": "UCB Pharma", "batch_number": "ZYR-2025-14", "manufacturing_date": "2025-05-20", "expiry_date": "2027-05-20", "qr_hash": "z9y8r7t6e5c4u3b2", "status": "Authentic / Valid"},
  {"id": 17, "medicine_name": "Invermic 6mg", "brand_name": "Hilton Pharma", "batch_number": "INV-2025-88", "manufacturing_date": "2025-10-10", "expiry_date": "2027-10-10", "qr_hash": "i1n2v3e4r5m6i7c8", "status": "Authentic / Valid"},
  {"id": 18, "medicine_name": "Nuberol Forte", "brand_name": "Searle Company", "batch_number": "NUB-2024-90", "manufacturing_date": "2024-06-01", "expiry_date": "2026-06-01", "qr_hash": "n8u7b6e5r4o3l2f1", "status": "Expired Batch"},
  {"id": 19, "medicine_name": "Avil 25mg", "brand_name": "Sanofi", "batch_number": "AVL-2026-77", "manufacturing_date": "2026-05-11", "expiry_date": "2028-05-11", "qr_hash": "a9v8i7l6s5a4n3o2", "status": "Authentic / Valid"},
  {"id": 20, "medicine_name": "Cefspan 400mg", "brand_name": "Barrett Hodgson", "batch_number": "CFS-2025-52", "manufacturing_date": "2025-07-22", "expiry_date": "2027-07-22", "qr_hash": "c1e2f3s4p5a6n7b8", "status": "Authentic / Valid"},
  {"id": 21, "medicine_name": "Tenormin 50mg", "brand_name": "AstraZeneca", "batch_number": "TNR-2025-10", "manufacturing_date": "2025-02-15", "expiry_date": "2027-02-15", "qr_hash": "t0e9n8o7r6m5i4n3", "status": "Authentic / Valid"},
  {"id": 22, "medicine_name": "Xanax 0.5mg", "brand_name": "Pfizer", "batch_number": "XNX-2024-09", "manufacturing_date": "2024-01-10", "expiry_date": "2026-01-10", "qr_hash": "x1a2n3a4x5p6f7z8", "status": "Expired Batch"},
  {"id": 23, "medicine_name": "Gravinate 50mg", "brand_name": "Searle Company", "batch_number": "GRV-2026-02", "manufacturing_date": "2026-02-28", "expiry_date": "2028-02-28", "qr_hash": "g9r8a7v6i5n4a3t2", "status": "Authentic / Valid"},
  {"id": 24, "medicine_name": "Hydryllin Syrup", "brand_name": "Searle Company", "batch_number": "HDR-2025-41", "manufacturing_date": "2025-04-18", "expiry_date": "2027-04-18", "qr_hash": "h1y2d3r4y5l6l7i8", "status": "Authentic / Valid"},
  {"id": 25, "medicine_name": "Entamizole", "brand_name": "Abbott Laboratories", "batch_number": "ENT-2025-19", "manufacturing_date": "2025-08-05", "expiry_date": "2027-08-05", "qr_hash": "e9n8t7a6m5i4z3o2", "status": "Authentic / Valid"},
  {"id": 26, "medicine_name": "Suncarb 100mg", "brand_name": "CCL Pharmaceuticals", "batch_number": "SNC-2024-30", "manufacturing_date": "2024-03-12", "expiry_date": "2026-03-12", "qr_hash": "s1u2n3c4a5r6b7c8", "status": "Expired Batch"},
  {"id": 27, "medicine_name": "Synflex 550mg", "brand_name": "Martin Dow", "batch_number": "SYN-2026-08", "manufacturing_date": "2026-01-20", "expiry_date": "2028-01-20", "qr_hash": "s9y8n7f6l5e4x3m2", "status": "Authentic / Valid"},
  {"id": 28, "medicine_name": "Ventolin Inhaler", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "VNT-2025-78", "manufacturing_date": "2025-09-15", "expiry_date": "2027-09-15", "qr_hash": "v1e2n3t4o5l6i7n8", "status": "Authentic / Valid"},
  {"id": 29, "medicine_name": "Voltaren 50mg", "brand_name": "Novartis", "batch_number": "VLT-2025-13", "manufacturing_date": "2025-06-30", "expiry_date": "2027-06-30", "qr_hash": "v9o8l7t6a5r4e3n2", "status": "Authentic / Valid"},
  {"id": 30, "medicine_name": "Norvasc 5mg", "brand_name": "Pfizer", "batch_number": "NRV-2024-55", "manufacturing_date": "2024-07-14", "expiry_date": "2026-07-14", "qr_hash": "n1o2r3v4a5s6c7p8", "status": "Expired Batch"},
  {"id": 31, "medicine_name": "Nexum 40mg", "brand_name": "Getz Pharma", "batch_number": "NXM-2026-11", "manufacturing_date": "2026-03-01", "expiry_date": "2028-03-01", "qr_hash": "n9e8x7u6m5g4t3z2", "status": "Authentic / Valid"},
  {"id": 32, "medicine_name": "Amoxil 500mg", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "AMX-2025-64", "manufacturing_date": "2025-10-25", "expiry_date": "2027-10-25", "qr_hash": "a1m2o3x4i5l6g7s8", "status": "Authentic / Valid"},
  {"id": 33, "medicine_name": "Lipiget 10mg", "brand_name": "Getz Pharma", "batch_number": "LPG-2025-03", "manufacturing_date": "2025-02-18", "expiry_date": "2027-02-18", "qr_hash": "l9i8p7g6t5e4z3p2", "status": "Authentic / Valid"},
  {"id": 34, "medicine_name": "Capotec 25mg", "brand_name": "GSK (GlaxoSmithKline)", "batch_number": "CPT-2024-18", "manufacturing_date": "2024-02-20", "expiry_date": "2026-02-20", "qr_hash": "c1a2p3o4t5e6c7g8", "status": "Expired Batch"},
  {"id": 35, "medicine_name": "Co-Diovan 160/12.5mg", "brand_name": "Novartis", "batch_number": "CDV-2026-04", "manufacturing_date": "2026-04-05", "expiry_date": "2028-04-05", "qr_hash": "c9o8d7i6v5a4n3n2", "status": "Authentic / Valid"},
  {"id": 36, "medicine_name": "Spasler P", "brand_name": "Highnoon Laboratories", "batch_number": "SPS-2025-27", "manufacturing_date": "2025-05-12", "expiry_date": "2027-05-12", "qr_hash": "s1p2a3s4l5e6r7p8", "status": "Authentic / Valid"},
  {"id": 37, "medicine_name": "Phloroglucinol (Spasfon)", "brand_name": "Hilton Pharma", "batch_number": "SPF-2025-91", "manufacturing_date": "2025-11-20", "expiry_date": "2027-11-20", "qr_hash": "p9h8l7o6r5g4l3u2", "status": "Authentic / Valid"},
  {"id": 38, "medicine_name": "Eziday 50mg", "brand_name": "Highnoon Laboratories", "batch_number": "EZY-2024-62", "manufacturing_date": "2024-05-01", "expiry_date": "2026-05-01", "qr_hash": "e1z2i3d4a5y6h7n8", "status": "Expired Batch"},
  {"id": 39, "medicine_name": "Lafana 5mg", "brand_name": "Sami Pharmaceuticals", "batch_number": "LFN-2026-09", "manufacturing_date": "2026-02-12", "expiry_date": "2028-02-12", "qr_hash": "l9a8f7a6n5a4s3m2", "status": "Authentic / Valid"},
  {"id": 40, "medicine_name": "Avomine 25mg", "brand_name": "Sanofi", "batch_number": "AVM-2025-16", "manufacturing_date": "2025-03-28", "expiry_date": "2027-03-28", "qr_hash": "a1v2o3m4i5n6e7s8", "status": "Authentic / Valid"},
  {"id": 41, "medicine_name": "Fake Panadol Pack", "brand_name": "Unverified Generic", "batch_number": "FK-0001-99", "manufacturing_date": "2025-01-01", "expiry_date": "2027-01-01", "qr_hash": "0000000000000001", "status": "Fake / Invalid Hash"},
  {"id": 42, "medicine_name": "Counterfeit Augmentin", "brand_name": "Unknown Local Lab", "batch_number": "FK-0002-88", "manufacturing_date": "2025-06-01", "expiry_date": "2027-06-01", "qr_hash": "9999999999999999", "status": "Fake / Invalid Hash"},
  {"id": 43, "medicine_name": "Copied Risek 20mg", "brand_name": "Getz Pharma", "batch_number": "RSK-2024-19", "manufacturing_date": "2024-01-15", "expiry_date": "2026-01-15", "qr_hash": "p9o8i7u6y5t4r3e2", "status": "Suspicious / Duplicate Scan Limit Exceeded"},
  {"id": 44, "medicine_name": "Copied Brufen 400mg", "brand_name": "Abbott Laboratories", "batch_number": "BRF-2024-88", "manufacturing_date": "2024-05-15", "expiry_date": "2026-05-15", "qr_hash": "x9y8z7w6v5u4t3s2", "status": "Suspicious / Duplicate Scan Limit Exceeded"},
  {"id": 45, "medicine_name": "Cloran xen 250mg", "brand_name": "Pfizer", "batch_number": "CLR-2025-07", "manufacturing_date": "2025-04-10", "expiry_date": "2027-04-10", "qr_hash": "c8l7r6x5n4p3f2z1", "status": "Authentic / Valid"},
  {"id": 46, "medicine_name": "Tylenol Extra Strength", "brand_name": "Kenvue / McNeil", "batch_number": "TYL-2025-81", "manufacturing_date": "2025-08-20", "expiry_date": "2027-08-20", "qr_hash": "t1y2l3e4n5o6l7m8", "status": "Authentic / Valid"},
  {"id": 47, "medicine_name": "Advil 200mg", "brand_name": "Haleon", "batch_number": "ADV-2024-10", "manufacturing_date": "2024-01-05", "expiry_date": "2026-01-05", "qr_hash": "a8d7v6i5l4h3l2e1", "status": "Expired Batch"},
  {"id": 48, "medicine_name": "Zantac 150mg", "brand_name": "Sanofi", "batch_number": "ZNT-2026-02", "manufacturing_date": "2026-02-14", "expiry_date": "2028-02-14", "qr_hash": "z1a2n3t4a5c6s7n8", "status": "Authentic / Valid"},
  {"id": 49, "medicine_name": "Allegra 120mg", "brand_name": "Sanofi", "batch_number": "ALG-2025-39", "manufacturing_date": "2025-07-01", "expiry_date": "2027-07-01", "qr_hash": "a9l8l7e6g5r4a3s2", "status": "Authentic / Valid"},
  {"id": 50, "medicine_name": "Pepto-Bismol Chewable", "brand_name": "Procter & Gamble", "batch_number": "PPT-2026-01", "manufacturing_date": "2026-03-30", "expiry_date": "2028-03-30", "qr_hash": "p1e2p3t4o5b6m7p8", "status": "Authentic / Valid"},
  {
  id: 51,
  medicine_name: "Quinodex Ear/D 5ml",
  brand_name: "Atco Laboratories",
  batch_number: "510902",
  manufacturing_date: "2025-07-23",
  expiry_date: "2027-07-22",
  qr_hash: "0108964001646716105109021125072317270722240Quinodex Ear/D 5ml",
  status: "Authentic / Valid"
}
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas Cloud Database...');
    
    await Medicine.deleteMany({});
    console.log('Old local data has been cleared.');

    await Medicine.insertMany(medicinesDatabase);
    console.log('50 Medicines dataset has been successfully uploaded to MongoDB Atlas!');

    process.exit();
  } catch (err) {
    console.error('​An error occurred while uploading data:', err);
    process.exit(1);
  }
}

seedData();
