export class CreateUserDto {
  email: string;
  password: string;
  confirm_password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
export class UpdateUserNameDto {
  new_name: string;
}

export class ResetPasswordDto {
  origin_password: string;
  new_password: string;
}
