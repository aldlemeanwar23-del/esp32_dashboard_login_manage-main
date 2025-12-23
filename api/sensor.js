import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {

    /* =========================
       POST → استقبال من ESP32
       ========================= */
    if (req.method === 'POST') {
      const { device_id, heartrate, spo2 } = req.body || {};

      // التحقق من البيانات
      if (
        !device_id ||
        heartrate == null ||
        spo2 == null
      ) {
        return res.status(400).json({
          message: 'Missing sensor data',
          received: req.body
        });
      }

      if (![1, 2, 3, 4].includes(Number(device_id))) {
        return res.status(400).json({
          message: 'Invalid device_id (must be 1–4)'
        });
      }

      const table = `max${device_id}_data`;

      // الإدخال
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
       /api/sensor?device=1
       ========================= */
    if (req.method === 'GET') {
      const device = Number(req.query.device);

      if (![1, 2, 3, 4].includes(device)) {
        return res.status(400).json({
          message: 'Invalid or missing device number'
        });
      }

      const table = `max${device}_data`;

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
