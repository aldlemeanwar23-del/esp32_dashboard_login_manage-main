import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { device_id } = req.body;

  if (!device_id) {
    return res.status(400).json({ success: false, error: 'Device ID required' });
  }

  try {
    // نقل البيانات من informations و sensor_data إلى sensor_data_archive
    await sql`
     INSERT INTO "sensor_data_archive" (
        device_id, p_name, ph_no, email, age, checkin_date, checkout_date, heartrate, spo2, timestamp
      )
      SELECT 
        s.device_id, i.p_name, i.ph_no, i.email, i.age, i.checkin_date, i.checkout_date,
        s.heartrate, s.spo2, s.time
      FROM "sensor_data" s
      JOIN "informations" i ON s.device_id = i.device_id
      WHERE s.device_id = ${device_id}
    `;

    // حذف البيانات بعد النقل (اختياري)
    await sql`DELETE FROM "sensor_data" WHERE device_id = ${device_id}`;
    await sql`DELETE FROM "informations" WHERE device_id = ${device_id}`;

    res.json({ success: true });
  } catch (error) {
    console.error('Archive error:', error);
    res.status(500).json({ success: false, error: 'Archive failed' });
  }
}
