export interface IUser {
  _id: string;               // ID của người dùng       // Tên đăng nhập của người dùng
  email: string;            // Email của người dùng
  avatar: string,
  name:string,
  role: {
    _id: string,
    name: string
  },
  permissions?: {
    _id: string,
    name: string,
    apiPath: string,
    module: string
  }[]

}
