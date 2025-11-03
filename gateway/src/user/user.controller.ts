import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService, private readonly jwtService: JwtService){}

    @UseGuards()
    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async get(@Param("id",ParseIntPipe) id: number): Promise<
      ResponseMessageWithData<{
        user: User
      }>
    > {
      const user = await this.userService.getRecipientById(id)
      return user;

    }
}
