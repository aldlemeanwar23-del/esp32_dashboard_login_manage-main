import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const { device } = req.query;

  const allowed = ['max1', 'max2', 'max3', 'max4'];
  if (!allowed.includes(device)) {
    return res.status(400).json({
      message: 'Invalid device (must be max1..max4)'
    });
  }

  const tableMap = {
    max1: 'max1_data',
    max2: 'max2_data',
    max3: 'max3_data',
    max4: 'max4_data'
  };

  try {
    const table = tableMap[device];

    const rows = await sql(`
      SELECT device_id, heartrate, spo2, time
      FROM ${sql(table)}
      ORDER BY time ASC
      LIMIT 100
    `);

    res.status(200).json(rows);

  } catch (err) {
    console.error('NEON ERROR:', err);
    res.status(500).json({
      message: 'Server error',
      detail: err.message
    });
  }
}
