import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const { search } = req.query;

    let data;
    if (search) {
      data = await sql`
        SELECT s.id, s.device_id, s.heartrate, s.spo2, s.timestamp, i.p_name
        FROM sensor_data_archive s
        LEFT JOIN informations i ON i.device_id = s.device_id
        WHERE i.p_name ILIKE ${'%' + search + '%'}
        ORDER BY s.timestamp DESC
      `;
    } else {
      data = await sql`
        SELECT s.id, s.device_id, s.heartrate, s.spo2, s.timestamp, i.p_name
        FROM sensor_data_archive s
        LEFT JOIN informations i ON i.device_id = s.device_id
        ORDER BY s.timestamp DESC
      `;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("ArchiveGet error:", err);
    res.status(500).json({ error: "Failed to fetch archive data" });
  }
}
