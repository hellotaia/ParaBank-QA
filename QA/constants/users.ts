export type SignUpUser = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
  confirmPassword?: string;
};

export const defaultUserData = {
  username: "john",
  password: "demo",
};

export const userIds = {
  firstCreatedUserId: 12434,
  defaultUserId: 12323,
};

export function buildSignUpUser(
  usernamePrefix: string,
  overrides: Partial<SignUpUser> = {},
): SignUpUser {
  const password = overrides.password ?? "Test12345";
  const shortTimestamp = Date.now().toString(36);
  const shortPrefix = usernamePrefix
    .replace(/_/g, "")
    .replace(/-/g, "")
    .slice(0, 6);

  return {
    firstName: "Auto",
    lastName: "User",
    address: "Test Street 1",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    phoneNumber: "1234567890",
    ssn: "123456789",
    username: `${shortPrefix}_${shortTimestamp}`,
    password,
    confirmPassword: overrides.confirmPassword ?? password,
    ...overrides,
  };
}

export const updatedUsers = Array.from({ length: 5 }, (_, index) =>
  buildSignUpUser(`rga-${index + 1}`, {
    firstName: `Updated${index + 1}`,
    lastName: `User${index + 1}`,
    address: `Updated Street ${index + 1}`,
    city: `Updated City ${index + 1}`,
    state: "US",
    zipCode: `5432${index + 1}`,
    phoneNumber: `098765432${index + 1}`,
    ssn: `98765432${index + 1}`,
    password: `Updated12345`,
  }),
);
