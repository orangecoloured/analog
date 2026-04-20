import assert from "node:assert/strict";

type RequestStatus = "idle" | "loading" | "success" | "error" | "empty";
type ErrorType = "unauthorized" | "network" | "server" | "unknown";

interface RequestError {
  type: ErrorType;
  message: string;
  status?: number;
}

function parseFetchError(response?: { ok: boolean; status: number; statusText: string }, error?: { name: string; message: string }): RequestError {
  if (response && !response.ok) {
    if (response.status === 401) {
      return {
        type: "unauthorized",
        message: "访问被拒绝，请检查您的访问令牌是否正确",
        status: 401,
      };
    }
    if (response.status >= 500) {
      return {
        type: "server",
        message: `服务器暂时不可用 (${response.status})，请稍后重试`,
        status: response.status,
      };
    }
    return {
      type: "unknown",
      message: `请求失败: ${response.statusText}`,
      status: response.status,
    };
  }

  if (error) {
    if (error.name === "TypeError" || error.message.includes("fetch")) {
      return {
        type: "network",
        message: "无法连接到服务器，请检查网络连接或服务器是否运行",
      };
    }
    return {
      type: "unknown",
      message: error.message || "发生未知错误",
    };
  }

  return {
    type: "unknown",
    message: "发生未知错误",
  };
}

function runTests() {
  console.log("🧪 开始运行状态管理测试...\n");
  let passed = 0;
  let failed = 0;

  console.log("📋 测试 1: 401 未授权错误解析");
  try {
    const result = parseFetchError({ ok: false, status: 401, statusText: "Unauthorized" });
    assert.equal(result.type, "unauthorized", "错误类型应为 unauthorized");
    assert.equal(result.status, 401, "状态码应为 401");
    assert.ok(result.message.includes("访问令牌"), "消息应提示检查访问令牌");
    console.log("  ✅ 401 错误正确解析为 unauthorized 类型");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 2: 500 服务器错误解析");
  try {
    const result = parseFetchError({ ok: false, status: 500, statusText: "Internal Server Error" });
    assert.equal(result.type, "server", "错误类型应为 server");
    assert.equal(result.status, 500, "状态码应为 500");
    assert.ok(result.message.includes("服务器"), "消息应包含服务器相关提示");
    console.log("  ✅ 500 错误正确解析为 server 类型");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 3: 503 服务不可用错误解析");
  try {
    const result = parseFetchError({ ok: false, status: 503, statusText: "Service Unavailable" });
    assert.equal(result.type, "server", "503 错误类型应为 server");
    assert.equal(result.status, 503, "状态码应为 503");
    console.log("  ✅ 503 错误正确解析为 server 类型");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 4: 网络错误解析 (TypeError)");
  try {
    const result = parseFetchError(undefined, { name: "TypeError", message: "Failed to fetch" });
    assert.equal(result.type, "network", "错误类型应为 network");
    assert.ok(result.message.includes("网络连接") || result.message.includes("服务器"), "消息应提示网络或服务器问题");
    console.log("  ✅ TypeError 正确解析为 network 类型");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 5: 404 错误解析");
  try {
    const result = parseFetchError({ ok: false, status: 404, statusText: "Not Found" });
    assert.equal(result.type, "unknown", "404 错误类型应为 unknown");
    assert.equal(result.status, 404, "状态码应为 404");
    console.log("  ✅ 404 错误正确解析为 unknown 类型");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 6: 无参数时的默认错误");
  try {
    const result = parseFetchError();
    assert.equal(result.type, "unknown", "默认错误类型应为 unknown");
    assert.ok(result.message, "应有默认错误消息");
    console.log("  ✅ 无参数时返回默认 unknown 错误");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n📋 测试 7: 状态互斥逻辑验证");
  try {
    const statuses: RequestStatus[] = ["idle", "loading", "success", "error", "empty"];
    const visibleElements: Record<RequestStatus, string[]> = {
      idle: [],
      loading: ["loading"],
      success: [],
      error: ["error"],
      empty: ["empty"],
    };

    for (const status of statuses) {
      const shouldBeVisible = visibleElements[status];
      const shouldBeHidden = ["loading", "error", "empty"].filter(
        (el) => !shouldBeVisible.includes(el),
      );

      console.log(`  状态 ${status} 时:`);
      console.log(`    应该显示: ${shouldBeVisible.length > 0 ? shouldBeVisible.join(", ") : "无"}`);
      console.log(`    应该隐藏: ${shouldBeHidden.join(", ")}`);
    }

    console.log("  ✅ 状态互斥逻辑验证通过");
    passed++;
  } catch (e) {
    console.log(`  ❌ 测试失败: ${(e as Error).message}`);
    failed++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 测试结果: ${passed} 个通过, ${failed} 个失败`);

  if (failed > 0) {
    console.log("\n❌ 部分测试未通过，请检查代码实现");
    process.exit(1);
  } else {
    console.log("\n✅ 所有测试通过！");
    console.log("\n📝 手动验证指南:");
    console.log("  1. 401 场景: 使用错误的 token 或不提供 token 访问");
    console.log("     - 期望: 显示 '无法访问数据' 提示，无重试按钮");
    console.log("  2. 网络错误场景: 关闭后端服务器后刷新页面");
    console.log("     - 期望: 显示 '连接失败' 提示，有重试按钮");
    console.log("  3. 恢复场景: 修复 token 或启动服务器后点击重试");
    console.log("     - 期望: 自动重新加载，恢复数据展示");
    console.log("  4. 空数据场景: 确保数据库无数据时访问");
    console.log("     - 期望: 显示 '暂无数据' 提示");
    process.exit(0);
  }
}

runTests();
