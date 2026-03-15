import { killPort } from '@nx/node/utils';

declare const globalThis: typeof global & { __TEARDOWN_MESSAGE__: string };

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = process.env.PORT ? Number(process.env.PORT) : 3333;
  await killPort(port);
  console.info(globalThis.__TEARDOWN_MESSAGE__);
};
