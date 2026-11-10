export function getLocalReturnPath(value: string | string[] | undefined) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  ) {
    return value;
  }

  return "/account";
}
