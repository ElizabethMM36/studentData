const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const db = admin.database();
const studentsRef = db.ref('students');

// ==========================================
// 1. DYNAMIC POST ENDPOINT (Create & Search)
// ==========================================
app.post('/api/students/manage', async (req, res) => {
  const { qType, studentID, city, ...data } = req.body;

  try {
    // 1. SEARCH LOGIC
    if (qType === 'search') {
      let snapshot;
      if (studentID) {
        snapshot = await studentsRef.orderByChild('studentID').equalTo(studentID).once('value');
      } else if (city) {
        snapshot = await studentsRef.orderByChild('city').equalTo(city).once('value');
      } else {
        return res.status(400).json({ error: "Provide studentID or city to search." });
      }
      
      const val = snapshot.val();
      if (!val) return res.status(404).json({ message: "No records found." });
      
      const results = Object.keys(val).map(key => ({ id: key, ...val[key] }));
      return res.status(200).json(results);
    }

    // 2. ADD LOGIC
    if (qType === 'add') {
      if (!studentID || !data.name) return res.status(400).json({ error: "Missing required fields." });
      
      const existing = await studentsRef.orderByChild('studentID').equalTo(studentID).once('value');
      if (existing.exists()) return res.status(400).json({ error: "Student ID already exists." });

      const newRef = studentsRef.push();
      await newRef.set({ studentID, city, ...data });
      return res.status(201).json({ message: "Student added", id: newRef.key });
    }

    // 3. UPDATE LOGIC
    if (qType === 'update') {
      if (!studentID) return res.status(400).json({ error: "studentID required for update." });

      const snapshot = await studentsRef.orderByChild('studentID').equalTo(studentID).once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: "Student not found." });

      const firebaseKey = Object.keys(snapshot.val())[0];
      await studentsRef.child(firebaseKey).update(data);
      
      return res.status(200).json({ message: "Student updated successfully", studentID });
    }

    // 4. DELETE LOGIC
    if (qType === 'delete') {
      if (!studentID) return res.status(400).json({ error: "studentID required for deletion." });

      const snapshot = await studentsRef.orderByChild('studentID').equalTo(studentID).once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: "Student not found." });

      const firebaseKey = Object.keys(snapshot.val())[0];
      await studentsRef.child(firebaseKey).remove();
      
      return res.status(200).json({ message: "Student deleted successfully", studentID });
    }

    // 5. READ ALL LOGIC (MOVED INSIDE TRY)
    if (qType === 'readAll') {
      const snapshot = await studentsRef.once('value');
      const val = snapshot.val();
      if (!val) return res.status(200).json([]);
      const allStudents = Object.keys(val).map(key => ({ id: key, ...val[key] }));
      return res.status(200).json(allStudents);
    }

    // 6. STATS LOGIC (MOVED INSIDE TRY)
    if (qType === 'stats') {
      const snapshot = await studentsRef.once('value');
      const val = snapshot.val();
      if (!val) return res.status(200).json({ totalStudents: 0, cityBreakdown: {} });

      const students = Object.values(val);
      const cityBreakdown = students.reduce((acc, student) => {
        const cityName = student.city || 'Unknown';
        acc[cityName] = (acc[cityName] || 0) + 1;
        return acc;
      }, {});

      return res.status(200).json({
        totalStudents: students.length,
        cityBreakdown,
        timestamp: new Date().toISOString()
      });
    }

    // If NO qType matched at all:
    return res.status(400).json({ error: "Invalid qType provided." });

  } catch (error) {
    // Only send the error response if one hasn't been sent already
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server Error", details: error.message });
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});