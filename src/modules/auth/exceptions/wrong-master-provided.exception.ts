import { BadRequestException } from '@nestjs/common';

export class WrongMasterProvidedException extends BadRequestException {
  constructor(error?: string) {
    super('Trouble with Master Account', error);
  }
}
