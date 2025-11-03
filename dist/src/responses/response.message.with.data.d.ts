import { ResponseMessage } from "./response.message";
export interface ResponseMessageWithData<T extends Record<string, any>> extends ResponseMessage {
    data: T;
}
