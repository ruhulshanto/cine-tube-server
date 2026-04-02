import httpStatus from 'http-status'

interface TError {
  statusCode: number
  message: string
  errorSources: Array<{
    path: string | number
    message: string
  }>
}

export const handleCastError = (err: any): TError => {
  const statusCode = httpStatus.BAD_REQUEST
  const message = 'Invalid ID format'
  const errorSources = [{
    path: err.path || '',
    message: 'Invalid resource ID'
  }]

  return {
    statusCode,
    message,
    errorSources
  }
}
