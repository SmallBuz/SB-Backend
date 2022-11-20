import { BadRequestException } from '@nestjs/common';

export class WrongPasswordProvidedException extends BadRequestException {
  constructor(error?: string) {
    super('Wrong Password provided', error);
  }
}
