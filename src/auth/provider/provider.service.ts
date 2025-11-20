import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProviderDto } from '../dto/provider.dto';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}

  async upsertProvider(data: ProviderDto) {
    return await this.prisma.provider.upsert({
      update: {
        accessToken: data.accessToken
      },
      where: {
        providerId_provider: {providerId: data.providerId, provider: data.provider}
      },
      create: data
    });
  }

  async findProvider(providerId: string, provider: string) {
    return await this.prisma.provider.findUnique({
      select: {
        provider: true,
        providerId: true,
      },
      where: {
        providerId_provider: {providerId, provider}
      },
    });
  }
}
