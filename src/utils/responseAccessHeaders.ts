export const responseAccessHeaders = (methods: string) => {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": `"OPTIONS, ${methods}"`,
  };
};