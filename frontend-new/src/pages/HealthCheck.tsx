/**
 * Health Check Route
 * Simple endpoint to verify frontend service is running
 */
export default function HealthCheck() {
  const timestamp = new Date().toISOString();

  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      <h1>Frontend Health Check</h1>
      <p>Status: OK</p>
      <p>Timestamp: {timestamp}</p>
    </div>
  );
}
