import { test, expect } from "../../fixtures/baseTest";
import { updatedUsers, SignUpUser, userIds } from "../../constants/users";

function verifyUserData(actualUser: any, expectedUser: SignUpUser) {
  expect(actualUser.firstName).toBe(expectedUser.firstName);
  expect(actualUser.lastName).toBe(expectedUser.lastName);
  expect(actualUser.address.street).toBe(expectedUser.address);
  expect(actualUser.address.city).toBe(expectedUser.city);
  expect(actualUser.address.state).toBe(expectedUser.state);
  expect(actualUser.address.zipCode).toBe(expectedUser.zipCode);
  expect(actualUser.phoneNumber).toBe(expectedUser.phoneNumber);
  expect(actualUser.ssn).toBe(expectedUser.ssn);
}

test.describe(
  "User Data API tests",
  {
    tag: ["@api", "@user_data"],
  },
  () => {
    test.beforeEach(async ({ bankApi }) => {
      await bankApi.resetDB();
    });

    test("RGA-1 User can be created via API", async ({ bankApi, users }) => {
      const createdUser = await users.createApiUserWithOneAccount("rga-1");
      const user = await bankApi.getUserInfo(userIds.firstCreatedUserId);
      verifyUserData(user, createdUser.user);
    });

    updatedUsers.forEach((updatedUserData, index) => {
      test(`RGA-2.${index + 1} Edit Users data via API `, async ({
        bankApi,
      }) => {
        await bankApi.updateUserInfo(userIds.defaultUserId, updatedUserData);
        const user = await bankApi.getUserInfo(userIds.defaultUserId);
        verifyUserData(user, updatedUserData);
      });
    });

    test("RGA-3 User has an account after creation", async ({
      users,
      testData,
    }) => {
      const user = await users.createApiUserWithOneAccount("rga-3");
      expect(user.account.id).toBeTruthy();
      expect(user.account.balance).toBe(testData.defaultAccountBalance);
    });
  },
);
