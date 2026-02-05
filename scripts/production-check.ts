import { runProductionChecks } from "../lib/production-readiness";

async function main() {
  const result = await runProductionChecks();

  if (!result.dbOk) {
    console.error("Database connectivity FAILED.");
    process.exit(1);
  }

  if (result.missingRequired.length > 0) {
    console.error("Missing required production env vars:");
    for (const name of result.missingRequired) {
      console.error(`- ${name}`);
    }
    process.exit(1);
  }

  if (result.missingRecommended.length > 0) {
    console.warn("Missing recommended production env vars:");
    for (const name of result.missingRecommended) {
      console.warn(`- ${name}`);
    }
  }

  console.log("Production readiness checks passed.");
}

main().catch((error) => {
  console.error("Production readiness checks FAILED.");
  console.error(error);
  process.exit(1);
});
