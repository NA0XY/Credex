export function getRequestIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "0.0.0.0";
  }

  return headers.get("x-real-ip") ?? "0.0.0.0";
}

