import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message:'Method not allowed' });

  const { device_id,pname,pmobile,email,age,chin,chout } = req.body;

  await sql`
    INSERT INTO informations(device_id,p_name,ph_no,email,age,checkin_date,checkout_date)
    VALUES(${device_id},${pname},${pmobile},${email},${age},${chin},${chout})
  `;

  res.json({ success:true });
}
