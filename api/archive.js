// archive.js
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

export default async function archiveSensorData(req, res) {
  try {
    // 1️⃣ أرشفة بيانات المرضى الذين لديهم checkout_date محدد
    await sql`
      INSERT INTO sensor_data_archive (device_id, p_name, ph_no, email, age, checkin_date, checkout_date, timestamp, heartrate, spo2)
      SELECT s.device_id, i.p_name, i.ph_no, i.email, i.age, i.checkin_date, i.checkout_date, s.timestamp, s.heartrate, s.spo2
      FROM sensor_data s
      JOIN informations i ON s.device_id = i.device_id
      WHERE i.checkout_date IS NOT NULL
    `;

    // 2️⃣ حذف البيانات المؤرشفة من sensor_data للحفاظ على نظافة الجدول
    await sql`
      DELETE FROM sensor_data
      USING informations i
      WHERE sensor_data.device_id = i.device_id
        AND i.checkout_date IS NOT NULL
    `;

    res.json({ success: true, message: "Sensor data archived successfully." });
  } catch (error) {
    console.error("Archive failed:", error);
    res.status(500).json({ success: false, error: "Archive failed" });
  }
}
