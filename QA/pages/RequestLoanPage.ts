import { Locator, Page } from "@playwright/test";
import { formatDate } from "../fixtures/baseTest";
import { requestLoanPageUrl } from "../constants/endpoints";

export class RequestLoanPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly loanAmountInput: Locator;
  readonly downPaymentInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly applyNowBtn: Locator;

  readonly loanProvider: Locator;
  readonly responseDate: Locator;
  readonly loanStatus: Locator;
  readonly approvedResultSection: Locator;
  readonly approvedMessage: Locator;
  readonly newAccountId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("#rightPanel h1.title:visible");

    this.loanAmountInput = page.locator('input[id="amount"]');
    this.downPaymentInput = page.locator('input[id="downPayment"]');
    this.fromAccountSelect = page.locator('select[id="fromAccountId"]');
    this.applyNowBtn = page.locator('input[value="Apply Now"]');

    this.loanProvider = page.locator("#loanProviderName");
    this.responseDate = page.locator("#responseDate");
    this.loanStatus = page.locator("#loanStatus");

    this.approvedResultSection = page.locator(
      'div[ng-if="loanResponse.approved"]',
    );
    this.approvedMessage = this.approvedResultSection
      .locator("p")
      .filter({ hasText: "Congratulations, your loan has been approved." });
    this.newAccountId = page.locator("#newAccountId");
  }

  async goto() {
    await this.page.goto(requestLoanPageUrl);
  }

  async applyForALoan(
    loanAmount: number,
    downPayment: number,
    accountId: string,
  ) {
    await this.loanAmountInput.fill(loanAmount.toString());
    await this.downPaymentInput.fill(downPayment.toString());
    await this.fromAccountSelect.selectOption({ value: accountId });
    await this.applyNowBtn.click();
  }

  async getNewAccountId(): Promise<string> {
    const accountId = await this.newAccountId.innerText();
    return accountId.trim();
  }

  async getLoanResult() {
    return {
      provider: (await this.loanProvider.innerText()).trim(),
      date: (await this.responseDate.innerText()).trim(),
      status: (await this.loanStatus.innerText()).trim(),
    };
  }

  getExpectedLoanDate(date = new Date()): string {
    const formattedDate = formatDate(date, "-");
    return formattedDate.replace(/-(0)(\d)-/, "-$2-");
  }
}
