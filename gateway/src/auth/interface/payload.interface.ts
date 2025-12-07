import { Request } from "express"

export interface PayloadInterface {
    sub: number
}

export interface RequestPayload extends Request{
    user: PayloadInterface
}

export interface RequestPayloadWithRefresh extends RequestPayload{
    refresh_token: string
}