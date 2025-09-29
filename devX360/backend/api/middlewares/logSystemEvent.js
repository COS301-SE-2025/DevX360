import SystemEvent from "../models/SystemEvent.js";

export async function logSystemEvent({ type, email, ip, userAgent, details }) {
  try {
    await SystemEvent.create({
      type,
      email,
      ip,
      userAgent,
      details,
    });
  } catch (err) {
    console.error("Failed to log system event:", err);
  }
}
