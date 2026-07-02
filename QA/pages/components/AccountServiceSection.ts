import { Locator, Page } from '@playwright/test';

export class AccountServiceSection {
    readonly openNewAccountLink: Locator;
    readonly accountsOverviewLink: Locator;
    readonly transferFundsLink: Locator;
    readonly billPayLink: Locator;
    readonly requestLoanLink: Locator;

    constructor(page: Page) {

        this.accountsOverviewLink = page.getByRole('link',
            { name: 'Accounts Overview' }
        );
        this.openNewAccountLink = page.getByRole('link',
            { name: 'Open New Account' }
        );
        this.transferFundsLink = page.getByRole('link',
            { name: 'Transfer Funds' }
        );
        this.billPayLink = page.getByRole('link',
            { name: 'Bill Pay' }
        );

        this.requestLoanLink = page.getByRole('link',
            { name: 'Request Loan' }
        );

    }
}
