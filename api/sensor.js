import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const allowedDevices = ["max1", "max2", "max3", "max4"];

export default async function handler(req, res) {
  try {

    /* =======================
       POST (ESP32 → Database)
       ======================= */
    if (req.method === "POST") {
      const { device_id, heartrate, spo2 } = req.body || {};

      if (!allowedDevices.includes(device_id)) {
        return res.status(400).json({
          message: "Invalid device (must be max1..max4)",
          received: device_id
        });
      }

      if (typeof heartrate !== "number" || typeof spo2 !== "number") {
        return res.status(400).json({
          message: "heartrate and spo2 must be numbers"
        });
      }

      await sql`
        INSERT INTO sensor_data (device_id, heartrate, spo2)
        VALUES (${device_id}, ${heartrate}, ${spo2})
      `;

      return res.status(200).json({ message: "Data saved successfully" });
    }

    /* =======================
       GET (Dashboard ← DB)
       ======================= */
    if (req.method === "GET") {
      const device = req.query.device;

      if (!allowedDevices.includes(device)) {
        return res.status(400).json({
          message: "Invalid device (must be max1..max4)",
          received: device
        });
      }

      const rows = await sql`
        SELECT device_id, heartrate, spo2, time
        FROM sensor_data
        WHERE device_id = ${device}
        ORDER BY time ASC
        LIMIT 100
      `;

      return res.status(200).json(rows);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
