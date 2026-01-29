import { SharesCreateDto } from './dto/shares.create.dto';
import { ShareService } from './share.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { ShareCreateResponse } from './response/share.create.response';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { ShareAccessUserResponse, ShareAccessGroupResponse } from './response/share.access.response';
import { AccessShareDto } from './dto/access.share.dto';
import { ReceiversResponse } from './response/share.receiver.response';
export declare class ShareController {
    private readonly shareService;
    constructor(shareService: ShareService);
    createShares(id: number, data: SharesCreateDto, req: RequestPayload): Promise<ResponseMessageWithData<{
        shares: ShareCreateResponse[];
    }>>;
    editAccessTypeShareUser(id: number, idUser: number, data: AccessShareDto): Promise<ResponseMessageWithData<{
        share: ShareAccessUserResponse;
    }>>;
    editAccessTypeShareGroup(id: number, idGroup: number, data: AccessShareDto): Promise<ResponseMessageWithData<{
        share: ShareAccessGroupResponse;
    }>>;
    getReceivers(req: RequestPayload): Promise<ResponseMessageWithData<{
        receivers: ReceiversResponse;
    }>>;
}
