import { Locator, Page } from "@playwright/test";
import { SignUpSection } from "./components/SignUpSection";
import { SignUpUser } from "../constants/users";
import { homePageUrl } from "../constants/endpoints";

export class SignUpPage {
  readonly page: Page;
  readonly signUpSection: SignUpSection;
  readonly welcomeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpSection = new SignUpSection(page);
    this.welcomeHeader = page.locator("#rightPanel h1");
  }

  async fillRegistrationForm(user: SignUpUser) {
    await this.signUpSection.firstNameInput.fill(user.firstName);
    await this.signUpSection.lastNameInput.fill(user.lastName);
    await this.signUpSection.addressInput.fill(user.address);
    await this.signUpSection.cityInput.fill(user.city);
    await this.signUpSection.stateInput.fill(user.state);
    await this.signUpSection.zipInput.fill(user.zipCode);
    await this.signUpSection.phoneInput.fill(user.phoneNumber);
    await this.signUpSection.ssnInput.fill(user.ssn);
    await this.signUpSection.usernameInput.fill(user.username);
    await this.signUpSection.passwordInput.fill(user.password);
    await this.signUpSection.repeatedPasswordInput.fill(
      user.confirmPassword ?? user.password,
    );
  }

  async goto() {
    await this.page.goto(homePageUrl);
  }

  async submitRegistrationForm() {
    await this.signUpSection.registerBtn.click();
  }

  async register(user: SignUpUser) {
    await this.fillRegistrationForm(user);
    await this.submitRegistrationForm();
  }

  getErrorByInputName(inputName: string): Locator {
    return this.page.locator(`[id="${inputName}.errors"]`);
  }
}
