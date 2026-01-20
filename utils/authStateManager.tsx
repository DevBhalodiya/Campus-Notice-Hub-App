let isSigningUp = false;

export const setSigningUp = (value: boolean) => {
  isSigningUp = value;
};

export const getSigningUp = () => {
  return isSigningUp;
};
