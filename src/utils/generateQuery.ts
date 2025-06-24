export const generateQuery = (base: string, parts: string[]) => {
  const searchQuery = parts.filter((part) => !!part).join("&");

  return `${base}${searchQuery ? `?${searchQuery}` : ""}`;
};
