import { Exclude } from 'class-transformer';
import { RoleType } from '../../../master_user/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user_devices' })
export class userDeviceEntity {
  @PrimaryGeneratedColumn()
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.DEVICE_ACCOUNT })
  role: RoleType;

  @Column()
  emailPOS: string;

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
    emailPOS: string,
    userName: string,
    userPassword: string,
    role?: RoleType,
  ) {
    this.role = role || RoleType.DEVICE_ACCOUNT;
    this.emailPOS = emailPOS;
    this.userName = userName;
    this.userPassword = userPassword;
  }
}
