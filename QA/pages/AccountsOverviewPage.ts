import { Locator, Page, expect } from "@playwright/test";
import { formatDate } from "../fixtures/baseTest";
import { accountOverviewUrl } from "../constants/endpoints";

type AccountColumn = "balance" | "availableAmount";
type TransactionColumn = "date" | "title" | "debit" | "credit";
type TransactionTitle =
  | "Funds Transfer Sent"
  | "Funds Transfer Received"
  | "Bill Payment to Test Payee";

export class AccountsOverviewPage {
  readonly page: Page;

  // Overview Page
  readonly accountTable: Locator;
  readonly accountRows: Locator;
  readonly totalRow: Locator;

  //Account Details
  readonly accountDetailsTitle: Locator;
  readonly accountNumberValue: Locator;
  readonly accountTypeValue: Locator;
  readonly accountBalanceValue: Locator;
  readonly accountAvailableValue: Locator;
  readonly accountActivityTitle: Locator;
  readonly activityPeriodDropdown: Locator;
  readonly transactionTypeDropdown: Locator;
  readonly transactionTable: Locator;
  readonly transactionRows: Locator;

  constructor(page: Page) {
    this.page = page;

    //Overview page
    this.accountTable = page.locator("#accountTable");
    this.accountRows = this.accountTable.locator(
      'tbody tr[ng-repeat="account in accounts"]',
    );
    this.totalRow = this.accountTable.locator("tbody tr", {
      hasText: "Total",
    });

    //Account Details
    this.accountDetailsTitle = page.locator("#rightPanel h1.title", {
      hasText: "Account Details",
    });
    this.accountNumberValue = page.locator("#accountId");
    this.accountTypeValue = page.locator("#accountType");
    this.accountBalanceValue = page.locator("#balance");
    this.accountAvailableValue = page.locator("#availableBalance");
    this.accountActivityTitle = page.locator("#rightPanel h1.title", {
      hasText: "Account Activity",
    });
    this.activityPeriodDropdown = page.locator("#month");
    this.transactionTypeDropdown = page.locator("#transactionType");
    this.transactionTable = page.locator("#transactionTable");
    this.transactionRows = this.transactionTable.locator("tbody tr");
  }

  async goto() {
    await this.page.goto(accountOverviewUrl);
  }

  async getDefaultAccountId(): Promise<string> {
    const firstAccountRow = this.accountRows.first();
    await firstAccountRow.waitFor({ state: "visible" });

    const accountId = await firstAccountRow.locator("a").innerText();
    return accountId.trim();
  }

  getAccountRow(accountId: string): Locator {
    return this.accountRows.filter({
      hasText: accountId,
    });
  }

  getAccountAmount(accountId: string, column: AccountColumn): Locator {
    const columnIndex = {
      balance: 1,
      availableAmount: 2,
    };

    return this.getAccountRow(accountId).locator("td").nth(columnIndex[column]);
  }

  async getAccountAmountValue(
    accountId: string,
    column: "balance" | "availableAmount",
  ): Promise<number> {
    const amountText = await this.getAccountAmount(
      accountId,
      column,
    ).innerText();
    return Number(amountText.replace("$", "").trim());
  }

  getAccountLink(accountId: string): Locator {
    return this.getAccountRow(accountId).locator("a");
  }

  getTotalBalance(): Locator {
    return this.totalRow.locator("td").nth(1);
  }

  //AccountActivity
  async openAccountDetails(accountId: string) {
    await this.getAccountLink(accountId).click();
  }

  async openTransactionDetails(transactionTitle: string) {
    await this.getTransactionRow(transactionTitle).locator("a").click();
  }

  async verifyAccountDetailsDisplayed(
    accountId: string,
    accountType: "CHECKING" | "SAVINGS",
    expectedBalance: number,
  ) {
    const expectedAmount = `$${expectedBalance.toFixed(2)}`;
    await expect(this.accountDetailsTitle).toHaveText("Account Details");
    await expect(this.accountNumberValue).toHaveText(accountId);
    await expect(this.accountTypeValue).toHaveText(accountType);
    await expect(this.accountBalanceValue).toHaveText(expectedAmount);
    await expect(this.accountAvailableValue).toHaveText(expectedAmount);
    await expect(
      this.activityPeriodDropdown.locator("option:checked"),
    ).toHaveText("All");
    await expect(
      this.transactionTypeDropdown.locator("option:checked"),
    ).toHaveText("All");
  }

  //Transactions table
  getTransactionRow(description: string): Locator {
    return this.transactionRows.filter({ hasText: description });
  }

  getTransactionRowByTitleAndAmount(
    transactionTitle: string,
    amount: string,
  ): Locator {
    return this.transactionRows
      .filter({ hasText: transactionTitle })
      .filter({ hasText: amount })
      .last();
  }

  getTransactionCell(
    transactionRow: Locator,
    column: TransactionColumn,
  ): Locator {
    const columnIndex: Record<TransactionColumn, number> = {
      date: 0,
      title: 1,
      debit: 2,
      credit: 3,
    };
    return transactionRow.locator("td").nth(columnIndex[column]);
  }

  getTransactionDate(transactionRow: Locator): Locator {
    return this.getTransactionCell(transactionRow, "date");
  }

  getTransactionTitle(transactionRow: Locator): Locator {
    return this.getTransactionCell(transactionRow, "title");
  }

  getExpectedTransactionDate(date = new Date()): string {
    return formatDate(date, "-");
  }

  async verifyAccountActivityDisplayed() {
    await expect(this.accountActivityTitle).toHaveText("Account Activity");
    await expect(this.transactionTable).toBeVisible();
  }

  async verifyTransactionDisplayed(
    transactionTitle: TransactionTitle,
    amount: number,
    amountColumn: "debit" | "credit",
  ) {
    const expectedAmount = `$${amount.toFixed(2)}`;
    const transactionRow = this.getTransactionRowByTitleAndAmount(
      transactionTitle,
      expectedAmount,
    );

    await expect(transactionRow).toBeVisible();
    await expect(this.getTransactionDate(transactionRow)).toHaveText(
      this.getExpectedTransactionDate(),
    );
    await expect(this.getTransactionTitle(transactionRow)).toHaveText(
      transactionTitle,
    );
    if (amountColumn === "debit") {
      await expect(
        this.getTransactionCell(transactionRow, amountColumn),
      ).toHaveText(expectedAmount);
    }
    if (amountColumn === "credit") {
      await expect(
        this.getTransactionCell(transactionRow, amountColumn),
      ).toHaveText(expectedAmount);
    }
  }

  async verifyAccountStatementTransaction(
    accountId: string,
    transactionTitle: TransactionTitle,
    amount: number,
    amountColumn: "debit" | "credit",
  ) {
    await this.openAccountDetails(accountId);
    await this.verifyAccountActivityDisplayed();
    await this.verifyTransactionDisplayed(
      transactionTitle,
      amount,
      amountColumn,
    );
  }
}
