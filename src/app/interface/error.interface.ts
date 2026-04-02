export interface TErrorSource {
  path: string | number;
  message: string;
}

export interface TErrorResponse {
  success: false;
  message: string;
  errorSources: TErrorSource[];
  statusCode: number;
}
