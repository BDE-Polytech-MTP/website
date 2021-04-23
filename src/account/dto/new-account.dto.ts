import { Role } from "../roles";

export interface NewAccountDto {
  firstname: string;
  email: string;
  lastname: string;
  bde: string;
  membershipDate?: Date;
  roles?: Role[];
}
