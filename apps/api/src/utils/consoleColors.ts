const color = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

export const green = (text: string) => `${color.green}${text}${color.reset}`;
export const red = (text: string) => `${color.red}${text}${color.reset}`;
export const white = (text: string) => `${color.white}${text}${color.reset}`;
