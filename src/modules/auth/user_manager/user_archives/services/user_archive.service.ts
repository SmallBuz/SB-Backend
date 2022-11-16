import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/common/dtos';
import { Repository } from 'typeorm';
import { userArchiveAddRequest } from '../dto/request/user_archive_add_request.dto';
import { userArchiveEntity } from '../entities/user_archive.entity';

@Injectable()
export class UserArchiveService {
  constructor(
    @InjectRepository(userArchiveEntity)
    private readonly _userArchiveRepository: Repository<userArchiveEntity>,
  ) {}

  public async getAllArchives(
    emailMaster: string,
    options: PageOptionsDto,
  ): Promise<any> {
    const [archives, itemCount] = await this._userArchiveRepository
      .createQueryBuilder('user_archives')
      .where('email_master = :email', { email: emailMaster })
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();
    return { archives, itemCount };
  }
  public async addOneArchive(
    UserAddRequest: userArchiveAddRequest,
  ): Promise<any> {
    const archive = UserAddRequest;
    const user = this._userArchiveRepository.create(archive);
    return await this._userArchiveRepository.save(user);
  }
}
