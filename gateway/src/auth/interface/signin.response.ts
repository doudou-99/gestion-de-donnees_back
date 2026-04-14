import { loginInterface } from './logininterface';

export interface SigninResponse {
  user: loginInterface;
  access_token: string;
  refresh_token: string;
}
