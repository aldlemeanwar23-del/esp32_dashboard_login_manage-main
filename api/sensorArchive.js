// server.js أو api.js
const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db'); // اتصالك بقاعدة البيانات (مثلاً MySQL/PostgreSQL)

app.use(cors());
app.use(express.json());

// Endpoint لإرجاع جميع بيانات الـ sensor_data لجهاز معين
app.get('/api/sensorData', async (req, res) => {
  const device = req.query.device;
  if(!device) return res.status(400).json({error: 'Device ID required'});

  try {
    // جلب جميع البيانات من جدول sensor_data المرتبطة بالجهاز
    const [rows] = await pool.query(
      `SELECT time AS timestamp, heartrate, spo2, temperature, blood_pressure
       FROM sensor_data
       WHERE device_id = ?
       ORDER BY time ASC`, [device]
    );

    // إعادة البيانات كـ JSON
    res.json(rows);

  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'Server error'});
  }
});

// مثال لبدء السيرفر
app.listen(3000, () => console.log('Server running on port 3000'));
