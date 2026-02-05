type HealthResponse = {
  status: string;
  timestamp?: string;
  services?: Record<string, { status: string; message?: string; latency?: number }>;
};

const defaultUrl = "http://localhost:3000/api/health?verbose=true";
const url = process.env.HEALTHCHECK_URL || defaultUrl;

async function main() {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    const data = (await res.json()) as HealthResponse;

    if (!res.ok) {
      console.error(`Health check FAILED (${res.status}).`);
      console.error(data);
      process.exitCode = 1;
      return;
    }

    console.log(`Health check OK (${res.status}).`);
    console.log(data);
  } catch (error) {
    console.error("Health check FAILED: unable to reach endpoint.");
    console.error(error);
    process.exit(1);
  }
}

main();
