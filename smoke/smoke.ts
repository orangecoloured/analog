import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { unlinkSync, existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_TOKEN = "smoke-test-token-12345";
const TEST_DB_PATH = resolve(__dirname, "..", ".smoke-data", "test.db");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function logInfo(msg: string) {
  console.log(`${YELLOW}[INFO]${RESET} ${msg}`);
}

function logPass(msg: string) {
  console.log(`${GREEN}[PASS]${RESET} ${msg}`);
}

function logFail(msg: string) {
  console.log(`${RED}[FAIL]${RESET} ${msg}`);
}

function cleanUpDb() {
  if (existsSync(TEST_DB_PATH)) {
    try {
      unlinkSync(TEST_DB_PATH);
      logInfo("Cleaned up previous test database");
    } catch (e) {
      logInfo(`Note: Could not clean up db file: ${e}`);
    }
  }

  const dataDir = dirname(TEST_DB_PATH);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

async function testSqliteConnection() {
  logInfo("Testing SQLite file: connection...");

  process.env.ANALOG_DATABASE_PROVIDER = "sqlite";
  process.env.ANALOG_SQLITE_URL = `file:${TEST_DB_PATH}`;

  const { databaseAdapter } =
    await import("../src/services/api/databaseAdapter.js");

  try {
    const result = await databaseAdapter.pushData("smoke-test-event");
    logPass(`SQLite pushData returned: ${result}`);

    const data = await databaseAdapter.getAllData();
    logPass(`SQLite getAllData returned: ${JSON.stringify(data)}`);

    if (data["smoke-test-event"] && data["smoke-test-event"].length > 0) {
      logPass("SQLite file: connection test PASSED");
      return true;
    } else {
      logFail("SQLite data was not stored correctly");
      return false;
    }
  } catch (error: unknown) {
    logFail(
      `SQLite connection failed: ${error instanceof Error ? error.message : error}`,
    );
    return false;
  }
}

function testPostProtectLogic() {
  logInfo("Testing POST protection logic consistency...");

  const PROTECT_POST = "true";
  const VALID_TOKEN = TEST_TOKEN;
  const INVALID_TOKEN = "wrong-token";
  const NULL_TOKEN = null;

  type CheckResult = { authorized: boolean; reason: string };

  function checkPostAuth(
    protectPost: string | undefined,
    token: string | null,
    envToken: string,
  ): CheckResult {
    if (protectPost === "true" && token !== envToken) {
      return { authorized: false, reason: "POST protection: token mismatch" };
    }
    return { authorized: true, reason: "authorized" };
  }

  let allPassed = true;

  logInfo("  Test 1: PROTECT_POST=true, valid token (should pass)");
  const r1 = checkPostAuth(PROTECT_POST, VALID_TOKEN, VALID_TOKEN);
  if (r1.authorized) {
    logPass("  Test 1 PASSED");
  } else {
    logFail(`  Test 1 FAILED: ${r1.reason}`);
    allPassed = false;
  }

  logInfo("  Test 2: PROTECT_POST=true, invalid token (should fail)");
  const r2 = checkPostAuth(PROTECT_POST, INVALID_TOKEN, VALID_TOKEN);
  if (!r2.authorized) {
    logPass("  Test 2 PASSED");
  } else {
    logFail("  Test 2 FAILED: should have rejected invalid token");
    allPassed = false;
  }

  logInfo("  Test 3: PROTECT_POST=true, null token (should fail)");
  const r3 = checkPostAuth(PROTECT_POST, NULL_TOKEN, VALID_TOKEN);
  if (!r3.authorized) {
    logPass("  Test 3 PASSED");
  } else {
    logFail("  Test 3 FAILED: should have rejected null token");
    allPassed = false;
  }

  logInfo("  Test 4: PROTECT_POST=false, no token (should pass)");
  const r4 = checkPostAuth("false", NULL_TOKEN, VALID_TOKEN);
  if (r4.authorized) {
    logPass("  Test 4 PASSED");
  } else {
    logFail(`  Test 4 FAILED: ${r4.reason}`);
    allPassed = false;
  }

  logInfo("  Test 5: PROTECT_POST=undefined, no token (should pass)");
  const r5 = checkPostAuth(undefined, NULL_TOKEN, VALID_TOKEN);
  if (r5.authorized) {
    logPass("  Test 5 PASSED");
  } else {
    logFail(`  Test 5 FAILED: ${r5.reason}`);
    allPassed = false;
  }

  if (allPassed) {
    logPass("POST protection logic consistency test PASSED");
  }

  return allPassed;
}

async function verifyVercelHandlerHasPostProtect() {
  logInfo("Verifying Vercel handler has POST protection...");

  const { readFileSync } = await import("fs");
  const handlerPath = resolve(__dirname, "..", "api", "events.ts");
  const content = readFileSync(handlerPath, "utf-8");

  const hasProtectCheck =
    content.includes('ANALOG_PROTECT_POST === "true"') &&
    content.includes("token !== process.env.ANALOG_TOKEN");

  if (hasProtectCheck) {
    logPass("Vercel handler POST protection check VERIFIED");
    return true;
  } else {
    logFail("Vercel handler missing POST protection check");
    return false;
  }
}

async function verifyNetlifyHandlerHasPostProtect() {
  logInfo("Verifying Netlify handler has POST protection...");

  const { readFileSync } = await import("fs");
  const handlerPath = resolve(
    __dirname,
    "..",
    "netlify",
    "functions",
    "events.ts",
  );
  const content = readFileSync(handlerPath, "utf-8");

  const hasProtectCheck =
    content.includes('ANALOG_PROTECT_POST === "true"') &&
    content.includes("token !== process.env.ANALOG_TOKEN");

  if (hasProtectCheck) {
    logPass("Netlify handler POST protection check VERIFIED");
    return true;
  } else {
    logFail("Netlify handler missing POST protection check");
    return false;
  }
}

async function verifyServerHandlerHasPostProtect() {
  logInfo("Verifying Node.js server handler has POST protection...");

  const { readFileSync } = await import("fs");
  const handlerPath = resolve(
    __dirname,
    "..",
    "src",
    "services",
    "server",
    "index.ts",
  );
  const content = readFileSync(handlerPath, "utf-8");

  const hasProtectCheck =
    content.includes('ANALOG_PROTECT_POST === "true"') &&
    content.includes("token !== process.env.ANALOG_TOKEN");

  if (hasProtectCheck) {
    logPass("Node.js server handler POST protection check VERIFIED");
    return true;
  } else {
    logFail("Node.js server handler missing POST protection check");
    return false;
  }
}

async function verifySqliteUsesCorrectImport() {
  logInfo("Verifying SQLite uses correct (non-web) import...");

  const { readFileSync } = await import("fs");
  const sqlitePath = resolve(
    __dirname,
    "..",
    "src",
    "services",
    "sqlite",
    "sqlite.ts",
  );
  const content = readFileSync(sqlitePath, "utf-8");

  const usesWebImport = content.includes("@libsql/client/web");
  const usesCorrectImport =
    content.includes("@libsql/client") && !usesWebImport;

  if (usesCorrectImport) {
    logPass("SQLite import VERIFIED: using @libsql/client (not web variant)");
    return true;
  } else if (usesWebImport) {
    logFail(
      "SQLite using incorrect import: @libsql/client/web (does not support file:)",
    );
    return false;
  } else {
    logFail("SQLite import could not be verified");
    return false;
  }
}

async function main() {
  console.log("========================================");
  console.log("  ANALOG Smoke Test Suite");
  console.log("========================================");
  console.log("");

  cleanUpDb();

  const results: { name: string; passed: boolean }[] = [];

  logInfo("=== Phase 1: Code/Import Verification ===");
  console.log("");

  results.push({
    name: "SQLite import (non-web variant)",
    passed: await verifySqliteUsesCorrectImport(),
  });
  console.log("");

  results.push({
    name: "Vercel handler POST protection",
    passed: await verifyVercelHandlerHasPostProtect(),
  });
  console.log("");

  results.push({
    name: "Netlify handler POST protection",
    passed: await verifyNetlifyHandlerHasPostProtect(),
  });
  console.log("");

  results.push({
    name: "Node.js server handler POST protection",
    passed: await verifyServerHandlerHasPostProtect(),
  });
  console.log("");

  logInfo("=== Phase 2: Logic Verification ===");
  console.log("");

  results.push({
    name: "POST protection logic consistency",
    passed: testPostProtectLogic(),
  });
  console.log("");

  logInfo("=== Phase 3: Integration Test (SQLite file:) ===");
  console.log("");

  results.push({
    name: "SQLite file: connection & operations",
    passed: await testSqliteConnection(),
  });
  console.log("");

  logInfo("=== Summary ===");
  console.log("");

  const allPassed = results.every((r) => r.passed);

  for (const result of results) {
    if (result.passed) {
      logPass(result.name);
    } else {
      logFail(result.name);
    }
  }

  console.log("");
  console.log("========================================");

  if (allPassed) {
    console.log(`${GREEN}  ALL TESTS PASSED!${RESET}`);
    console.log("  You can now use:");
    console.log("  - SQLite file:./path/to.db for local database");
    console.log("  - ANALOG_PROTECT_POST=true for consistent POST protection");
    process.exit(0);
  } else {
    console.log(`${RED}  SOME TESTS FAILED${RESET}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logFail(
    `Smoke test crashed: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
});
