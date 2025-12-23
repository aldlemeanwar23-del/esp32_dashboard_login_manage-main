import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {

    /* =========================
       POST → استقبال من ESP32
       ========================= */
    if (req.method === 'POST') {
      const { device_id, heartrate, spo2 } = req.body || {};

      if (!device_id || heartrate == null || spo2 == null) {
        return res.status(400).json({
          message: 'Missing sensor data',
          received: req.body
        });
      }

      // القيم المسموحة
      const allowedDevices = ['max1', 'max2', 'max3', 'max4'];

      if (!allowedDevices.includes(device_id)) {
        return res.status(400).json({
          message: 'Invalid device_id (must be max1, max2, max3, max4)',
          received: device_id
        });
      }

      const table = `${device_id}_data`; // max1_data ...

      await sql.unsafe(
        `INSERT INTO ${table} (device_id, heartrate, spo2, time)
         VALUES ($1, $2, $3, NOW())`,
        [device_id, heartrate, spo2]
      );

      return res.status(200).json({
        message: 'Data saved successfully',
        table
      });
    }

    /* =========================
       GET → جلب بيانات للداشبورد
       /api/sensor?device=max1
       ========================= */
    if (req.method === 'GET') {
      const device = req.query.device;

      const allowedDevices = ['max1', 'max2', 'max3', 'max4'];

      if (!allowedDevices.includes(device)) {
        return res.status(400).json({
          message: 'Invalid device (must be max1..max4)'
        });
      }

      const table = `${device}_data`;

      const rows = await sql.unsafe(
        `SELECT device_id, heartrate, spo2, time
         FROM ${table}
         ORDER BY time ASC
         LIMIT 100`
      );

      return res.status(200).json(rows);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      message: 'Server error',
      detail: err.message
    });
  }
}
