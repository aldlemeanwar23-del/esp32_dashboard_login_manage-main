import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req,res){
  const { device_id,pname,pmobile,email,age,chin,chout } = req.body;
  await sql`
    UPDATE informations
    SET p_name=${pname}, ph_no=${pmobile}, email=${email}, age=${age},checkin_date=${checkin_date},checkout_date=${checkout_date}
    WHERE device_id=${device_id}
  `;
  res.json({ success:true });
}
  
