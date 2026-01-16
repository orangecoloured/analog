import {
  generateQuery,
  TIME_RANGE_MAX,
  TIME_RANGE_MIN,
  type TData,
  type TPaginatedData,
} from "./utils";

const ANALOG = {
  data: {
    rangeMap: new Map<string, number>(),
    dateEnd: new Date(),
    dateStart: new Date(),
    itemsHtml: [] as HTMLDivElement[],
    rangedData: [] as { event: string; dataset: number[] }[],
    highestVisitsCount: 0,
  },

  updateTitle: function () {
    const title = document.getElementById("title");

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

  renderData: async function () {
    const loading = document.getElementById("loading");
    const token = new URL(location.href).searchParams.get("token");
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
        loading?.remove();

        throw new Error(response.statusText);
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
          loading?.remove();

          throw new Error(response.statusText);
        }

        const responseBody = (await response.json()) as TPaginatedData;

        Object.entries(responseBody.data).forEach(([event, timestamps]) => {
          dataset[event] = (dataset[event] || []).concat(timestamps);
        });

        if (loading) {
          loading.dataset.text = `${Object.keys(dataset).length} events fetched...`;
        }

        cursor = responseBody.nextCursor;
      } while (cursor !== "0");
    }

    const root = document.getElementById("root");
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

    // side-effects, but considering there are no plans to scale this, it's fine
    this.data.rangedData = dataWithRanges;
    this.data.highestVisitsCount = highestVisitsCount;

    const rows = dataWithRanges.reduce((markup, data, index) => {
      return `${markup}<div class="event-title">${data.event}</div><div class="event-values" data-type="bars" data-index="${index}">${this.renderBars(data.dataset)}</div>`;
    }, "");

    loading?.remove();
    root?.insertAdjacentHTML("beforeend", `${header}${rows}`);
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
          item.innerHTML = this.renderBars(
            this.data.rangedData[Number(item.dataset.index)].dataset,
          );
        }
      }
    });
  },

  initialiseVirtualisation: function initialiseVirtualisation() {
    const root = document.getElementById("root");

    root?.addEventListener("scroll", this.processHtmlItems.bind(this), {
      passive: true,
    });
    window.addEventListener("resize", this.processHtmlItems.bind(this), {
      passive: true,
    });

    this.data.itemsHtml = Array.from(
      root?.querySelectorAll(`[data-type="bars"]`) || [],
    );
  },

  init: async function () {
    this.updateTitle();
    this.generateRangeMap();
    await this.renderData();
    this.initialiseVirtualisation();
  },
};

ANALOG.init();
