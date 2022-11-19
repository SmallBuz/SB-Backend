import { Request } from 'express';
import { UserEntity } from '../../master_user/entities';


export interface RequestWithUserInterface extends Request {
  user: UserEntity;
}
