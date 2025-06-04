import { MOCK_DATE_RANGE, MOCK_MAX_TIMESTAMPS_COUNT, MOCK_RECORDS_COUNT, type TData } from ".";

export const mockData = (props?: { range?: number, count?: number, timestampsCount?: number }) => {
  const envRange = parseInt(process.env.VITE_ANALOG_TIME_RANGE || "", 10);
  const dateRange = props?.range || isNaN(envRange) ? MOCK_DATE_RANGE : envRange;
  const recordsCount = props?.count || MOCK_RECORDS_COUNT;
  const tsCount = props?.timestampsCount || MOCK_MAX_TIMESTAMPS_COUNT;
  const startDate = new Date();
  const dataset: TData = {};

  startDate.setDate(startDate.getDate() - (dateRange - 1));

  Array.from(Array(recordsCount)).forEach(() => {
    dataset[Math.random().toString(36)] = Array.from(Array(dateRange))
      .map((_, i) => {
        const date = new Date(startDate.getTime());

        date.setDate(date.getDate() + i);

        return Array.from(
          Array(Math.floor(Math.random() * tsCount))
        ).map(() => date.getTime());
      })
      .flat();
  });

  return dataset;
}