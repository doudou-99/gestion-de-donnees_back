import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from '@prisma/client';
import { ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';

@Controller('api/v1/groups')
@UseGuards(AccessTokenGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(':idGroup')
  @ApiParam({ name: 'idGroup', type: 'number', description: 'Id of group' })
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      group: Group;
    }>,
    description: 'Group is displayed successfully',
  })
  async getById(@Param('idGroup', ParseIntPipe) idGroup: number): Promise<
    ResponseMessageWithData<{
      group: Group;
    }>
  > {
    const group = await this.groupService.getById(idGroup);
    console.log('🚀 ~ group.controller.ts:23 ~ GroupController ~ getById ~ group:', group);

    return {
      data: { group },
      message: 'Group is displayed successfully',
    };
  }
}
