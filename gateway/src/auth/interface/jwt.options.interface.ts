import { Algorithm, Secret } from "jsonwebtoken";

export interface JwtOptionsInterface {
    expiresIn?: string | number;
    algorithm?: Algorithm;
    algorithms?: Algorithm[];
    secret?: string | Buffer;
    privateKey?: Secret;
    publicKey?: string | Buffer;
}