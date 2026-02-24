import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity({ name: 'addresses' })
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 9, nullable: true }) // Formato com traço: 00000-000
  zipCode: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  complement: string;

  @Column({ nullable: true })
  neighborhood: string;

  @Column()
  city: string;

  @Column({ length: 2 })
  state: string;

  // --- Relacionamentos ---

  @OneToOne(() => Organization, (organization) => organization.address)
  organization: Organization;
}
