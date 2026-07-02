import { test, expect, formatDate } from "../../fixtures/baseTest";

test.describe(
  "Smoke",
  {
    tag: ["@ui", "@smoke"],
  },
  () => {
    test.beforeEach(async ({ app }) => {
      await app.homePage.goto();
    });

    test("SMU-1 Home Page is displayed", async ({ app }) => {
      await expect(app.homePage.leftPanel).toContainText("Customer Login");
      await expect(app.homePage.newsSection.atmServices).toBeVisible();
      await expect(app.homePage.newsSection.onlineServices).toBeVisible();
      await expect(app.homePage.newsSection.latestNewsHeader).toHaveText(
        "Latest News",
      );
      await expect(app.homePage.newsSection.latestNewsList).toBeVisible();
    });

    test("SMU-2 Services section is displayed on the Home Page", async ({
      app,
    }) => {
      await expect(app.homePage.newsSection.atmServices).toBeVisible();
      await expect(app.homePage.newsSection.onlineServices).toBeVisible();
      await expect(app.homePage.newsSection.atmServiceItems).toHaveCount(4);
      await expect(app.homePage.newsSection.atmServiceItems).toContainText([
        "Withdraw Funds",
        "Transfer Funds",
        "Check Balances",
        "Make Deposits",
      ]);
      await expect(app.homePage.newsSection.onlineServiceItems).toHaveCount(3);
      await expect(app.homePage.newsSection.onlineServiceItems).toContainText([
        "Bill Pay",
        "Account History",
        "Transfer Funds",
      ]);
    });

    test("SMU-3 News section is displayed on the Home Page", async ({
      app,
    }) => {
      const expectedDate = formatDate();
      await expect(app.homePage.newsSection.newsDate).toContainText(
        expectedDate,
      );
      await expect(app.homePage.newsSection.latestNewsHeader).toHaveText(
        "Latest News",
      );
      await expect(app.homePage.newsSection.latestNewsList).toBeVisible();
      await expect(app.homePage.newsSection.latestNewsHeader).toHaveCSS(
        "color",
        "rgb(255, 255, 255)",
      );
      const newItems = app.homePage.newsSection.latestNewsList.locator("a", {
        hasText: "New!",
      });
      await expect(newItems).toHaveCount(2);
    });
  },
);
