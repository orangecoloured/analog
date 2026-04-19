import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_PATH = path.join(__dirname, "..", "test-analog.db");

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function cleanupTestDb() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

async function testSqliteFileProtocol(): Promise<TestResult> {
  console.log("\n=== Test 1: SQLite file: protocol ===");
  cleanupTestDb();

  process.env.ANALOG_SQLITE_URL = `file:${TEST_DB_PATH}`;
  process.env.ANALOG_DATABASE_PROVIDER = "sqlite";

  try {
    const { getSqliteClient } = await import("../src/services/sqlite/sqlite.js");
    const { pushData, getAllData } = await import("../src/services/sqlite/index.js");

    const client = await getSqliteClient();
    console.log("  ✓ SQLite client created successfully with file: protocol");

    await pushData("test_event_1");
    console.log("  ✓ Data pushed successfully");

    await pushData("test_event_2");

    const data = await getAllData();
    console.log(`  ✓ Data retrieved: ${JSON.stringify(data)}`);

    if (data["test_event_1"] && data["test_event_1"].length === 1 &&
        data["test_event_2"] && data["test_event_2"].length === 1) {
      return {
        name: "SQLite file: protocol",
        passed: true,
        message: "SQLite file: protocol works correctly - can create client, push and retrieve data"
      };
    } else {
      return {
        name: "SQLite file: protocol",
        passed: false,
        message: `Data mismatch: ${JSON.stringify(data)}`
      };
    }
  } catch (error) {
    return {
      name: "SQLite file: protocol",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  } finally {
    cleanupTestDb();
    delete process.env.ANALOG_SQLITE_URL;
    delete process.env.ANALOG_DATABASE_PROVIDER;
  }
}

async function testAuthTokenExtraction(): Promise<TestResult> {
  console.log("\n=== Test 2: AuthToken extraction compatibility ===");

  try {
    const { extractAuthTokenFromUrl } = await import("../src/utils/extractAuthTokenFromUrl.js");

    const testCases = [
      { input: "file:./test.db", expected: { url: "file:./test.db", authToken: null } },
      { input: "libsql://my-db.turso.io?authtoken=my-secret-token", expected: { url: "libsql://my-db.turso.io", authToken: "my-secret-token" } },
      { input: "https://my-db.turso.io?authtoken=token123&other=param", expected: { url: "https://my-db.turso.io?other=param", authToken: "token123" } },
    ];

    for (const tc of testCases) {
      const result = extractAuthTokenFromUrl(tc.input);
      console.log(`  Input: ${tc.input}`);
      console.log(`    Result: url=${result.url}, authToken=${result.authToken}`);
      
      if (result.url !== tc.expected.url || result.authToken !== tc.expected.authToken) {
        return {
          name: "AuthToken extraction",
          passed: false,
          message: `Mismatch for input ${tc.input}: expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(result)}`
        };
      }
    }

    return {
      name: "AuthToken extraction",
      passed: true,
      message: "AuthToken extraction works correctly for both file: and remote URLs with authtoken"
    };
  } catch (error) {
    return {
      name: "AuthToken extraction",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

async function testPostAuthCodeConsistency(): Promise<TestResult> {
  console.log("\n=== Test 3: POST auth code consistency ===");

  try {
    const apiEventsPath = path.join(__dirname, "..", "api", "events.ts");
    const netlifyEventsPath = path.join(__dirname, "..", "netlify", "functions", "events.ts");
    const serverIndexPath = path.join(__dirname, "..", "src", "services", "server", "index.ts");

    const apiEventsContent = fs.readFileSync(apiEventsPath, "utf-8");
    const netlifyEventsContent = fs.readFileSync(netlifyEventsPath, "utf-8");
    const serverIndexContent = fs.readFileSync(serverIndexPath, "utf-8");

    const hasApiEventsAuth = apiEventsContent.includes("ANALOG_PROTECT_POST") && 
                             apiEventsContent.includes('process.env.ANALOG_PROTECT_POST === "true"');
    
    const hasNetlifyAuth = netlifyEventsContent.includes("ANALOG_PROTECT_POST") &&
                           netlifyEventsContent.includes('process.env.ANALOG_PROTECT_POST === "true"');
    
    const hasServerAuth = serverIndexContent.includes("ANALOG_PROTECT_POST") &&
                          serverIndexContent.includes('process.env.ANALOG_PROTECT_POST === "true"');

    console.log(`  api/events.ts has ANALOG_PROTECT_POST check: ${hasApiEventsAuth}`);
    console.log(`  netlify/functions/events.ts has ANALOG_PROTECT_POST check: ${hasNetlifyAuth}`);
    console.log(`  src/services/server/index.ts has ANALOG_PROTECT_POST check: ${hasServerAuth}`);

    if (hasApiEventsAuth && hasNetlifyAuth && hasServerAuth) {
      return {
        name: "POST auth code consistency",
        passed: true,
        message: "All three entry points (api/events.ts, netlify/functions/events.ts, src/services/server/index.ts) now have consistent ANALOG_PROTECT_POST checks"
      };
    } else {
      const missing = [];
      if (!hasApiEventsAuth) missing.push("api/events.ts");
      if (!hasNetlifyAuth) missing.push("netlify/functions/events.ts");
      if (!hasServerAuth) missing.push("src/services/server/index.ts");
      
      return {
        name: "POST auth code consistency",
        passed: false,
        message: `Missing ANALOG_PROTECT_POST check in: ${missing.join(", ")}`
      };
    }
  } catch (error) {
    return {
      name: "POST auth code consistency",
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

async function main() {
  console.log("========================================");
  console.log("  Analog Runtime Fixes Verification");
  console.log("========================================");

  const npmCacheDir = path.join(__dirname, "..", ".npm-cache");
  process.env.npm_config_cache = npmCacheDir;
  console.log(`\nNPM cache set to: ${npmCacheDir}`);

  results.push(await testSqliteFileProtocol());
  results.push(await testAuthTokenExtraction());
  results.push(await testPostAuthCodeConsistency());

  console.log("\n========================================");
  console.log("  Test Results");
  console.log("========================================");

  let allPassed = true;
  for (const result of results) {
    const status = result.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`\n${status}: ${result.name}`);
    console.log(`   ${result.message}`);
    if (!result.passed) allPassed = false;
  }

  console.log("\n========================================");
  if (allPassed) {
    console.log("  All tests passed! ✓");
  } else {
    console.log("  Some tests failed! ✗");
    process.exit(1);
  }
  console.log("========================================");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
