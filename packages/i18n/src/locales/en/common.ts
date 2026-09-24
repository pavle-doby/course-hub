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
    video: {
      NOT_FOUND: { title: "Video Not Found", message: "The requested video could not be found." },
      NOT_READY: { title: "Video Processing", message: "This video is not ready to play yet." },
      UPLOAD_FAILED: {
        title: "Video Upload Unavailable",
        message: "A video is already uploading or the upload could not be initialized.",
      },
    },
    document: {
      NOT_FOUND: {
        title: "Document Not Found",
        message: "The requested document could not be found.",
      },
      INVALID_PARENT: {
        title: "Content Not Found",
        message: "The selected course item no longer exists.",
      },
      UNSUPPORTED_TYPE: {
        title: "Unsupported File",
        message: "Only JPEG, PNG, WebP, and PDF files are allowed.",
      },
      FILE_TOO_LARGE: { title: "File Too Large", message: "This file exceeds the allowed size." },
      LIMIT_EXCEEDED: {
        title: "Attachment Limit Reached",
        message: "This course item already has the maximum number of documents.",
      },
      UPLOAD_NOT_READY: {
        title: "Upload Not Ready",
        message: "The file has not finished uploading. Please try again.",
      },
      UPLOAD_FAILED: {
        title: "Upload Failed",
        message: "The uploaded file could not be verified.",
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
    course: {
      NOT_FOUND: {
        title: "Course Not Found",
        message: "The requested course could not be found.",
      },
    },
    enrollment: {
      ALREADY_ENROLLED: {
        title: "Already Enrolled",
        message: "You are already enrolled in this course.",
      },
      COURSE_NOT_FOUND: {
        title: "Course Not Found",
        message: "The course you are trying to enroll in could not be found.",
      },
      COURSE_PRIVATE: {
        title: "Course Is Private",
        message: "This course is private. You need an invitation to enroll.",
      },
      NOT_ENROLLED: {
        title: "Not Enrolled",
        message: "You are not enrolled in this course.",
      },
    },
    lesson: {
      NOT_FOUND: {
        title: "Lesson Not Found",
        message: "The requested lesson could not be found.",
      },
    },
    topic: {
      NOT_FOUND: {
        title: "Topic Not Found",
        message: "The requested topic could not be found.",
      },
    },
    notification: {
      SUBSCRIPTION_NOT_FOUND: {
        title: "Subscription Not Found",
        message: "The notification subscription could not be found.",
      },
    },
    ai: {
      INVALID_TOKEN: {
        title: "Invalid Access Token",
        message: "The access token is invalid or has been revoked.",
      },
    },
    apiToken: {
      NOT_FOUND: {
        title: "Token Not Found",
        message: "The access token could not be found.",
      },
    },
    review: {
      NOT_FOUND: {
        title: "Review Not Found",
        message: "The review could not be found.",
      },
    },
    oauth: {
      INVALID_CLIENT: {
        title: "Invalid Connection Request",
        message: "The app asking for access is not registered correctly. Try connecting again.",
      },
    },
    progress: {
      LESSON_NOT_FOUND: {
        title: "Lesson Not Found",
        message: "The lesson you are tracking progress for could not be found.",
      },
    },
  },
  notifications: {
    title: "Enable notifications?",
    cancel: "Not now",
    enable: "Enable",
    creatorPrompt: "Enable notifications when learners enroll in or complete this course?",
    learnerPrompt: "Enable notifications when this course or its creator has new content?",
    osReminderTitle: "You're all set!",
    osReminderDescription:
      "Make sure notifications are enabled on {{currentOS}} for {{currentBrowserName}}, so they show up, when you get them.",
    osReminderConfirm: "Got it",
    push: {
      courseEnrolled: {
        title: "New course enrollment",
        body: "{{email}} enrolled in {{courseName}}.",
      },
      courseCompleted: {
        title: "Course completed! 🎉",
        body: "{{email}} completed {{courseName}} ✅",
      },
      privateCourseAttempt: {
        title: "Private course enrollment attempt",
        body: "{{email}} tried to enroll in {{courseName}}.",
      },
      courseUpdated: {
        title: "Course updated",
        body: "{{courseName}} has been updated.",
      },
      creatorNewCourse: {
        title: "New course",
        body: "{{courseName}} is now available.",
      },
    },
  },
};
