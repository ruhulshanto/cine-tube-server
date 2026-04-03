export interface IRequestUser {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare module "express" {
  interface Request {
    user?: IRequestUser;
    file?: any;       // Added for Multer support
    files?: any;      // Added for Multer support
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUser;
      file?: any;
      files?: any;
    }
  }
}
