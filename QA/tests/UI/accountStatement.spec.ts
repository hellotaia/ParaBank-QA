import { test } from "../../fixtures/baseTest";

test.describe(
  "Account Statement tests",
  {
    tag: ["@ui", "@account_statement"],
  },
  () => {
    test.beforeEach(async ({ app }) => {
      await app.homePage.goto();
    });

    test("ADU-1 User is able to see account details for each account", async ({
      app,
      users,
      testData,
    }) => {
      await app.adminPage.goto();
      await app.adminPage.changeAccountBalance(
        testData.initialBalance,
        testData.minimumBalance,
      );

      const user = await users.createUiUserWithTwoAccounts("adu-1", "SAVINGS");

      await app.accountsOverviewPage.goto();
      await app.accountsOverviewPage.openAccountDetails(user.firstAccount.id);

      await app.accountsOverviewPage.verifyAccountDetailsDisplayed(
        user.firstAccount.id,
        "CHECKING",
        user.firstAccount.balance,
      );

      await app.accountsOverviewPage.goto();
      await app.accountsOverviewPage.openAccountDetails(user.secondAccount.id);

      await app.accountsOverviewPage.verifyAccountDetailsDisplayed(
        user.secondAccount.id,
        "SAVINGS",
        user.secondAccount.balance,
      );
    });

    test("ADU-2 User is able to see statement for the account", async ({
      users,
      app,
      testData,
    }) => {
      await app.adminPage.goto();
      await app.adminPage.changeAccountBalance(
        testData.initialBalance,
        testData.minimumBalance,
      );

      const user = await users.createUiUserWithTwoAccounts("adu-2", "SAVINGS");

      await app.homePage.openTransferFunds();
      await app.transferFundsPage.transferAmount(
        testData.transferAmount,
        user.firstAccount.id,
        user.secondAccount.id,
      );

      await app.homePage.openAccountOverview();
      await app.accountsOverviewPage.verifyAccountStatementTransaction(
        user.firstAccount.id,
        "Funds Transfer Sent",
        testData.transferAmount,
        "debit",
      );

      await app.homePage.openAccountOverview();
      await app.accountsOverviewPage.verifyAccountStatementTransaction(
        user.secondAccount.id,
        "Funds Transfer Received",
        testData.transferAmount,
        "credit",
      );
    });

    test("ADU-3 User can see details for each transaction in account", async ({
      users,
      app,
      testData,
    }) => {
      await app.adminPage.goto();
      await app.adminPage.changeAccountBalance(
        testData.initialBalance,
        testData.minimumBalance,
      );

      const user = await users.createUiUserWithTwoAccounts("adu-3", "SAVINGS");

      // Preconditions: first operation - transfer
      await app.homePage.openTransferFunds();
      await app.transferFundsPage.transferAmount(
        testData.transferAmount,
        user.firstAccount.id,
        user.secondAccount.id,
      );

      // Precondition: second operation - bill payment
      await app.homePage.openBillPay();
      await app.billPayPage.payBill({
        payeeName: "Test Payee",
        address: user.user.address,
        city: user.user.city,
        state: user.user.state,
        zipCode: user.user.zipCode,
        phoneNumber: user.user.phoneNumber,
        accountNumber: user.secondAccount.id,
        amount: testData.billPaymentAmount,
        fromAccountId: user.firstAccount.id,
      });

      // Verify transaction details for Funds Transfer Sent
      await app.homePage.openAccountOverview();
      await app.accountsOverviewPage.verifyAccountStatementTransaction(
        user.firstAccount.id,
        "Funds Transfer Sent",
        testData.transferAmount,
        "debit",
      );
      // Verify transaction details for Bill Payment
      await app.homePage.openAccountOverview();
      await app.accountsOverviewPage.verifyAccountStatementTransaction(
        user.firstAccount.id,
        "Bill Payment to Test Payee",
        testData.billPaymentAmount,
        "debit",
      );
    });
  },
);
