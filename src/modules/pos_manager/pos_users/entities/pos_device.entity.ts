import { Exclude } from 'class-transformer';
import { RoleType } from '../../../../modules/master_user/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'pos_devices' })
export class POSDeviceEntity {
  @PrimaryGeneratedColumn()
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.POS_ACCOUNT })
  role: RoleType;

  @Column()
  emailMaster: string;

  @Column()
  userName: string;

  @Column()
  userPassword: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  @Exclude()
  updatedAt: Date;

  constructor(
    emailMaster: string,
    userName: string,
    userPassword: string,
    role?: RoleType,
  ) {
    this.role = role || RoleType.MASTER_ACCOUNT;
    this.emailMaster = emailMaster;
    this.userName = userName;
    this.userPassword = userPassword;
  }
}
