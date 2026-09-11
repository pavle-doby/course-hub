export const common = {
  helloWorld: "Hello, World!",
  hello: "Hello, {{name}}!",
  languageSwitcher: {
    sr: "SR",
    en: "EN",
  },
  errors: {
    offline: {
      title: "No Internet Connection",
      message: "You're offline. Please check your connection and try again.",
    },
    backOnline: {
      title: "Back Online",
    },
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
    invitation: {
      COURSE_NOT_FOUND: {
        title: "Course Not Found",
        message: "The course for this invitation could not be found.",
      },
      COURSE_NOT_PRIVATE: {
        title: "Invitations Unavailable",
        message: "This course is not private, so invitations cannot be used.",
      },
      INVALID_TOKEN: {
        title: "Invalid Invitation",
        message: "This invitation link is not valid.",
      },
      EXPIRED: {
        title: "Invitation Expired",
        message: "This invitation has expired.",
      },
      ALREADY_USED: {
        title: "Invitation Unavailable",
        message: "This invitation has already been used or revoked.",
      },
      NOT_FOUND: {
        title: "Invitation Not Found",
        message: "The requested invitation could not be found.",
      },
      EMAIL_MISMATCH: {
        title: "Email Mismatch",
        message:
          "This invitation was sent to a different email address. Sign in with that email to accept it.",
      },
    },
  },
};
