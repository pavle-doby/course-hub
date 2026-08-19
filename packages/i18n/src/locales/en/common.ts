export const common = {
  helloWorld: "Hello, World!",
  hello: "Hello, {{name}}!",
  languageSwitcher: {
    sr: "SR",
    en: "EN",
  },
  errors: {
    shared: {
      FORBIDDEN: {
        title: "Access Denied",
        message: "You do not have permission to perform this action.",
      },
      UNAUTHORIZED: {
        title: "Unauthorized",
        message: "You must be signed in to perform this action.",
      },
      NOT_FOUND: { title: "Not Found", message: "The requested resource could not be found." },
      SERVER_ERROR: {
        title: "Server Error",
        message: "An unexpected error occurred. Please try again later.",
      },
      NOT_FOUND_ENDPOINT: { title: "Not Found", message: "The requested endpoint does not exist." },
      NO_TOKEN: { title: "Session Required", message: "Please sign in to continue." },
      INVALID_TOKEN: {
        title: "Invalid Session",
        message: "Your session is invalid or has expired. Please sign in again.",
      },
      AUTH_CHECK_FAILED: {
        title: "Authentication Failed",
        message: "We could not verify your identity. Please sign in again.",
      },
      VALIDATION_ERROR: {
        title: "Validation Error",
        message: "Some fields are invalid. Please check your input and try again.",
      },
      INVALID_PAGINATION_PARAMS: {
        title: "Invalid Request",
        message: "The pagination parameters provided are invalid.",
      },
    },
    auth: {
      INVALID_CREDENTIALS: {
        title: "Invalid Credentials",
        message: "The email or password you entered is incorrect.",
      },
      UNAUTHORIZED: {
        title: "Unauthorized",
        message: "You are not authorized to perform this action.",
      },
      USER_EXISTS: {
        title: "Account Already Exists",
        message: "An account with this email address already exists.",
      },
      NO_REFRESH_TOKEN: {
        title: "Session Expired",
        message: "Your session has expired. Please sign in again.",
      },
      INVALID_REFRESH_TOKEN: {
        title: "Invalid Session",
        message: "Your session is invalid. Please sign in again.",
      },
      USER_NOT_FOUND: {
        title: "User Not Found",
        message: "No account was found with the provided information.",
      },
      BAD_REQUEST: {
        title: "Bad Request",
        message: "The request could not be processed. Please try again.",
      },
      RATE_LIMIT_EXCEEDED: {
        title: "Too Many Attempts",
        message: "You have made too many attempts. Please try again later.",
      },
    },
    user: {
      NOT_FOUND: { title: "User Not Found", message: "The requested user could not be found." },
      ALREADY_EXISTS: {
        title: "User Already Exists",
        message: "An account with this information already exists.",
      },
    },
  },
};
