import { expect, test, type Page } from "@playwright/test";

const CLIENT_EMAIL = process.env.SEED_CLIENT_EMAIL ?? "Information Officer@DemoOrganisation.co.uk";
const OFFICER_EMAIL = process.env.SEED_OFFICER_EMAIL ?? "lc@nemeanservices.co.uk";
const CLIENT_PASSWORD = process.env.SEED_CLIENT_PASSWORD ?? "";
const OFFICER_PASSWORD = process.env.SEED_OFFICER_PASSWORD ?? "";

const Q1 = "Can I share the tenant contact list with our letting agent?";
const Q2 =
  "A tenant wants to put their own camera in the communal hallway — is that allowed?";
const Q3 = "A former employee has emailed asking for everything we hold on them";
const OFFICER_REPLY =
  "Private cameras in communal areas are not permitted — use the tenant letter template.";

test.beforeAll(() => {
  if (!CLIENT_PASSWORD || !OFFICER_PASSWORD) {
    throw new Error("Set SEED_CLIENT_PASSWORD and SEED_OFFICER_PASSWORD in .env for E2E tests.");
  }
});

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Demo seed leaves policies as drafts — officer approves via API before the Guide walkthrough. */
async function approveAllDraftPolicies(page: Page) {
  await login(page, OFFICER_EMAIL, OFFICER_PASSWORD);
  const accountsRes = await page.request.get("/api/admin/accounts");
  expect(accountsRes.ok()).toBeTruthy();
  const { accounts } = await accountsRes.json();
  const accountId = accounts[0].id as string;

  const listRes = await page.request.get(`/api/admin/policies?accountId=${accountId}`);
  const { policies } = await listRes.json();
  for (const policy of policies as { id: string; status: string }[]) {
    if (policy.status === "draft") {
      const approve = await page.request.post(`/api/admin/policies/${policy.id}/approve`);
      expect(approve.ok()).toBeTruthy();
    }
  }
  await page.getByRole("button", { name: "Sign out" }).click();
}

test.describe("Policy Guide demo (stub mode — Demo Organisation)", () => {
  test("officer approves policies; client walkthrough; officer answers amber", async ({
    page,
  }) => {
    await approveAllDraftPolicies(page);

    await login(page, CLIENT_EMAIL, CLIENT_PASSWORD);
    await expect(page.locator(".client-portal")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    await expect(page.getByRole("img", { name: "Demo Organisation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Policy Guide" })).toBeVisible();

    const input = page.getByLabel("Ask the Policy Guide");

    await input.fill(Q1);
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText("ON TRACK").first()).toBeVisible({ timeout: 20_000 });

    await input.fill(Q2);
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText("ATTENTION").last()).toBeVisible({ timeout: 20_000 });

    await input.fill(Q3);
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText("CRITICAL").last()).toBeVisible({ timeout: 20_000 });

    await page.getByRole("link", { name: "Clocks" }).click();
    await expect(page.getByRole("heading", { name: "Statutory clocks" })).toBeVisible();
    await expect(page.getByText("Subject access request").first()).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, OFFICER_EMAIL, OFFICER_PASSWORD);
    await expect(page.locator(".admin-workspace")).toHaveCSS(
      "background-color",
      "rgb(13, 19, 33)",
    );
    await expect(page.getByText(Q2)).toBeVisible({ timeout: 15_000 });
    await page
      .getByPlaceholder("Your answer — posts into the client's chat thread.")
      .fill(OFFICER_REPLY);
    await page.getByRole("button", { name: "Answer as officer" }).click();
    await expect(page.locator("div").filter({ hasText: Q2 }).first()).not.toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/admin/audit");
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, CLIENT_EMAIL, CLIENT_PASSWORD);
    await expect(page.getByText(OFFICER_REPLY)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Lurong Chen — your compliance officer")).toBeVisible();
    await expect(
      page.getByText("MAXIMUS — powered by MITMARK Intelligence Tessera"),
    ).toBeVisible();
  });
});
