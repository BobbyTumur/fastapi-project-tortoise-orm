export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type Message = {
  message: string
}

export type NewPassword = {
  token: string
  new_password: string
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  username: string
  can_edit?: boolean | null
  is_totp_enabled?: boolean
  id: string
}

export type UserRegister = {
  email: string
  username: string
  is_active?: boolean
  is_superuser?: boolean
  is_totp_enabled?: boolean
  can_edit?: boolean | null
}

export type UserUpdate = {
  is_active?: boolean
  is_superuser?: boolean
  username: string
  can_edit?: boolean | null
}

export type UserServiceUpdate = {
  added_services: number[]; 
};

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type ServicePublic = {
  name: string
  sub_name: string
  id: string
}

export type ServicesPublic = {
  data: Array<ServicePublic>
  count: number
}

export type ServiceCreate = {
  name: string
  sub_name: string
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type TOTPToken = {
  token: string
}

export type QRUri = {
  uri: string
}