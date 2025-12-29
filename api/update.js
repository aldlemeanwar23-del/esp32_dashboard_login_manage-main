import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const {
      device_id,
      p_name,
      ph_no,
      email,
      age,
      checkin_date,
      checkout_date
    } = req.body;

    await sql`
      UPDATE informations
      SET
        p_name = ${p_name},
        ph_no = ${ph_no},
        email = ${email},
        age = ${age},
        checkin_date = ${checkin_date},
        checkout_date = ${checkout_date}
      WHERE device_id = ${device_id}
    `;

    res.json({ success: true });

  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ error: 'Update failed' });
  }
}
