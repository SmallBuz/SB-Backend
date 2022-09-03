import { EntityRepository, Repository } from 'typeorm';
import { userArchiveEntity } from '../entities/user_archive.entity';

@EntityRepository(userArchiveEntity)
export class userArchiveRepository extends Repository<userArchiveEntity> { }
