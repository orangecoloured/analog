export const generateQuery = (base: string, parts: string[]) => {
  const searchQuery = parts.join("&");

  return `${base}${searchQuery ? `?${searchQuery}` : ""}`;
};
