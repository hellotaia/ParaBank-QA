import { Locator, Page } from "@playwright/test";
import { transferFundsUrl } from "../constants/endpoints";
export class TransferFundsPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  readonly amountInput: Locator;
  readonly toAccountDropdown: Locator;
  readonly fromAccountDropdown: Locator;
  readonly transferBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1.title");

    this.amountInput = page.locator('input[id="amount"]');
    this.toAccountDropdown = page.locator('select[id="toAccountId"]');
    this.fromAccountDropdown = page.locator('select[id="fromAccountId"]');
    this.transferBtn = page.locator('input[type="submit"][value="Transfer"]');
  }

  async goto() {
    await this.page.goto(transferFundsUrl);
  }

  async transferAmount(amount: number, fromAccId: string, toAccId: string) {
    await this.amountInput.fill(amount.toFixed(2));
    await this.fromAccountDropdown.selectOption({ value: fromAccId });
    await this.toAccountDropdown.selectOption({ value: toAccId });
    await this.transferBtn.click();
  }
}
