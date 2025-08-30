import { JwtService } from '@nestjs/jwt';

export default class APIFeatures {
  static async assignJwtToken(
    userId: string,
    jwtService: JwtService,
  ): Promise<string> {
    return jwtService.sign({ id: userId });
  }
}
