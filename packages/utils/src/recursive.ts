const waitFor = (delay = 0) => new Promise(resolve => setTimeout(resolve, delay));

const recursiveToZero = (func, attempt: number, delay: number, error?: Error) => {
  if (attempt === 0) {
    throw error || new Error('Fail');
  }

  return func().catch(err => waitFor(delay).then(() => recursiveToZero(func, attempt - 1, delay, err)));
};

export default <T>(func: () => Promise<T>, attempts: number = 5, delay: number = 3000): Promise<T> =>
  Promise.resolve().then(() => recursiveToZero(func, attempts, delay));
