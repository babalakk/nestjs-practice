import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsEmail } from 'class-validator';
import { UserEntity } from 'src/user/user.entity';

@Entity('auth')
export class AuthEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  @IsEmail()
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
