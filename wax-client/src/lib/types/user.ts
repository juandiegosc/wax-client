export type UserInfo = {
  email: string;
  userName: string;
  roles?: string[];
  createdAt?: string | null;
};

export type Address = {
  id?: string;
  createdAt?: string;
  updatedAt?: string | null;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  identificationNumber?: string;
  identificationType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type AddressResponse = Address;

export type Login = {
  email: string;
  password: string;
};

export type Register = {
  email: string;
  password: string;
};
