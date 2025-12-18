import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT id,device_id,p_name,ph_no,email,age
      FROM informations
    `;
    res.json(rows.reverse());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
