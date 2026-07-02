import { test, expect } from "../../fixtures/baseTest";

test.describe(
  "Account Data API tests",
  {
    tag: ["@api", "@account_data"],
  },
  () => {
    test.beforeEach(async ({ bankApi }) => {
      await bankApi.resetDB();
    });

    test("ACA-1 Send funds via API", async ({ bankApi, users, testData }) => {
      const user = await users.createApiUserWithTwoAccounts("aca-1");

      const fromAccountId = user.firstAccount.id;
      const toAccountId = user.secondAccount.id;

      const fromAccountBefore = await bankApi.getAccountById(fromAccountId);
      const toAccountBefore = await bankApi.getAccountById(toAccountId);

      const transferResponse = await bankApi.transferFunds(
        fromAccountId,
        toAccountId,
        testData.transferAmount,
      );

      expect(transferResponse).toContain("Successfully transferred");

      const fromAccountAfter = await bankApi.getAccountById(fromAccountId);
      const toAccountAfter = await bankApi.getAccountById(toAccountId);

      expect(Number(fromAccountAfter.balance)).toBeCloseTo(
        Number(fromAccountBefore.balance) - testData.transferAmount,
        2,
      );
      expect(Number(toAccountAfter.balance)).toBeCloseTo(
        Number(toAccountBefore.balance) + testData.transferAmount,
        2,
      );
    });

    test("ACA-2 Make bill payment via API", async ({
      bankApi,
      users,
      testData,
    }) => {
      const user = await users.createApiUserWithTwoAccounts("aca-2");

      const fromAccountId = user.firstAccount.id;
      const toAccountId = user.secondAccount.id;

      const fromAccountBefore = await bankApi.getAccountById(fromAccountId);

      const billPayResponse = await bankApi.billPay(
        fromAccountId,
        toAccountId,
        testData.billPaymentAmount,
      );

      expect(billPayResponse.payeeName).toBe("Test Payee");
      expect(Number(billPayResponse.amount)).toBe(testData.billPaymentAmount);
      expect(String(billPayResponse.accountId)).toBe(fromAccountId);

      const fromAccountAfter = await bankApi.getAccountById(fromAccountId);
      const fromBalanceBeforeCents = Math.round(
        Number(fromAccountBefore.balance) * 100,
      );
      const paymentAmountCents = Math.round(testData.billPaymentAmount * 100);
      const fromBalanceAfterCents = Math.round(
        Number(fromAccountAfter.balance) * 100,
      );

      expect(fromBalanceAfterCents).toBe(
        fromBalanceBeforeCents - paymentAmountCents,
      );
    });
  },
);
