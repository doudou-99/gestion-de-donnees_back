import { ResponseMessage } from "./response.message";
export declare class ResponseMessageWithData<T extends Record<string, any>> extends ResponseMessage {
    data: T;
}
