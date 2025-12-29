import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      device_id,
      pname,
      pmobile,
      email,
      age,
      chin,
      chout
    } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: "Missing device_id" });
    }

    await sql`
      UPDATE informations
      SET
        p_name = ${pname || null},
        ph_no = ${pmobile || null},
        email = ${email || null},
        age = ${Number.isInteger(age) ? age : null},
        checkin_date = ${chin || null},
        checkout_date = ${chout || null}
      WHERE device_id = ${device_id}
    `;

    res.json({ success: true });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
}
