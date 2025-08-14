<p align="center"><img src="https://github.com/lybic/.github/raw/refs/heads/main/profile/lybic_logo.png" width="200" alt="lybic logo"></p>

<a href="https://www.npmjs.com/package/@lybic/ui"><img alt="@lybic/ui NPM Version" src="https://img.shields.io/npm/v/%40lybic%2Fui?label=npm%20%40lybic%2Fui"></a> <a href="https://www.npmjs.com/package/@lybic/core"><img alt="@lybic/core NPM Version" src="https://img.shields.io/npm/v/%40lybic%2Fcore?label=npm%20%40lybic%2Fcore"></a>

# Lybic TypeScript

Lybic provides ready-to-use GUI Agent infrastructure that lets you build computer or mobile agents in minutes.

By opening source (part of) our infrastructure code, we hope that you can learn and build your own CUA powered by Lybic.

Checkout [our documentation](https://lybic.ai/docs) if you are not familiar with Lybic.

## Directory Structure

* [packages/core-sdk](./packages/core-sdk/) contains the source code of our core sdk (`@lybic/core`). You can read our [documentation](https://lybic.ai/docs/sdk/typescript/getting-started) of the SDK from our document site.
* [packages/schema](./packages/schema/) contains all of the zod schemas you need to build apps using Lybic. These are very useful if you are trying to implement some unique features that SDK won't meet your use case.
* [packages/playground](./packages/playground/) contains the source code of our playground, as a reference implementation of a simple and useful Computer Use Agent using the abilities of Lybic. You can navigate to [build a playground with lybic](https://lybic.ai/docs/sdk/typescript/playground-vercel) for a step-by-step guide.

## License

[MIT](./LICENSE)
