export default (condition: boolean, error: Error) => {
  if (condition) {
    throw error;
  }
};
