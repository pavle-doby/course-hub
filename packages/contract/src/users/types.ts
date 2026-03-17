import { z } from 'zod'
import { UserEntity } from '@my/db-schema'
import { PaginationReq, PaginationRes, Search } from '../shared'
import {
  UserGetAllQuerySchema,
  UserPostQuerySchema,
  UserPutQuerySchema,
  UserSchema,
} from './schemas'

export type User = z.infer<typeof UserSchema>

export type UserExtended = User & {}

export type UserStatus = UserEntity['status']
export type UserRole = UserEntity['role']

export type FilterUser = {
  status?: UserStatus
  role?: UserRole
  requiresFileUpload?: boolean
}

// GET /users → get all users
export type GetAllUsersReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof UserGetAllQuerySchema>
export type GetAllUsersRes = PaginationRes<UserExtended>

// GET /users/:id → get user by id
export type GetUserReq = Pick<User, 'id'>
export type GetUserRes = UserExtended | undefined

// POST /users → create new user
export type CreateUserReq = z.infer<typeof UserPostQuerySchema>
export type CreateUserRes = User

// PUT /users/:id → update user by id
export type UpdateUserReq = z.infer<typeof UserPutQuerySchema>
export type UpdateUserRes = User | undefined

// DELETE /users/:id → delete user by id
export type DeleteUserRes = User | undefined
