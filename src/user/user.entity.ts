import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { AuthEntity } from 'src/social/auth.entity';
import * as argon2 from 'argon2';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column()
  created_at: Date;

  @Column({ default: 0 })
  login_count: number;

  @Column({
    nullable: true,
  })
  last_session: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  activate_code: string;

  @OneToMany(() => AuthEntity, (auth) => auth.user, {
    cascade: true,
  })
  auths: AuthEntity[];

  @BeforeInsert()
  async first_create() {
    this.created_at = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hash_password() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    }
  }
}


