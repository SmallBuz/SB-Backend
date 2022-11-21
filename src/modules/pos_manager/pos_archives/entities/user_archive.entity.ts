import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pos_archives' })
export class POSArchiveEntity {
  @PrimaryGeneratedColumn()
  uuid: string;

  @Column()
  email_master: string;

  @Column()
  uuid_master: string;

  @Column()
  device_uuid: string;

  @Column()
  data_type: string;

  @Column({ type: 'jsonb' })
  content: object[];

  @Column({ type: 'timestamptz' })
  date: Date;

  constructor(
    email_master: string,
    device_uuid: string,
    data_type: string,
    content: object[],
    date: Date,
    uuid_master: string,
  ) {
    this.email_master = email_master;
    this.device_uuid = device_uuid;
    this.data_type = data_type;
    this.content = content;
    this.date = date;

    this.uuid_master = uuid_master;
  }
}
