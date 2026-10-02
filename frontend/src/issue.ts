export function issueUrl(title: string, body = "") {
  const params = new URLSearchParams({ title, body });
  return `https://github.com/Oqaan/pickup/issues/new?${params}`;
}
