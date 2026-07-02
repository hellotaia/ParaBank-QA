import { test, expect } from "../../fixtures/baseTest";
import { infoMessages } from "../../constants/messages";

test.describe(
  "Account data tests",
  {
    tag: ["@ui", "@account_data"],
  },
  () => {
    test.beforeEach(async ({ bankApi, app }) => {
      await app.homePage.goto();
      await bankApi.resetDB();
    });

    test("ACU-1 Associated with the user account is created", async ({
      app,
      users,
      testData,
    }) => {
      await app.adminPage.goto();
      await app.adminPage.changeAccountBalance(
        testData.initialBalance,
        testData.initialBalance,
      );

      const user = await users.createUiUserWithOneAccount("acu-1");
      await app.homePage.openAccountOverview();
      await expect(app.accountsOverviewPage.accountTable).toBeVisible();
      await expect(app.accountsOverviewPage.accountRows).toHaveCount(1);

      await expect(
        app.accountsOverviewPage.getAccountRow(user.account.id),
      ).toBeVisible();
      await expect(
        app.accountsOverviewPage.getAccountAmount(user.account.id, "balance"),
      ).toHaveText(`$${testData.initialBalance}`);
      await expect(
        app.accountsOverviewPage.getAccountAmount(
          user.account.id,
          "availableAmount",
        ),
      ).toHaveText(`$${testData.initialBalance}`);
      await expect(app.accountsOverviewPage.getTotalBalance()).toHaveText(
        `$${testData.initialBalance}`,
      );
    });

    test("ACU-2 Additional account can be created for User", async ({
      app,
      users,
      testData,
    }) => {
      await app.adminPage.goto();
      await app.adminPage.changeAccountBalance(
        testData.initialBalance,
        testData.minimumBalance,
      );

      const user = await users.createUiUserWithOneAccount("acu-2");
      const defaultAcc = user.account.id;
      await app.homePage.openNewAccount();

      await expect(app.openNewAccPage.pageTitle).toHaveText("Open New Account");
      await expect(app.openNewAccPage.minimumAmountMessage).toContainText(
        `${testData.minimumBalance}`,
      );

      await app.openNewAccPage.selectAccountType("SAVINGS");
      await app.openNewAccPage.openNewAccountBtn.click();
      await expect(app.openNewAccPage.pageTitle).toHaveText(
        infoMessages.accountOpenedTitle,
      );
      const newAcc = await app.openNewAccPage.getNewAccountId();

      await app.homePage.openAccountOverview();

      await expect(
        app.accountsOverviewPage.getAccountAmount(defaultAcc, "balance"),
      ).toHaveText(
        `$${(testData.initialBalance - testData.minimumBalance).toFixed(2)}`,
      );
      await expect(
        app.accountsOverviewPage.getAccountAmount(newAcc, "balance"),
      ).toHaveText(`$${testData.minimumBalance.toFixed(2)}`);
      await expect(app.accountsOverviewPage.getTotalBalance()).toHaveText(
        `$${testData.initialBalance.toFixed(2)}`,
      );
    });

    test("ACU-3 User can transfer money between accounts", async ({
      app,
      users,
      testData,
    }) => {
      const user = await users.createUiUserWithOneAccount("acu-3");
      const fromAcc = user.account.id;

      await app.homePage.openNewAccount();
      await app.openNewAccPage.selectAccountType("SAVINGS");
      await app.openNewAccPage.openNewAccountBtn.click();
      const toAcc = await app.openNewAccPage.getNewAccountId();

      await app.accountsOverviewPage.goto();
      const fromAccountInitBalance =
        await app.accountsOverviewPage.getAccountAmountValue(
          fromAcc,
          "balance",
        );
      const toAccountInitBalance =
        await app.accountsOverviewPage.getAccountAmountValue(toAcc, "balance");

      await app.homePage.openTransferFunds();

      await expect(app.transferFundsPage.pageTitle).toHaveText(
        "Transfer Funds",
      );
      await expect(
        app.transferFundsPage.fromAccountDropdown.locator("option"),
      ).toContainText([fromAcc, toAcc]);

      await app.transferFundsPage.transferAmount(
        testData.transferAmount,
        fromAcc,
        toAcc,
      );
      await expect(app.transferFundsPage.pageTitle).toHaveText(
        "Transfer Complete!",
      );
      await app.homePage.openAccountOverview();

      await expect(
        app.accountsOverviewPage.getAccountAmount(fromAcc, "balance"),
      ).toHaveText(
        `$${(fromAccountInitBalance - testData.transferAmount).toFixed(2)}`,
      );
      await expect(
        app.accountsOverviewPage.getAccountAmount(toAcc, "balance"),
      ).toHaveText(
        `$${(toAccountInitBalance + testData.transferAmount).toFixed(2)}`,
      );
    });

    test("ACU-4 User can pay a bill", async ({
      app,
      users,
      bankApi,
      testData,
    }) => {
      const user2 = await users.createUiUserWithOneAccount("acu-42", {
        firstName: "Payee",
        lastName: "User2",
      });
      await app.homePage.logout();

      const user1 = await users.createUiUserWithOneAccount("acu-41", {
        firstName: "Payer",
        lastName: "User1",
      });

      await app.homePage.openBillPay();
      await expect(app.billPayPage.pageTitle).toHaveText(
        "Bill Payment Service",
      );

      await app.billPayPage.payBill({
        payeeName: `${user2.user.firstName} ${user2.user.lastName}`,
        address: user2.user.address,
        city: user2.user.city,
        state: user2.user.state,
        zipCode: user2.user.zipCode,
        phoneNumber: user2.user.phoneNumber,
        accountNumber: user2.account.id,
        amount: testData.billPaymentAmount,
        fromAccountId: user1.account.id,
      });

      await expect(app.billPayPage.pageTitle).toHaveText(
        infoMessages.billPaymentCompleteTitle,
      );

      //UI
      await expect(app.billPayPage.successMessage)
        .toContainText(`Bill Payment to ${user2.user.firstName} ${user2.user.lastName}
                in the amount of $${testData.billPaymentAmount.toFixed(2)} 
                from account ${user1.account.id} was successful`);

      await app.homePage.openAccountOverview();
      await expect(
        app.accountsOverviewPage.getAccountAmount(user1.account.id, "balance"),
      ).toHaveText(
        `$${(user1.account.balance - testData.billPaymentAmount).toFixed(2)}`,
      );

      //API
      const updatedFromAccount = await bankApi.getAccountById(user1.account.id);
      expect(Number(updatedFromAccount.balance)).toBeCloseTo(
        user1.account.balance - testData.billPaymentAmount,
        2,
      );
    });

    test("ACU-5 Request a loan", async ({ users, app, testData }) => {
      const user = await users.createUiUserWithOneAccount("acu-5");
      const expectedLoanDate = app.requestLoanPage.getExpectedLoanDate();

      await app.homePage.openRequestLoan();
      await app.requestLoanPage.applyForALoan(
        testData.loanAmount,
        testData.downPayment,
        user.account.id,
      );

      await expect(app.requestLoanPage.pageTitle).toHaveText(
        "Loan Request Processed",
      );

      await expect(app.requestLoanPage.approvedMessage).toHaveText(
        infoMessages.loanApprovedMessage,
      );
      const newAccountId = await app.requestLoanPage.getNewAccountId();
      const loanResult = await app.requestLoanPage.getLoanResult();

      expect(loanResult.provider).toBe(
        "Wealth Securities Dynamic Loans (WSDL)",
      );
      expect(loanResult.date).toBe(expectedLoanDate);
      expect(loanResult.status).toBe("Approved");

      await app.homePage.openAccountOverview();
      await expect(
        app.accountsOverviewPage.getAccountRow(newAccountId),
      ).toBeVisible();
    });
  },
);
