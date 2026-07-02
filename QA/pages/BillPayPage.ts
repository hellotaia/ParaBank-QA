import { Locator, Page } from "@playwright/test";
import { billPayPageUrl } from "../constants/endpoints";

type BillPayData = {
  payeeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  accountNumber: string;
  amount: number;
  fromAccountId: string;
};

export class BillPayPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly payeeNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly accountNumberInput: Locator;
  readonly verifyAccountInput: Locator;
  readonly amountInput: Locator;
  readonly fromAccountDropdown: Locator;
  readonly sendPaymentBtn: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("#rightPanel h1.title:visible");

    this.payeeNameInput = page.locator('input[name="payee.name"]');
    this.addressInput = page.locator('input[name="payee.address.street"]');
    this.cityInput = page.locator('input[name="payee.address.city"]');
    this.stateInput = page.locator('input[name="payee.address.state"]');
    this.zipCodeInput = page.locator('input[name="payee.address.zipCode"]');
    this.phoneNumberInput = page.locator('input[name="payee.phoneNumber"]');

    this.accountNumberInput = page.locator('input[name="payee.accountNumber"]');
    this.verifyAccountInput = page.locator('input[name="verifyAccount"]');

    this.amountInput = page.locator('input[name="amount"]');
    this.fromAccountDropdown = page.locator('select[name="fromAccountId"]');
    this.sendPaymentBtn = page.locator('input[value="Send Payment"]');
    this.successMessage = page.locator('div[ng-show="showResult"] p').first();
  }

  async goto() {
    await this.page.goto(billPayPageUrl);
  }

  async payBill(data: BillPayData) {
    await this.payeeNameInput.fill(data.payeeName);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
    await this.phoneNumberInput.fill(data.phoneNumber);

    await this.accountNumberInput.fill(data.accountNumber);
    await this.verifyAccountInput.fill(data.accountNumber);
    await this.amountInput.fill(data.amount.toFixed(2));
    await this.fromAccountDropdown.selectOption({ value: data.fromAccountId });
    await this.sendPaymentBtn.click();
  }
}
