/**
 * Backend & Frontend Keep-Alive Service
 *
 * This script runs on the Render frontend service and pings both the backend
 * and frontend every 15 minutes to prevent them from spinning down due to inactivity.
 */

const BACKEND_URL =
  process.env.VITE_API_URL?.replace("/api/v1", "/up") ||
  "https://rims-dev-backend.onrender.com/up";

const FRONTEND_URL = process.env.NODE_ENV === 'development'
  ? "http://localhost:5174/health"
  : "https://rims-dev.onrender.com/health";
  
const INTERVAL_MINUTES = 15;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

async function pingBackend() {
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(BACKEND_URL);

    if (response.ok) {
      const data = await response.json();
      console.log(`[${timestamp}] ✓ Backend keep-alive ping successful:`, data);
    } else {
      console.warn(
        `[${timestamp}] ⚠ Backend responded with status ${response.status}`,
      );
    }
  } catch (error) {
    console.error(
      `[${timestamp}] ✗ Backend keep-alive ping failed:`,
      error.message,
    );
  }
}

async function pingFrontend() {
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(FRONTEND_URL);

    if (response.ok) {
      console.log(`[${timestamp}] ✓ Frontend keep-alive ping successful`);
    } else {
      console.warn(
        `[${timestamp}] ⚠ Frontend responded with status ${response.status}`,
      );
    }
  } catch (error) {
    console.error(
      `[${timestamp}] ✗ Frontend keep-alive ping failed:`,
      error.message,
    );
  }
}

async function pingServices() {
  await Promise.all([pingBackend(), pingFrontend()]);
}

// Log startup
console.log("=".repeat(60));
console.log("Backend & Frontend Keep-Alive Service Started");
console.log("=".repeat(60));
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Ping Interval: Every ${INTERVAL_MINUTES} minutes`);
console.log("=".repeat(60));
console.log("");

// Ping immediately on startup
pingServices();

// Set up interval to ping every 15 minutes
setInterval(pingServices, INTERVAL_MS);

// Keep the process alive
process.on("SIGTERM", () => {
  console.log("Keep-alive service shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Keep-alive service shutting down...");
  process.exit(0);
});
