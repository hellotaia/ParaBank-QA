import { Locator, Page } from "@playwright/test";
import { openAccountUrl } from "../constants/endpoints";

export class OpenNewAccPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  readonly accountTypeDropdown: Locator;
  readonly fromAccountDropdown: Locator;
  readonly openNewAccountBtn: Locator;
  readonly newAccountId: Locator;
  readonly minimumAmountMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1.title");
    this.accountTypeDropdown = page.locator('select[id="type"]');
    this.fromAccountDropdown = page.locator('select[id="fromAccountId"]');

    this.openNewAccountBtn = page.locator(
      'input[type="submit"][value="Open New Account"]',
    );
    this.newAccountId = page.locator('a[id="newAccountId"]');
    this.minimumAmountMessage = page.locator("#rightPanel p").filter({
      hasText: "A minimum of",
    });
  }

  async goto() {
    await this.page.goto(openAccountUrl);
  }

  async selectAccountType(accountType: "CHECKING" | "SAVINGS") {
    await this.accountTypeDropdown.selectOption({ label: accountType });
  }

  async getNewAccountId(): Promise<string> {
    await this.newAccountId.waitFor();
    const accountId = await this.newAccountId.textContent();
    if (!accountId) {
      throw new Error("New account id is not displayed");
    }
    return accountId.trim();
  }
}
