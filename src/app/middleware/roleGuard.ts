import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { IRequestUser } from '../interface/requestUser.interface.js'

export const roleGuard = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as IRequestUser

    if (!user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required',
        errorSources: [
          {
            path: 'user',
            message: 'No user authenticated'
          }
        ]
      })
      return
    }

    if (!roles.includes(user.role as Role)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Insufficient permissions',
        errorSources: [
          {
            path: 'role',
            message: `Required roles: ${roles.join(', ')}`
          }
        ]
      })
      return
    }

    next()
  }
}
