export type EventRow = {
  event_name: string;
  timestamp: number;
  id?: number;
};

export type CleanUpEventRow = {
  id: number | null;
};
