// sensorArchive.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // استبدل بموديل قاعدة البيانات الخاص بك
const ExcelJS = require('exceljs');

/**
 * GET /api/sensorArchive?device=DEVICE_ID
 * يرجع ملف Excel يحتوي على جميع بيانات المستشعر للجهاز
 */
router.get('/', async (req, res) => {
  const device = req.query.device;
  if (!device) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  try {
    // جلب البيانات من جدول sensor_data_archive
    const [rows] = await db.execute(
      `SELECT id, device_id, heartrate, spo2, timestamp
       FROM sensor_data_archive
       WHERE device_id = ?
       ORDER BY timestamp ASC`,
      [device]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No archive data found for this device' });
    }

    // إنشاء ملف Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sensor Data');

    // إنشاء رأس الجدول
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Device ID', key: 'device_id', width: 15 },
      { header: 'Heart Rate', key: 'heartrate', width: 15 },
      { header: 'SpO₂', key: 'spo2', width: 10 },
      { header: 'Timestamp', key: 'timestamp', width: 25 },
    ];

    // إضافة الصفوف
    rows.forEach(row => {
      sheet.addRow({
        id: row.id,
        device_id: row.device_id,
        heartrate: row.heartrate,
        spo2: row.spo2,
        timestamp: row.timestamp,
      });
    });

    // إعداد الهيدر للتحميل
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sensor_archive_${device}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // إرسال الملف مباشرة
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error exporting sensor archive to Excel:', err);
    res.status(500).json({ error: 'Failed to export sensor archive' });
  }
});

module.exports = router;
