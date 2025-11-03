import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {

  constructor(@Inject('NATS_SERVICE') private client: ClientProxy){}

  async getHello(): Promise<any> {
    const resultFromMS = await lastValueFrom(this.client.send("hello",{}))
    console.log(`🚀 ~ app.service.ts:12 ~ AppService ~ getHello ~     const resultFromMS = this.client.send("hello",{})
      :`,    resultFromMS)
    return resultFromMS;
  }
}
