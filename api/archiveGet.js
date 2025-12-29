import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res){
  const search = req.query.search || '';

  try {
    let query;
    if(search.trim() === ''){
      query = await sql`SELECT * FROM sensor_data_archive ORDER BY timestamp DESC LIMIT 100`;
    } 

    res.status(200).json(query);
  } catch(err){
    console.error('ArchiveGet error:', err);
    res.status(500).json({error:'Failed to fetch archive'});
  }
}
