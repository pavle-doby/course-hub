import { authErrorMessages } from "./authErrorMessages";
import { userErrorMessages } from "./userErrorMessages";
import { sharedErrorMessages } from "./sharedErrorMessages";
import { invitationErrorMessages } from "./invitationErrorMessages";

export const allErrorMessages = {
  ...sharedErrorMessages,
  ...authErrorMessages,
  ...userErrorMessages,
  ...invitationErrorMessages,
};
