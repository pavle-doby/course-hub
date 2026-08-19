import { authErrorMessages } from "./authErrorMessages";
import { userErrorMessages } from "./userErrorMessages";
import { sharedErrorMessages } from "./sharedErrorMessages";

export const allErrorMessages = {
  ...sharedErrorMessages,
  ...authErrorMessages,
  ...userErrorMessages,
};
