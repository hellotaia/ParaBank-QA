import { Page } from "@playwright/test";
import { LoginSection } from "./components/LoginSection";
import { loginUrl } from "../constants/endpoints";

export class LoginPage {
  readonly page: Page;
  readonly loginSection: LoginSection;

  constructor(page: Page) {
    this.page = page;
    this.loginSection = new LoginSection(page);
  }

  async goto() {
    await this.page.goto(loginUrl);
  }

  async login(username: string, password: string) {
    await this.loginSection.usernameInput.fill(username);
    await this.loginSection.passwordInput.fill(password);
    await this.loginSection.loginBtn.click();
  }
}
