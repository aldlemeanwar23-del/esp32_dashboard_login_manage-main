import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const search = req.query.search || '';

    let rows;

    if (search) {
      rows = await sql`
        SELECT *
        FROM sensor_data_archive
        WHERE p_name ILIKE ${'%' + search + '%'}
        ORDER BY timestamp DESC
      `;
    } else {
      rows = await sql`
        SELECT *
        FROM sensor_data_archive
        ORDER BY timestamp DESC
      `;
    }

    // ✅ مهم جدًا
    return res.status(200).json(rows);

  } catch (err) {
    console.error('archiveGet error:', err);

    // ✅ حتى في الخطأ نعيد JSON
    return res.status(500).json({
      success: false,
      error: 'Archive fetch failed'
    });
  }
}
