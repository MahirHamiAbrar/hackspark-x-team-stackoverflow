import { userHttp } from './httpClient.js';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Register a new user. Throws AxiosError on 4xx/5xx. */
export async function register(payload: RegisterPayload) {
  const { data } = await userHttp.post('/users/register', payload);
  return data;
}

/** Login an existing user. Throws AxiosError on 4xx/5xx. */
export async function login(payload: LoginPayload) {
  const { data } = await userHttp.post('/users/login', payload);
  return data;
}

/** Get current user profile (requires JWT). Throws AxiosError on 4xx/5xx. */
export async function me(token: string) {
  const { data } = await userHttp.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/** Get loyalty discount for a user by ID. Throws AxiosError on 4xx/5xx. */
export async function discount(userId: string) {
  const { data } = await userHttp.get(`/users/${userId}/discount`);
  return data;
}
