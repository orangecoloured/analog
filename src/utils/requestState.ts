export type RequestStatus = "idle" | "loading" | "success" | "error" | "empty";

export type ErrorType = "unauthorized" | "network" | "server" | "unknown";

export interface RequestError {
  type: ErrorType;
  message: string;
  status?: number;
}

export interface MinimalResponse {
  ok: boolean;
  status: number;
  statusText: string;
}

export interface MinimalError {
  name?: string;
  message?: string;
}

export const STATUS_VISIBILITY_MAP: Record<RequestStatus, { visible: string[]; hidden: string[] }> = {
  idle: { visible: [], hidden: ["loading", "error", "empty"] },
  loading: { visible: ["loading"], hidden: ["error", "empty"] },
  success: { visible: [], hidden: ["loading", "error", "empty"] },
  error: { visible: ["error"], hidden: ["loading", "empty"] },
  empty: { visible: ["empty"], hidden: ["loading", "error"] },
};

export function parseFetchError(
  response?: MinimalResponse,
  error?: MinimalError,
): RequestError {
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
    if (error.name === "TypeError" || (error.message && error.message.includes("fetch"))) {
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

export function shouldRefreshOnTokenChange(
  currentToken: string | null,
  lastToken: string | null,
  currentStatus: RequestStatus,
  lastErrorType?: ErrorType,
): boolean {
  const tokenChanged = currentToken !== lastToken;
  const isInErrorState = currentStatus === "error";
  const isAuthError = lastErrorType === "unauthorized";

  return tokenChanged && isInErrorState && isAuthError;
}

export function canTransitionTo(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
): boolean {
  if (fromStatus === "loading" && toStatus === "loading") {
    return false;
  }
  return true;
}

export function getErrorDisplayConfig(error: RequestError): {
  title: string;
  message: string;
  showRetry: boolean;
} {
  let title = "加载失败";
  let message = error.message;
  let showRetry = true;

  if (error.type === "unauthorized") {
    title = "无法访问数据";
    message =
      "您的访问令牌无效或已过期。请检查 URL 中的 token 参数是否正确，或者联系管理员获取新的令牌。";
    showRetry = false;
  } else if (error.type === "network") {
    title = "连接失败";
  } else if (error.type === "server") {
    title = "服务器出错";
  }

  return { title, message, showRetry };
}
