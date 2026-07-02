import { test as base, expect } from "@playwright/test";

import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SignUpPage } from "../pages/SignUpPage";
import { AccountsOverviewPage } from "../pages/AccountsOverviewPage";
import { AdminPage } from "../pages/AdminPage";
import { OpenNewAccPage } from "../pages/OpenNewAccPage";
import { TransferFundsPage } from "../pages/TransferFundsPage";
import { BillPayPage } from "../pages/BillPayPage";
import { RequestLoanPage } from "../pages/RequestLoanPage";
import { BankApi } from "../apiClients/bankApiClient";
import { buildSignUpUser, SignUpUser, userIds } from "../constants/users";

type TestAccount = {
  id: string;
  balance: number;
};

type UserWithOneAccount = {
  user: SignUpUser;
  account: TestAccount;
};

type UserWithTwoAccounts = {
  user: SignUpUser;
  firstAccount: TestAccount;
  secondAccount: TestAccount;
};

export type App = {
  homePage: HomePage;
  loginPage: LoginPage;
  signUpPage: SignUpPage;
  adminPage: AdminPage;
  accountsOverviewPage: AccountsOverviewPage;
  openNewAccPage: OpenNewAccPage;
  transferFundsPage: TransferFundsPage;
  billPayPage: BillPayPage;
  requestLoanPage: RequestLoanPage;
};

type UserFactory = {
  createUiUserWithOneAccount: (
    usernamePrefix: string,
    overrides?: Partial<SignUpUser>,
  ) => Promise<UserWithOneAccount>;

  createUiUserWithTwoAccounts: (
    usernamePrefix: string,
    accountType?: "CHECKING" | "SAVINGS",
    overrides?: Partial<SignUpUser>,
  ) => Promise<UserWithTwoAccounts>;

  createApiUserWithOneAccount: (
    usernamePrefix: string,
    overrides?: Partial<SignUpUser>,
  ) => Promise<UserWithOneAccount>;

  createApiUserWithTwoAccounts: (
    usernamePrefix: string,
    accountType?: "CHECKING" | "SAVINGS",
    overrides?: Partial<SignUpUser>,
  ) => Promise<UserWithTwoAccounts>;
};

type TestData = {
  initialBalance: number;
  minimumBalance: number;
  transferAmount: number;
  billPaymentAmount: number;
  defaultAccountBalance: number;
  loanAmount: number;
  downPayment: number;
};

type Fixtures = {
  app: App;
  bankApi: BankApi;
  users: UserFactory;
  resetDatabase: void;
  testData: TestData;
};

export type DateSeparator = "/" | "-";

export const test = base.extend<Fixtures>({
  resetDatabase: [
    async ({ request }, use) => {
      const bankApi = new BankApi(request);
      await bankApi.resetDB();
      await use();
    },
    { auto: false },
  ],

  bankApi: async ({ request }, use) => {
    await use(new BankApi(request));
  },

  app: async ({ page }, use) => {
    await use({
      homePage: new HomePage(page),
      loginPage: new LoginPage(page),
      signUpPage: new SignUpPage(page),
      accountsOverviewPage: new AccountsOverviewPage(page),
      openNewAccPage: new OpenNewAccPage(page),
      transferFundsPage: new TransferFundsPage(page),
      billPayPage: new BillPayPage(page),
      requestLoanPage: new RequestLoanPage(page),
      adminPage: new AdminPage(page),
    });
  },

  testData: async ({}, use) => {
    await use({
      initialBalance: 100.26,
      minimumBalance: 55.32,
      transferAmount: 6.24,
      billPaymentAmount: 7.13,
      defaultAccountBalance: 515.5,
      loanAmount: 100,
      downPayment: 20,
    });
  },

  users: async ({ app, bankApi }, use) => {
    const createUiUserWithOneAccount = async (
      usernamePrefix: string,
      overrides: Partial<SignUpUser> = {},
    ): Promise<UserWithOneAccount> => {
      const user = buildSignUpUser(usernamePrefix, overrides);

      await app.homePage.goto();
      await app.homePage.openSignUpPage();
      await app.signUpPage.register(user);

      await expect(app.signUpPage.welcomeHeader).toContainText(user.username);

      await app.accountsOverviewPage.goto();
      const accountId = await app.accountsOverviewPage.getDefaultAccountId();
      const balance = await app.accountsOverviewPage.getAccountAmountValue(
        accountId,
        "balance",
      );

      return {
        user,
        account: {
          id: accountId,
          balance,
        },
      };
    };

    const createUiUserWithTwoAccounts = async (
      usernamePrefix: string,
      accountType: "CHECKING" | "SAVINGS" = "SAVINGS",
      overrides: Partial<SignUpUser> = {},
    ): Promise<UserWithTwoAccounts> => {
      const userWithOneAccount = await createUiUserWithOneAccount(
        usernamePrefix,
        overrides,
      );

      await app.homePage.openNewAccount();
      await app.openNewAccPage.selectAccountType(accountType);
      await app.openNewAccPage.openNewAccountBtn.click();

      await expect(app.openNewAccPage.pageTitle).toHaveText("Account Opened!");

      const secondAccountId = await app.openNewAccPage.getNewAccountId();

      await app.accountsOverviewPage.goto();

      const firstAccountBalance =
        await app.accountsOverviewPage.getAccountAmountValue(
          userWithOneAccount.account.id,
          "balance",
        );

      const secondAccountBalance =
        await app.accountsOverviewPage.getAccountAmountValue(
          secondAccountId,
          "balance",
        );

      return {
        user: userWithOneAccount.user,
        firstAccount: {
          id: userWithOneAccount.account.id,
          balance: firstAccountBalance,
        },
        secondAccount: {
          id: secondAccountId,
          balance: secondAccountBalance,
        },
      };
    };

    const createApiUserWithOneAccount = async (
      usernamePrefix: string,
      overrides: Partial<SignUpUser> = {},
    ): Promise<UserWithOneAccount> => {
      const user = buildSignUpUser(usernamePrefix, overrides);

      await bankApi.createUser(user);

      const accounts = await bankApi.getCustomerAccounts(
        userIds.firstCreatedUserId,
      );

      return {
        user,
        account: {
          id: String(accounts[0].id),
          balance: Number(accounts[0].balance),
        },
      };
    };

    const createApiUserWithTwoAccounts = async (
      usernamePrefix: string,
      accountType: "CHECKING" | "SAVINGS" = "SAVINGS",
      overrides: Partial<SignUpUser> = {},
    ): Promise<UserWithTwoAccounts> => {
      const userWithOneAccount = await createApiUserWithOneAccount(
        usernamePrefix,
        overrides,
      );

      const secondAccount = await bankApi.createAccount(
        userIds.firstCreatedUserId,
        userWithOneAccount.account.id,
        accountType,
      );

      const firstAccountAfterCreation = await bankApi.getAccountById(
        userWithOneAccount.account.id,
      );

      return {
        user: userWithOneAccount.user,
        firstAccount: {
          id: userWithOneAccount.account.id,
          balance: Number(firstAccountAfterCreation.balance),
        },
        secondAccount: {
          id: String(secondAccount.id),
          balance: Number(secondAccount.balance),
        },
      };
    };

    await use({
      createUiUserWithOneAccount,
      createUiUserWithTwoAccounts,
      createApiUserWithOneAccount,
      createApiUserWithTwoAccounts,
    });
  },
});

export { expect };

export function formatDate(
  date: Date = new Date(),
  separator: DateSeparator = "/",
): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}${separator}${day}${separator}${year}`;
}
