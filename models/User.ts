import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({
    name: 'users'
})
class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', nullable: false })
    name!: string;

    @Column()
    email!: string;

    @Column({
        nullable: true
    })
    googleId?: string;

    @Column({
        nullable: true
    })
    password!: string;

    @Column({
        nullable: true
    })
    avatar?: string;

    @Column({
        default: false
    })
    isVerified!: boolean;

    @Column({
        nullable: true
    })
    verificationCode?: string;
}

export { User };
