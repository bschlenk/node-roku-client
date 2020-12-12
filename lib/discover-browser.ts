// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function discover(timeout: number): Promise<string> {
  return reject();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function discoverAll(timeout: number): Promise<string[]> {
  return reject();
}

function reject() {
  return Promise.reject(
    new Error(
      'Cannot discover Roku devices from a browser. ' +
        'Browsers do not support sending UDP packets.',
    ),
  );
}
