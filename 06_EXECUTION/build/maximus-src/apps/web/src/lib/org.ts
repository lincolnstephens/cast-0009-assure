// The organisation the admin workspace is acting on (FRAGO 05 3.4). The
// switcher in the admin header sets it; every /admin API call carries it as a
// header, so an admin page cannot read or write any other organisation's
// document by leaving out a parameter. Remembered for the browser session.

const KEY = "assure.org";
export const ADMIN_ORG_HEADER = "X-Assure-Org";

let current: string | null = read();

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function selectedOrg(): string | null {
  return current;
}

export function rememberOrg(id: string | null): void {
  current = id;
  try {
    if (id) sessionStorage.setItem(KEY, id);
    else sessionStorage.removeItem(KEY);
  } catch {
    // The choice still holds for this page load.
  }
}
