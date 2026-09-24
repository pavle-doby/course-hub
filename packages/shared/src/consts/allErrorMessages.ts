import { authErrorMessages } from "./authErrorMessages";
import { userErrorMessages } from "./userErrorMessages";
import { sharedErrorMessages } from "./sharedErrorMessages";
import { invitationErrorMessages } from "./invitationErrorMessages";
import { courseErrorMessages } from "./courseErrorMessages";
import { enrollmentErrorMessages } from "./enrollmentErrorMessages";
import { lessonErrorMessages } from "./lessonErrorMessages";
import { topicErrorMessages } from "./topicErrorMessages";
import { videoErrorMessages } from "./videoErrorMessages";
import { documentErrorMessages } from "./documentErrorMessages";
import { notificationErrorMessages } from "./notificationErrorMessages";
import { progressErrorMessages } from "./progressErrorMessages";
import { aiErrorMessages } from "./aiErrorMessages";
import { apiTokenErrorMessages } from "./apiTokenErrorMessages";
import { oauthErrorMessages } from "./oauthErrorMessages";

export const allErrorMessages = {
  ...sharedErrorMessages,
  ...authErrorMessages,
  ...userErrorMessages,
  ...invitationErrorMessages,
  ...courseErrorMessages,
  ...enrollmentErrorMessages,
  ...lessonErrorMessages,
  ...topicErrorMessages,
  ...videoErrorMessages,
  ...documentErrorMessages,
  ...notificationErrorMessages,
  ...progressErrorMessages,
  ...aiErrorMessages,
  ...apiTokenErrorMessages,
  ...oauthErrorMessages,
};
