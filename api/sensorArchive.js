// sensorArchive.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // استبدل هذا بموديل قاعدة البيانات الخاص بك

/**
 * GET /api/sensorArchive?device=DEVICE_ID
 * ترجع جميع بيانات المستشعر للجهاز من جدول sensor_data_archive
 */
router.get('/', async (req, res) => {
  const device = req.query.device;
  if (!device) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, device_id, heartrate, spo2, timestamp
       FROM sensor_data_archive
       WHERE device_id = ?
       ORDER BY timestamp ASC`,
      [device]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching sensor archive:', err);
    res.status(500).json({ error: 'Failed to fetch sensor archive' });
  }
});

module.exports = router;
