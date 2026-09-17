import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import { ensureOrg, mutateUsers, newId, resetDriver } from "../src/db/store.ts";

/**
 * Point the store at a fresh temporary directory and drop the cached driver,
 * so each test run reads and writes its own isolated data instead of sharing
 * state with any other test, file or the real `.data` directory.
 */
export function freshStore(): void {
  const dir = mkdtempSync(path.join(tmpdir(), "assure-test-"));
  process.env.ASSURE_DATA_DIR = dir;
  resetDriver();
}

export interface TestFixtures {
  accountId: string;
  clientUserId: string;
  adminUserId: string;
}

/** No client name, no officer name - generic test fixtures throughout. */
export const TEST_PASSWORD = "correct-horse";
export const TEST_CLIENT_EMAIL = "client@test.example";
export const TEST_ADMIN_EMAIL = "admin@test.example";
const TEST_ORG_NAME = "Test Organisation";
const TEST_CLIENT_DISPLAY_NAME = "Test Client User";
const TEST_ADMIN_DISPLAY_NAME = "Test Admin User";

export async function seedTestUsers(): Promise<TestFixtures> {
  const org = await ensureOrg("test-org", TEST_ORG_NAME);
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);

  const { clientUserId, adminUserId } = await mutateUsers((doc) => {
    const clientUser = {
      id: newId(),
      orgId: org.id,
      email: TEST_CLIENT_EMAIL,
      passwordHash: hash,
      role: "client" as const,
      displayName: TEST_CLIENT_DISPLAY_NAME,
      createdAt: new Date().toISOString(),
    };
    const adminUser = {
      id: newId(),
      orgId: null,
      email: TEST_ADMIN_EMAIL,
      passwordHash: hash,
      role: "mitmark_admin" as const,
      displayName: TEST_ADMIN_DISPLAY_NAME,
      createdAt: new Date().toISOString(),
    };
    doc.users.push(clientUser, adminUser);
    return { clientUserId: clientUser.id, adminUserId: adminUser.id };
  });

  return { accountId: org.id, clientUserId, adminUserId };
}

/** Extract the session cookie from a login response. */
export function sessionCookieOf(res: Response): string {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("No set-cookie header on response");
  return setCookie.split(";")[0];
}
