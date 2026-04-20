import assert from "node:assert/strict";
import {
  parseFetchError,
  getErrorDisplayConfig,
  shouldRefreshOnTokenChange,
  canTransitionTo,
  STATUS_VISIBILITY_MAP,
  type RequestStatus,
  type ErrorType,
} from "../src/utils/requestState.js";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (e) {
    results.push({ name, passed: false, error: (e as Error).message });
    console.log(`  ❌ ${name}`);
    console.log(`     错误: ${(e as Error).message}`);
  }
}

console.log("🧪 开始运行 requestState 模块测试...\n");

console.log("📋 测试组 1: parseFetchError - 错误解析");

test("401 响应应解析为 unauthorized 类型", () => {
  const result = parseFetchError({ ok: false, status: 401, statusText: "Unauthorized" });
  assert.equal(result.type, "unauthorized");
  assert.equal(result.status, 401);
  assert.ok(result.message.includes("访问令牌") || result.message.includes("拒绝"));
});

test("500 响应应解析为 server 类型", () => {
  const result = parseFetchError({ ok: false, status: 500, statusText: "Internal Server Error" });
  assert.equal(result.type, "server");
  assert.equal(result.status, 500);
  assert.ok(result.message.includes("500"));
});

test("503 响应应解析为 server 类型", () => {
  const result = parseFetchError({ ok: false, status: 503, statusText: "Service Unavailable" });
  assert.equal(result.type, "server");
  assert.equal(result.status, 503);
});

test("404 响应应解析为 unknown 类型", () => {
  const result = parseFetchError({ ok: false, status: 404, statusText: "Not Found" });
  assert.equal(result.type, "unknown");
  assert.equal(result.status, 404);
});

test("TypeError 应解析为 network 类型", () => {
  const result = parseFetchError(undefined, { name: "TypeError", message: "Failed to fetch" });
  assert.equal(result.type, "network");
  assert.ok(result.message.includes("网络") || result.message.includes("服务器"));
});

test("包含 fetch 的错误消息应解析为 network 类型", () => {
  const result = parseFetchError(undefined, { name: "Error", message: "fetch failed" });
  assert.equal(result.type, "network");
});

test("普通错误应解析为 unknown 类型", () => {
  const result = parseFetchError(undefined, { name: "Error", message: "Something went wrong" });
  assert.equal(result.type, "unknown");
  assert.equal(result.message, "Something went wrong");
});

test("无参数时应返回默认 unknown 错误", () => {
  const result = parseFetchError();
  assert.equal(result.type, "unknown");
  assert.ok(result.message);
});

console.log("\n📋 测试组 2: getErrorDisplayConfig - 错误显示配置");

test("unauthorized 错误应隐藏重试按钮", () => {
  const config = getErrorDisplayConfig({ type: "unauthorized", message: "test", status: 401 });
  assert.equal(config.showRetry, false);
  assert.equal(config.title, "无法访问数据");
});

test("network 错误应显示重试按钮", () => {
  const config = getErrorDisplayConfig({ type: "network", message: "test" });
  assert.equal(config.showRetry, true);
  assert.equal(config.title, "连接失败");
});

test("server 错误应显示重试按钮", () => {
  const config = getErrorDisplayConfig({ type: "server", message: "test", status: 500 });
  assert.equal(config.showRetry, true);
  assert.equal(config.title, "服务器出错");
});

test("unknown 错误应显示默认标题和重试按钮", () => {
  const config = getErrorDisplayConfig({ type: "unknown", message: "test" });
  assert.equal(config.showRetry, true);
  assert.equal(config.title, "加载失败");
});

console.log("\n📋 测试组 3: shouldRefreshOnTokenChange - token 变化刷新判断");

test("token 变化 + 401 错误状态 + 非 loading → 应刷新", () => {
  const shouldRefresh = shouldRefreshOnTokenChange(
    "new-token",
    "old-token",
    "error",
    "unauthorized",
  );
  assert.equal(shouldRefresh, true);
});

test("token 未变化 → 不应刷新", () => {
  const shouldRefresh = shouldRefreshOnTokenChange(
    "same-token",
    "same-token",
    "error",
    "unauthorized",
  );
  assert.equal(shouldRefresh, false);
});

test("非 401 错误 → 不应刷新", () => {
  const shouldRefresh = shouldRefreshOnTokenChange(
    "new-token",
    "old-token",
    "error",
    "network",
  );
  assert.equal(shouldRefresh, false);
});

test("非错误状态 → 不应刷新", () => {
  const shouldRefresh = shouldRefreshOnTokenChange(
    "new-token",
    "old-token",
    "success",
    "unauthorized",
  );
  assert.equal(shouldRefresh, false);
});

test("null token 变化 → 应正确判断", () => {
  const shouldRefresh = shouldRefreshOnTokenChange(
    "new-token",
    null,
    "error",
    "unauthorized",
  );
  assert.equal(shouldRefresh, true);
});

console.log("\n📋 测试组 4: canTransitionTo - 状态切换判断");

test("从 loading 到 loading → 不允许切换", () => {
  const canTransition = canTransitionTo("loading", "loading");
  assert.equal(canTransition, false);
});

test("从 idle 到 loading → 允许切换", () => {
  const canTransition = canTransitionTo("idle", "loading");
  assert.equal(canTransition, true);
});

test("从 error 到 loading → 允许切换", () => {
  const canTransition = canTransitionTo("error", "loading");
  assert.equal(canTransition, true);
});

test("从 success 到 loading → 允许切换", () => {
  const canTransition = canTransitionTo("success", "loading");
  assert.equal(canTransition, true);
});

console.log("\n📋 测试组 5: STATUS_VISIBILITY_MAP - 状态可见性映射");

test("loading 状态应只显示 loading 元素", () => {
  const config = STATUS_VISIBILITY_MAP.loading;
  assert.deepEqual(config.visible, ["loading"]);
  assert.deepEqual(config.hidden, ["error", "empty"]);
});

test("error 状态应只显示 error 元素", () => {
  const config = STATUS_VISIBILITY_MAP.error;
  assert.deepEqual(config.visible, ["error"]);
  assert.deepEqual(config.hidden, ["loading", "empty"]);
});

test("empty 状态应只显示 empty 元素", () => {
  const config = STATUS_VISIBILITY_MAP.empty;
  assert.deepEqual(config.visible, ["empty"]);
  assert.deepEqual(config.hidden, ["loading", "error"]);
});

test("success 状态应隐藏所有状态元素", () => {
  const config = STATUS_VISIBILITY_MAP.success;
  assert.deepEqual(config.visible, []);
  assert.deepEqual(config.hidden, ["loading", "error", "empty"]);
});

console.log("\n" + "=".repeat(50));

const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`📊 测试结果: ${passed} 个通过, ${failed} 个失败`);

if (failed > 0) {
  console.log("\n❌ 部分测试未通过:");
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`  - ${r.name}`);
    });
  process.exit(1);
} else {
  console.log("\n✅ 所有测试通过！");
  console.log("\n📝 测试覆盖情况:");
  console.log("  ✅ 401 错误解析");
  console.log("  ✅ 500/503 服务器错误解析");
  console.log("  ✅ 网络错误解析");
  console.log("  ✅ 状态互斥逻辑 (canTransitionTo)");
  console.log("  ✅ token 变化自动刷新判断");
  console.log("  ✅ 错误显示配置");
  console.log("  ✅ 状态可见性映射");
  process.exit(0);
}
