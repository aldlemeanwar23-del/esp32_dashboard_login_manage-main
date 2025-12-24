import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const allowedDevices = ['max1','max2','max3','max4'];

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { device_id, heartrate, spo2 } = req.body || {};
      console.log('POST Data:', { device_id, heartrate, spo2 });

      if (!device_id || heartrate == null || spo2 == null) {
        return res.status(400).json({ message:'Missing sensor data', received:req.body });
      }
      if (!allowedDevices.includes(device_id)) {
        return res.status(400).json({ message:'Invalid device (must be max1..max4)', received:device_id });
      }
      if (typeof heartrate !== 'number' || typeof spo2 !== 'number') {
        return res.status(400).json({ message:'heartrate & spo2 must be numbers', received:req.body });
      }

      try {
        await sql.unsafe(`
          INSERT INTO ${device_id}_data (device_id, heartrate, spo2, time)
          VALUES ($1,$2,$3,NOW())
        `, [device_id, heartrate, spo2]);
        console.log('DB Insert Success:', device_id);
        return res.status(200).json({ message:'Data saved successfully' });
      } catch(dbErr) {
        console.error('DB Insert Error:', dbErr);
        return res.status(500).json({ message:'Database insert failed', detail:dbErr.message });
      }
    }

    else if (req.method === 'GET') {
      const device = (req.query.device || '').toLowerCase();
      console.log('GET Device:', device);

      if (!allowedDevices.includes(device)) {
        return res.status(400).json({ message:'Invalid device (must be max1..max4)', received:device });
      }

      try {
        const rows = await sql.unsafe(`
          SELECT device_id, heartrate, spo2, time
          FROM ${device}_data
          ORDER BY time ASC
          LIMIT 100
        `);
        console.log('DB Select Success:', device, 'rows:', rows.length);
        return res.status(200).json(rows);
      } catch(dbErr) {
        console.error('DB Select Error:', dbErr);
        return res.status(500).json({ message:'Database select failed', detail:dbErr.message });
      }
    }

    else {
      return res.status(405).json({ message:'Method not allowed' });
    }

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ message:'Server error', detail:err.message });
  }
}
