import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const allowedDevices = ['max1','max2','max3','max4'];

    if (req.method === 'POST') {
      const { device_id, heartrate, spo2 } = req.body || {};

      if (!device_id || heartrate == null || spo2 == null) {
        return res.status(400).json({ message:'Missing data', received:req.body });
      }

      if (!allowedDevices.includes(device_id)) {
        return res.status(400).json({ message:'Invalid device (must be max1..max4)', received:device_id });
      }

      await sql.unsafe(
        `INSERT INTO ${device_id}_data (device_id, heartrate, spo2, time)
         VALUES ($1,$2,$3,NOW())`,
        [device_id, heartrate, spo2]
      );

      return res.status(200).json({ message:'Data saved successfully' });
    }

   /* if (req.method === 'GET') {
      const device = (req.query.device || '').toLowerCase();
      if (!allowedDevices.includes(device)) {
        return res.status(400).json({ message:'Invalid device (must be max1..max4)' });
      }

      const rows = await sql.unsafe(
        `SELECT device_id, heartrate, spo2, time
         FROM ${device}_data
         ORDER BY time ASC
         LIMIT 100`
      );

      return res.status(200).json(rows);
    }

    return res.status(405).json({ message:'Method not allowed' });*/
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message:'Server error', detail: err.message });
  }
}
