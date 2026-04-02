export const MESSAGES = {
  SUCCESS: {
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    FETCHED: "Resource fetched successfully",
  },
  ERROR: {
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Forbidden access",
    BAD_REQUEST: "Bad request",
    CONFLICT: "Resource already exists",
    INTERNAL: "Something went wrong",
  },
  AUTH: {
    LOGIN_SUCCESS: "Logged in successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    REGISTER_SUCCESS: "Registered successfully",
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Token has expired",
    PASSWORD_CHANGED: "Password changed successfully",
  },
} as const;
