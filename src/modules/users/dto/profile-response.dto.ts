import { Role } from '../../../common/enums/role';

export class ProfileResponseDto {
  _id!: string;
  name!: string;
  avatar?: string;
  role!: Role;
  companyName?: string;
  companyDescription?: string;
  companyLogo?: string;
  resume?: string;
}
