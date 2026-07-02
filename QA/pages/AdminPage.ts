import { Locator, Page } from "@playwright/test";
import { adminUrl } from "../constants/endpoints";

export class AdminPage {
  readonly page: Page;
  readonly adminForm: Locator;
  readonly initialBalance: Locator;
  readonly minimumBalance: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminForm = page.locator("#adminForm");
    this.initialBalance = this.adminForm.locator(
      'input[name="initialBalance"]',
    );
    this.minimumBalance = this.adminForm.locator(
      'input[name="minimumBalance"]',
    );
    this.submitBtn = this.adminForm.locator(
      'input[type="submit"][value="Submit"]',
    );
  }

  async goto() {
    await this.page.goto(adminUrl);
  }

  async changeAccountBalance(initialBalance: number, minimumBalance: number) {
    await this.initialBalance.fill(initialBalance.toString());
    await this.minimumBalance.fill(minimumBalance.toString());
    await this.submitBtn.click();
  }
}
