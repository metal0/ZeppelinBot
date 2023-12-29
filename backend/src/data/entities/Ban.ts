import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("bans")
export class Ban {
  @PrimaryGeneratedColumn() id: number;

  @Column() guild_id: string;

  @Column() user_id: string;
}
