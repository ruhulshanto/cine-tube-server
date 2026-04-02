import httpStatus from 'http-status'

interface TError {
  statusCode: number
  message: string
  errorSources: Array<{
    path: string | number
    message: string
  }>
}

export const handlePrismaError = (err: any): TError => {
  let statusCode = httpStatus.BAD_REQUEST
  let message = 'Database Error'
  let errorSources: Array<{ path: string | number; message: string }> = []

  switch (err.code) {
    case 'P2002':
      statusCode = httpStatus.CONFLICT as any
      message = 'Duplicate entry'
      const target = err.meta?.target as string[]
      if (target && target.length > 0) {
        errorSources = [{
          path: target[0] || '',
          message: `${target[0]} already exists`
        }]
      }
      break
    case 'P2025':
      statusCode = httpStatus.NOT_FOUND as any
      message = 'Record not found'
      errorSources = [{
        path: '',
        message: 'The requested record was not found'
      }]
      break
    case 'P2003':
      statusCode = httpStatus.BAD_REQUEST
      message = 'Foreign key constraint violation'
      errorSources = [{
        path: '',
        message: 'Invalid reference to related record'
      }]
      break
    default:
      statusCode = httpStatus.INTERNAL_SERVER_ERROR as any
      message = 'Database operation failed'
      errorSources = [{
        path: '',
        message: err.message
      }]
  }

  return {
    statusCode,
    message,
    errorSources
  }
}
