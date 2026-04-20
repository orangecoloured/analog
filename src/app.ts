import {
  generateQuery,
  TIME_RANGE_MAX,
  TIME_RANGE_MIN,
  type TData,
  type TPaginatedData,
} from "./utils";

type RequestStatus = "idle" | "loading" | "success" | "error" | "empty";
type ErrorType = "unauthorized" | "network" | "server" | "unknown";

interface RequestError {
  type: ErrorType;
  message: string;
  status?: number;
}

const ANALOG = {
  data: {
    rangeMap: new Map<string, number>(),
    dateEnd: new Date(),
    dateStart: new Date(),
    itemsHtml: [] as HTMLDivElement[],
    rangedData: [] as { event: string; dataset: number[] }[],
    highestVisitsCount: 0,
  },

  state: {
    status: "idle" as RequestStatus,
    error: null as RequestError | null,
    lastToken: null as string | null,
  },

  elements: {
    root: null as HTMLElement | null,
    loading: null as HTMLElement | null,
    error: null as HTMLElement | null,
    empty: null as HTMLElement | null,
    title: null as HTMLElement | null,
  },

  initElements: function () {
    this.elements.root = document.getElementById("root");
    this.elements.loading = document.getElementById("loading");
    this.elements.error = document.getElementById("error");
    this.elements.empty = document.getElementById("empty");
    this.elements.title = document.getElementById("title");
  },

  getCurrentToken: function (): string | null {
    return new URL(location.href).searchParams.get("token");
  },

  setStatus: function (newStatus: RequestStatus, error?: RequestError) {
    this.state.status = newStatus;

    if (this.elements.loading) {
      this.elements.loading.classList.toggle("hidden", newStatus !== "loading");
    }
    if (this.elements.error) {
      this.elements.error.classList.toggle("hidden", newStatus !== "error");
    }
    if (this.elements.empty) {
      this.elements.empty.classList.toggle("hidden", newStatus !== "empty");
    }

    if (newStatus === "error" && error) {
      this.state.error = error;
      this.renderErrorState(error);
    } else if (newStatus === "empty") {
      this.renderEmptyState();
    }
  },

  clearDataContent: function () {
    const root = this.elements.root;
    if (!root) return;

    const dataElements = root.querySelectorAll(
      ".event-values[data-type], .event-title",
    );
    dataElements.forEach((el) => el.remove());

    this.data.rangedData = [];
    this.data.highestVisitsCount = 0;
    this.data.itemsHtml = [];
  },

  parseFetchError: function (response?: Response, error?: Error): RequestError {
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
  },

  renderErrorState: function (error: RequestError) {
    const errorEl = this.elements.error;
    if (!errorEl) return;

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

    errorEl.innerHTML = `
      <div class="error-title">${title}</div>
      <div class="error-message">${message}</div>
      <div class="error-actions">
        ${showRetry ? '<button class="retry-button" id="retry-button">重新加载</button>' : ""}
      </div>
    `;

    const retryButton = errorEl.querySelector("#retry-button");
    if (retryButton) {
      retryButton.addEventListener("click", () => this.refresh(), { once: true });
    }
  },

  renderEmptyState: function () {
    const emptyEl = this.elements.empty;
    if (!emptyEl) return;

    emptyEl.innerHTML = `
      <div class="empty-title">暂无数据</div>
      <div class="empty-message">在当前时间范围内还没有任何事件数据</div>
      <div class="empty-actions">
        <button class="retry-button" id="refresh-button">刷新</button>
      </div>
    `;

    const refreshButton = emptyEl.querySelector("#refresh-button");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => this.refresh(), { once: true });
    }
  },

  updateTitle: function () {
    const title = this.elements.title;
    const pageTitle = import.meta.env.VITE_ANALOG_PAGE_TITLE;

    if (pageTitle) {
      document.title = `${pageTitle} / ${document.title}`;

      if (title) {
        title.innerHTML = pageTitle;
      }
    }
  },

  generateRangeMap: function () {
    let timeRange = Number(import.meta.env.VITE_ANALOG_TIME_RANGE as string);

    if (!isNaN(timeRange)) {
      timeRange = Math.min(Math.max(timeRange, TIME_RANGE_MIN), TIME_RANGE_MAX);
    } else {
      timeRange = TIME_RANGE_MAX;
    }

    const startDate = new Date(this.data.dateEnd.getTime());
    startDate.setDate(startDate.getDate() - (timeRange - 1));
    this.data.dateStart = new Date(startDate.getTime());

    this.data.rangeMap.clear();
    for (let i = timeRange; i >= 1; i--) {
      this.data.rangeMap.set(
        startDate.toLocaleString("en-GB", { month: "2-digit", day: "2-digit" }),
        0,
      );
      startDate.setDate(startDate.getDate() + 1);
    }
  },

  renderBars: function renderDataset(dataset: number[]) {
    return dataset.reduce((valuesMarkup, value) => {
      let bar = "";

      if (typeof value === "number") {
        const ratio = Math.floor((value / this.data.highestVisitsCount) * 100);

        bar = `<div class="bar" style="clip-path: polygon(0 ${100 - ratio}%, 100% ${100 - ratio}%, 100% 100%, 0% 100%)"></div><div class="value">${value}</div>`;
      }

      return `${valuesMarkup}<div>${bar}</div>`;
    }, "");
  },

  fetchData: async function (): Promise<TData> {
    const token = this.getCurrentToken();
    const cleanUpParametre =
      import.meta.env.VITE_ANALOG_API_GET_REQUEST_CLEAN_UP === "false"
        ? ""
        : "clean-up=true";

    let dataset: TData = {};

    if (import.meta.env.VITE_ANALOG_API_GET_REQUEST_QUEUE === "false") {
      const queryPath = generateQuery("/api/events", [cleanUpParametre]);
      const response = await fetch(queryPath, {
        headers: {
          ...(token
            ? {
                Authorization: `Basic ${token}`,
              }
            : null),
        },
      });

      if (!response.ok) {
        throw { response };
      }

      dataset = (await response.json()) as TData;
    } else {
      let cursor = "0";

      do {
        const queryPath = generateQuery("/api/events", [
          cleanUpParametre,
          `cursor=${cursor}`,
        ]);
        const response = await fetch(queryPath, {
          headers: {
            ...(token
              ? {
                  Authorization: `Basic ${token}`,
                }
              : null),
          },
        });

        if (!response.ok) {
          throw { response };
        }

        const responseBody = (await response.json()) as TPaginatedData;

        Object.entries(responseBody.data).forEach(([event, timestamps]) => {
          dataset[event] = (dataset[event] || []).concat(timestamps);
        });

        if (this.elements.loading) {
          this.elements.loading.dataset.text = `${Object.keys(dataset).length} events fetched...`;
        }

        cursor = responseBody.nextCursor;
      } while (cursor !== "0");
    }

    return dataset;
  },

  renderData: async function () {
    const currentToken = this.getCurrentToken();

    if (this.state.status === "loading") {
      return;
    }

    this.setStatus("loading");
    this.clearDataContent();

    try {
      const dataset = await this.fetchData();
      this.state.lastToken = currentToken;

      const root = this.elements.root;
      if (!root) {
        this.setStatus("success");
        return;
      }

      const columnsCount = this.data.rangeMap.size;
      let lastMonth: string | null = null;
      let highestVisitsCount = 0;

      const timeRangeArray = (
        Array.from(this.data.rangeMap)
          .flat()
          .filter((_, i) => i % 2 === 0) as string[]
      ).map((label) => {
        if (!lastMonth || !label.endsWith(lastMonth)) {
          lastMonth = label.substring(label.indexOf("/") + 1);
          return label;
        } else {
          return label.replace(`/${lastMonth}`, "");
        }
      });

      (document.querySelector(":root") as HTMLElement)?.style.setProperty(
        "--columns-count",
        `${columnsCount}`,
      );

      const header = `<div class="event-values" data-type="header">${timeRangeArray.reduce((markup, label) => `${markup}<div class="value">${label}</div>`, "")}</div>`;

      const eventOrderValues: Record<string, number> = {};
      const dataWithRanges = Object.entries(dataset)
        .map(([event, timestamps]) => {
          const range = new Map(this.data.rangeMap);
          const timestampStart = this.data.dateStart.getTime();
          const timestampEnd = this.data.dateEnd.getTime();

          const timestampsFiltered = timestamps.filter((timestamp) => {
            return timestamp >= timestampStart && timestamp <= timestampEnd;
          });

          if (timestampsFiltered.length > 0) {
            eventOrderValues[event] = Math.max(...timestampsFiltered);
          }

          timestampsFiltered.forEach((timestamp) => {
            const label = new Date(timestamp).toLocaleString("en-GB", {
              month: "2-digit",
              day: "2-digit",
            });

            range.set(label, (range.get(label) || 0) + 1);
          });

          highestVisitsCount = Math.max(
            highestVisitsCount,
            Math.max(...range.values()),
          );

          return {
            event,
            dataset: Array.from(range)
              .flat()
              .filter((_, i) => i % 2 !== 0) as number[],
          };
        })
        .filter(({ dataset }) =>
          dataset.some((value) => typeof value === "number" && value > 0),
        )
        .sort((a, b) => eventOrderValues[b.event] - eventOrderValues[a.event]);

      this.data.rangedData = dataWithRanges;
      this.data.highestVisitsCount = highestVisitsCount;

      if (dataWithRanges.length === 0) {
        this.setStatus("empty");
        return;
      }

      const rows = dataWithRanges.reduce((markup, data, index) => {
        return `${markup}<div class="event-title">${data.event}</div><div class="event-values" data-type="bars" data-index="${index}"></div>`;
      }, "");

      this.setStatus("success");
      root.insertAdjacentHTML("beforeend", `${header}${rows}`);
    } catch (err) {
      const error = err as { response?: Response; message?: string };
      const parsedError = this.parseFetchError(
        error.response,
        error as Error,
      );
      this.setStatus("error", parsedError);
    }
  },

  processHtmlItems: function processHtmlItems() {
    this.data.itemsHtml.forEach((item) => {
      const { top, height } = item.getBoundingClientRect();

      if (top + height < 0 || top > window.innerHeight) {
        if (item.innerHTML) {
          item.innerHTML = "";
        }
      } else {
        if (!item.innerHTML) {
          const index = Number(item.dataset.index);
          if (this.data.rangedData[index]) {
            item.innerHTML = this.renderBars(this.data.rangedData[index].dataset);
          }
        }
      }
    });
  },

  initialiseVirtualisation: function initialiseVirtualisation() {
    const root = this.elements.root;

    root?.addEventListener("scroll", this.processHtmlItems.bind(this), {
      passive: true,
    });
    window.addEventListener("resize", this.processHtmlItems.bind(this), {
      passive: true,
    });

    this.data.itemsHtml = Array.from(
      root?.querySelectorAll(`[data-type="bars"]`) || [],
    );

    this.processHtmlItems();
  },

  refresh: async function () {
    await this.renderData();

    if (this.state.status === "success") {
      this.initialiseVirtualisation();
    }
  },

  startTokenPolling: function () {
    const checkInterval = 2000;

    const checkToken = () => {
      const currentToken = this.getCurrentToken();

      if (
        currentToken !== this.state.lastToken &&
        this.state.status === "error"
      ) {
        if (this.state.error?.type === "unauthorized") {
          this.refresh();
        }
      }

      setTimeout(checkToken, checkInterval);
    };

    setTimeout(checkToken, checkInterval);
  },

  init: async function () {
    this.initElements();
    this.updateTitle();
    this.generateRangeMap();
    this.startTokenPolling();
    await this.renderData();

    if (this.state.status === "success") {
      this.initialiseVirtualisation();
    }
  },
};

ANALOG.init();

export { ANALOG };
