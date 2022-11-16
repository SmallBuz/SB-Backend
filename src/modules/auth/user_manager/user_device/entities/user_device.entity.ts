
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity({ name: 'user_devices' })
export class userDeviceEntity {

  @PrimaryGeneratedColumn()
  @Generated('uuid')
  uuid: string;
  
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
    userPassword: string
  ) {

    this.emailMaster = emailMaster;
    this.userName = userName;
    this.userPassword = userPassword;
  }
}
