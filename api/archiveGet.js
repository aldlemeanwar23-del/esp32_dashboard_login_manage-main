// pages/api/archiveGet.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const { search } = req.query; // قراءة باراميتر البحث من URL

    let data;
    if (search) {
      // إذا تم تمرير اسم المريض، البحث عنه
      data = await sql`
       SELECT * FROM sensor_data_archive
        WHERE p_name ILIKE ${'%' + search + '%'}
        ORDER BY s.timestamp DESC
      `;
    } 

    res.status(200).json(data);
  } catch (err) {
    console.error("ArchiveGet error:", err);
    res.status(500).json({ error: "Failed to fetch archive data" });
  }
}
