export const generateRandomUniqueId = () => {
  return Math.floor(Math.random() * Date.now()).toString(16);
};
