import { test, expect, App } from "../../fixtures/baseTest";
import { defaultUserData } from "../../constants/users";
import AxeBuilder from "@axe-core/playwright";

const pages: Array<{
  name: string;
  pageKey: keyof App;
}> = [
  { name: "Home", pageKey: "homePage" },
  { name: "Sign Up", pageKey: "signUpPage" },
  { name: "Accounts Overview", pageKey: "accountsOverviewPage" },
  { name: "Open New Account", pageKey: "openNewAccPage" },
  { name: "Transfer Funds", pageKey: "transferFundsPage" },
  { name: "Bill Pay", pageKey: "billPayPage" },
  { name: "Request Loan", pageKey: "requestLoanPage" },
];

test.describe(
  "Accessibility tests",
  {
    tag: ["@ui", "@accessibility"],
  },
  () => {
    test.beforeEach(async ({ bankApi, app }) => {
      await bankApi.resetDB();
      await app.homePage.goto();
      await app.loginPage.login(
        defaultUserData.username,
        defaultUserData.password,
      );
    });

    pages.forEach(({ name, pageKey }) => {
      test(`Accessibility - ${name} page`, async ({ app, page }) => {
        await app[pageKey].goto();

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const allowedIgnore = new Set([
          "color-contrast",
          "html-has-lang",
          "image-alt",
          "label",
          "link-name",
          "select-name",
        ]);

        const filtered = results.violations.filter(
          (v) => !allowedIgnore.has(v.id),
        );

        expect(filtered).toEqual([]);
      });
    });
  },
);
