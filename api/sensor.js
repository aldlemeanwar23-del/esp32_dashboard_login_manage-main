import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { device } = req.query;

  // ✅ تحقق صحيح من اسم الجهاز
  const allowedDevices = ['max1', 'max2', 'max3', 'max4'];

  if (!allowedDevices.includes(device)) {
    return res.status(400).json({
      message: 'Invalid device (must be max1..max4)'
    });
  }

  // ✅ ربط device بالجدول الصحيح
  const tableMap = {
    max1: 'max1_data',
    max2: 'max2_data',
    max3: 'max3_data',
    max4: 'max4_data'
  };

  const table = tableMap[device];

  try {
    const { rows } = await pool.query(`
      SELECT device_id, heartrate, spo2, time
      FROM ${table}
      ORDER BY time ASC
      LIMIT 100
    `);

    res.status(200).json(rows);

  } catch (err) {
    console.error('DB ERROR:', err);
    res.status(500).json({ message: 'Database error' });
  }
}
