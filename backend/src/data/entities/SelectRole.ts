import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("select_roles")
export class SelectRole {
  @Column()
  @PrimaryColumn()
  guild_id: string;

  @Column()
  @PrimaryColumn()
  channel_id: string;

  @Column()
  @PrimaryColumn()
  message_id: string;

  @Column()
  @PrimaryColumn()
  menu_id: string;

  @Column() menu_group: string;

  @Column() menu_name: string;
}
