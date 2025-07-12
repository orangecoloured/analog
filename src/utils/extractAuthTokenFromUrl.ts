export const extractAuthTokenFromUrl = (str: string) => {
  const parts = str.split("?");
  const base = parts[0];

  if (parts.length === 1) {
    return {
      authToken: null,
      url: str,
    };
  }

  const params = new URLSearchParams(parts[1]);
  const authToken = params.get("authtoken");

  params.delete("authtoken");

  const newQuery = params.toString();
  const url = newQuery ? `${base}?${newQuery}` : base;

  return {
    authToken,
    url,
  };
};
