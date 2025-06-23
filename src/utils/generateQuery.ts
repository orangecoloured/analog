export const generateQuery = (base: string, parts: string[]) => {
  console.log(base, parts);
  const searchQuery = parts.filter((part) => !!part).join("&");

  return `${base}${searchQuery ? `?${searchQuery}` : ""}`;
};
