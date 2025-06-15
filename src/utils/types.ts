export type TData = Record<string, number[]>;
export type TPaginatedData = {
  data: TData;
  nextCursor: string;
};
