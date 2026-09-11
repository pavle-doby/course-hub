import { authErrorMessages } from "./authErrorMessages";
import { userErrorMessages } from "./userErrorMessages";
import { sharedErrorMessages } from "./sharedErrorMessages";
import { invitationErrorMessages } from "./invitationErrorMessages";
import { courseErrorMessages } from "./courseErrorMessages";
import { enrollmentErrorMessages } from "./enrollmentErrorMessages";
import { lessonErrorMessages } from "./lessonErrorMessages";
import { topicErrorMessages } from "./topicErrorMessages";

export const allErrorMessages = {
  ...sharedErrorMessages,
  ...authErrorMessages,
  ...userErrorMessages,
  ...invitationErrorMessages,
  ...courseErrorMessages,
  ...enrollmentErrorMessages,
  ...lessonErrorMessages,
  ...topicErrorMessages,
};
