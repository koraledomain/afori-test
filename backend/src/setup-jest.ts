if (!process.env.TEST_LOG) {
  const noop = () => {};
  // keep warn/error; silence log/info/debug
  // eslint-disable-next-line no-console
  // @ts-ignore
  console.log = noop;
  // eslint-disable-next-line no-console
  // @ts-ignore
  console.info = noop;
  // eslint-disable-next-line no-console
  // @ts-ignore
  console.debug = noop;
  // Option A: also suppress error output for cleaner unit test logs
  // eslint-disable-next-line no-console
  // @ts-ignore
  console.error = noop;
}

// Disable NestJS Logger output during tests unless explicitly enabled
try {
  if (!process.env.TEST_LOG) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Logger } = require('@nestjs/common');
    Logger.overrideLogger(false);
  }
} catch {}


