import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req,res){
  const { id } = req.body;
  await sql`DELETE FROM sensor_data WHERE id=${id}`;
  res.json({ success:true });
}
