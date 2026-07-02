import { Locator, Page } from '@playwright/test';

export class LoginSection {
    readonly loginPanel: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginBtn: Locator;
    readonly forgotLoginLink: Locator;
    readonly registerLink: Locator;

    constructor(page: Page) {
        this.loginPanel = page
            .locator('#loginPanel');
        this.usernameInput = this.loginPanel
            .locator('input[name="username"]');
        this.passwordInput = this.loginPanel
            .locator('input[name="password"]');
        this.loginBtn = this.loginPanel
            .locator('input[type="submit"][value="Log In"]');
        this.registerLink = this.loginPanel
            .getByRole('link', { name: 'Register' });
        this.forgotLoginLink = this.loginPanel
            .getByRole('link', { name: 'Forgot login info?' });
    }
}
