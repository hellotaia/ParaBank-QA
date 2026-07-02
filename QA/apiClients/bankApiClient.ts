import { APIRequestContext, expect } from '@playwright/test';
import { SignUpUser } from '../constants/users';
import { apiEndpoints } from '../constants/endpoints';

export class BankApi {
    constructor(private readonly request: APIRequestContext) { }

    async resetDB() {
        const cleanUpDBResponse = await this.request.post(apiEndpoints.cleanup);
        expect(cleanUpDBResponse.status()).toBe(204);

        const initDBResponse = await this.request.post(apiEndpoints.initializeDB);
        expect(initDBResponse.ok()).toBeTruthy();
    }

    async createUser(user: SignUpUser) {

        const openRegisterPageResponse = await this.request.get(apiEndpoints.register);
        const openRegisterPageBody = await openRegisterPageResponse.text();
        expect(openRegisterPageResponse.ok()).toBeTruthy();
        expect(openRegisterPageBody).toContain('customerForm');

        const registerResponse = await this.request.post(apiEndpoints.register, {
            form: {
                'customer.firstName': user.firstName,
                'customer.lastName': user.lastName,
                'customer.address.street': user.address,
                'customer.address.city': user.city,
                'customer.address.state': user.state,
                'customer.address.zipCode': user.zipCode,
                'customer.phoneNumber': user.phoneNumber,
                'customer.ssn': user.ssn,
                'customer.username': user.username,
                'customer.password': user.password,
                repeatedPassword: user.confirmPassword ?? user.password,
            },
        });
        expect(registerResponse.ok()).toBeTruthy();
    }

    async getAccountById(accountId: string) {
        const getAccountByIdResponse = await this.request
            .get(`services/bank/accounts/${accountId}`, {
                headers: {
                    Accept: 'application/json',
                },
            });
        expect(getAccountByIdResponse.status()).toBe(200);
        return getAccountByIdResponse.json();
    }

    async getUserInfo(customerId: number) {
        const getUserInfoResponse = await this.request
            .get(`services/bank/customers/${customerId}`, {
                headers: {
                    Accept: 'application/json',
                },
            });
        expect(getUserInfoResponse.ok()).toBeTruthy();
        return getUserInfoResponse.json();
    }

    async updateUserInfo(customerId: number, user: SignUpUser) {
        const updateCustomerResponse = await this.request
            .post(`services/bank/customers/update/${customerId}`, {
                headers: {
                    Accept: 'application/json',
                },
                params: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    street: user.address,
                    city: user.city,
                    state: user.state,
                    zipCode: user.zipCode,
                    phoneNumber: user.phoneNumber,
                    ssn: user.ssn,
                    username: user.username,
                    password: user.password,
                },
            });
        expect(updateCustomerResponse.ok()).toBeTruthy();
    }

    async getCustomerAccounts(customerId: number) {
        const endpoint = `services/bank/customers/${customerId}/accounts`;
        const getAccountResponse = await this.request.get(endpoint, {
            headers: {
                Accept: 'application/json',
            },
        });
        const body = await getAccountResponse.text();
        expect(getAccountResponse.status()).toBe(200);
        return JSON.parse(body);
    }

    ///--------------------------------BILL PAY API 
    async createAccount(customerId: number, fromAccountId: string, accountType: 'CHECKING' | 'SAVINGS') {
        const accountTypeValue = accountType === 'CHECKING' ? 0 : 1;

        const createAccountResponse = await this.request.post('services/bank/createAccount', {
            params: {
                customerId,
                newAccountType: accountTypeValue,
                fromAccountId,
            },
            headers: {
                Accept: 'application/json',
            },
        });

        expect(createAccountResponse.status()).toBe(200);
        return createAccountResponse.json();
    }

    async transferFunds(fromAccountId: string, toAccountId: string, amount: number) {
        const transferResponse = await this.request
            .post('services/bank/transfer', {
                params: {
                    fromAccountId,
                    toAccountId,
                    amount,
                },
            });

        const body = await transferResponse.text();
        expect(transferResponse.status()).toBe(200);
        return body;
    }

    async billPay(fromAccountId: string, payeeAccountId: string, amount: number) {
        const billPayResponse = await this.request
            .post('services/bank/billpay', {
                params: {
                    accountId: fromAccountId,
                    amount,
                },
                data: {
                    name: 'Test Payee',
                    address: {
                        street: 'Payee Street 1',
                        city: 'Payee City',
                        state: 'TS',
                        zipCode: '12345',
                    },
                    phoneNumber: '1234567890',
                    accountNumber: payeeAccountId,
                },
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

        expect(billPayResponse.status()).toBe(200);
        return billPayResponse.json();
    }
    //-----------------------------------------------

}
