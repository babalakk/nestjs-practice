import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('auth')
export class SocialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  email: string;

  @Column()
  nickname: string;

  @Column()
  picture: string;

  @Column()
  social_provider: string;

  @Column()
  social_id: string;

  @ManyToOne(() => UserEntity, (user) => user.auths)
  user: UserEntity;
}
