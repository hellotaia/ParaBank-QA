import { Locator, Page } from "@playwright/test";
import { NewsSection } from "./components/NewsSection";
import { LoginSection } from "./components/LoginSection";
import { AccountServiceSection } from "./components/AccountServiceSection";
import { homePageUrl } from "../constants/endpoints";

export class HomePage {
  readonly page: Page;
  readonly newsSection: NewsSection;
  readonly loginSection: LoginSection;
  readonly accountServiceSection: AccountServiceSection;
  readonly leftPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.newsSection = new NewsSection(page);
    this.loginSection = new LoginSection(page);
    this.accountServiceSection = new AccountServiceSection(page);
    this.leftPanel = page.locator("#leftPanel");
  }

  async goto() {
    await this.page.goto(homePageUrl);
  }

  async openSignUpPage() {
    await this.loginSection.registerLink.click();
  }

  async openAccountOverview() {
    await this.accountServiceSection.accountsOverviewLink.click();
  }

  async openNewAccount() {
    await this.accountServiceSection.openNewAccountLink.click();
  }

  async openTransferFunds() {
    await this.accountServiceSection.transferFundsLink.click();
  }

  async openBillPay() {
    await this.accountServiceSection.billPayLink.click();
  }

  async openRequestLoan() {
    await this.accountServiceSection.requestLoanLink.click();
  }

  async logout() {
    await this.page.getByRole("link", { name: "Log Out" }).click();
  }
}
