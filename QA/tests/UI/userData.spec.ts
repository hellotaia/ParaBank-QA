import { test, expect } from "../../fixtures/baseTest";
import { buildSignUpUser } from "../../constants/users";
import { errorMessages } from "../../constants/messages";

test.describe(
  "User data tests",
  {
    tag: ["@ui", "@user_data"],
  },
  () => {
    test.beforeEach(async ({ app }) => {
      await app.homePage.goto();
    });

    test("RGU-1 User can be created", async ({ app }) => {
      const user = buildSignUpUser("rgu-1");
      await app.homePage.openSignUpPage();
      await app.signUpPage.register(user);

      await expect(app.signUpPage.welcomeHeader).toHaveText(
        `Welcome ${user.username}`,
      );
      await expect(app.homePage.leftPanel).toContainText(
        `Welcome ${user.firstName} ${user.lastName}`,
      );
    });

    test("RGU-2 User with duplicated username can not be created", async ({
      app,
    }) => {
      const user = buildSignUpUser("rgu-2", { username: "john" });
      await app.homePage.openSignUpPage();
      await app.signUpPage.fillRegistrationForm(user);
      await app.signUpPage.submitRegistrationForm();
      await expect(
        app.signUpPage.getErrorByInputName("customer.username"),
      ).toHaveText(errorMessages.usernameAlreadyExistsMessage);
    });

    test("RGU-3 Empty password is not allowed while registration", async ({
      app,
    }) => {
      const user = buildSignUpUser("rgu-3", {
        password: "",
        confirmPassword: "",
      });
      await app.homePage.openSignUpPage();
      await app.signUpPage.fillRegistrationForm(user);
      await app.signUpPage.submitRegistrationForm();
      await expect(
        app.signUpPage.getErrorByInputName("customer.password"),
      ).toHaveText("Password is required.");
      await expect(
        app.signUpPage.getErrorByInputName("repeatedPassword"),
      ).toHaveText(errorMessages.passwordRequiredMessage);
    });

    test("RGU-4 Password should be the confirmed", async ({ app }) => {
      const user = buildSignUpUser("rgu-4", {
        password: "123456",
        confirmPassword: "654321",
      });
      await app.homePage.openSignUpPage();
      await app.signUpPage.fillRegistrationForm(user);
      await app.signUpPage.submitRegistrationForm();
      await expect(
        app.signUpPage.getErrorByInputName("repeatedPassword"),
      ).toHaveText(errorMessages.passwordMismatchMessage);
    });
  },
);
