import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_archives' })
export class userArchiveEntity {
  @PrimaryGeneratedColumn()
  uuid: string;

  @Column()
  emailMaster: string;

  @Column()
  device_uuid: string;

  @Column()
  data_type: string;

  @Column({ type: 'jsonb' })
  content: object[];

  @Column({ type: 'timestamptz' })
  date: Date;

  constructor(
    emailMaster: string,
    device_uuid: string,
    data_type: string,
    content: object[],
    date: Date,
  ) {
    this.emailMaster = emailMaster;
    this.device_uuid = device_uuid;
    this.data_type = data_type;
    this.content = content;
    this.date = date;
  }
}
