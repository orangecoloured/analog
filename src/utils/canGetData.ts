export const canGetData = () => {
  const tokenEnv = import.meta.env.VITE_ANALOG_GET_TOKEN;

  if (!tokenEnv) {
    return true;
  }

  const tokenClient = (new URL(location.href)).searchParams.get("token");

  if (!tokenClient) {
    return false;
  }

  return tokenEnv === tokenClient;
}