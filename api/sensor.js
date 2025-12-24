import { neon } from '@neondatabase/serverless';

// الاتصال بقاعدة البيانات
const client = new neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const allowedDevices = ['max1','max2','max3','max4'];

    // ======== POST: استقبال بيانات الحساس ========
    if (req.method === 'POST') {
      const { device_id, heartrate, spo2 } = req.body || {};

      // تحقق من وجود جميع القيم
      if (!device_id || heartrate == null || spo2 == null) {
        return res.status(400).json({
          message: 'Missing sensor data',
          received: req.body
        });
      }

      // تحقق من صحة device_id
      if (!allowedDevices.includes(device_id)) {
        return res.status(400).json({
          message: 'Invalid device (must be max1..max4)',
          received: device_id
        });
      }

      // تحقق من أنواع البيانات
      if (typeof heartrate !== 'number' || typeof spo2 !== 'number') {
        return res.status(400).json({
          message: 'Invalid data types (heartrate & spo2 must be numbers)',
          received: req.body
        });
      }
console.log('POST Data:', { device_id, heartrate, spo2 });

      // إدخال البيانات بأمان
      try {
        await client.unsafe(
          `INSERT INTO ${device_id}_data (device_id, heartrate, spo2, time)
           VALUES ($1,$2,$3,NOW())`,
          [device_id, heartrate, spo2]
        );
      } catch (dbErr) {
        console.error('Database Insert Error:', dbErr);
        return res.status(500).json({
          message: 'Database error while inserting data',
          detail: dbErr.message
        });
      }

      return res.status(200).json({ message: 'Data saved successfully' });
    }

    // ======== GET: جلب بيانات الحساس ========
    if (req.method === 'GET') {
      const device = (req.query.device || '').toLowerCase();

      // تحقق من صحة الجهاز
      if (!allowedDevices.includes(device)) {
        return res.status(400).json({
          message: 'Invalid device (must be max1..max4)',
          received: device
        });
      }

      try {
        const result = await client.unsafe(
          `SELECT device_id, heartrate, spo2, time
           FROM ${device}_data
           ORDER BY time ASC
           LIMIT 100`
        );
        return res.status(200).json(result);
      } catch (dbErr) {
        console.error('Database Select Error:', dbErr);
        return res.status(500).json({
          message: 'Database error while fetching data',
          detail: dbErr.message
        });
      }
    }

    // طريقة غير مسموح بها
    return res.status(405).json({ message: 'Method not allowed' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      message: 'Server error',
      detail: err.message
    });
  }
}
