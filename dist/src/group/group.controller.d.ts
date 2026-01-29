import { GroupService } from './group.service';
import { Group } from '@prisma/client';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    getById(idGroup: number): Promise<ResponseMessageWithData<{
        group: Group;
    }>>;
}
