export const unwrap = <T>(input: T | Error): T => {
  if (input instanceof Error) {
    throw input;
  }
  return input;
};
