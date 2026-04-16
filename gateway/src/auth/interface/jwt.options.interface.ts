import { Algorithm, Secret, SignOptions } from 'jsonwebtoken';

export interface JwtOptionsInterface extends SignOptions {
  algorithm?: Algorithm;
  algorithms?: Algorithm[];
  secret?: string | Buffer;
  privateKey?: Secret;
  publicKey?: string | Buffer;
}
