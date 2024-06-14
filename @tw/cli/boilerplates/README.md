# TW Boilerplates CLI util

- No need to manually copy/paste files or clone boilerplate repos
- No need to manually replace whale icon with your service name
- Dependencies will automatically be the latest version

## Basic Usage

```
tw init
```

Will give you an interactive CLI to create a new package/service/fetcher/worker/etc.

### Prompts

#### Pick a template

Use the number keys to pick which template you want to use to create your new package or service.

#### What is the name of the package/service?

Be sure to input a human name like "Google Ads". The script will turn this into a service id like google-ads automatically.
For packages, use something like "Test Utils" and the script will use @tw/test-utils where necessary.

#### Pick a nice color

You can scroll through the list of 256 xterm colors and choose the one which best fits the vibe of your new service.

#### What is the path for $SERVICE_NAME?

Double check the default path, which should be correct, then press <Enter> to accept it.
Otherwise, enter the path where you want the new code to go.

You can enter a relative path from the current working directory.
The cwd is logged just before this question in case you forgot where you were.

#### Who are the maintainers

Enter a space-separated list of the maintainer emails (you don't need to put the `@triplewhale.com` part).
For example: `billy chezki jesse`. The script will add the emails to the list of maintainers in the `tw-config` file.

#### Select Docker Dependencies

For services, these are the docker dependencies for running the service locally. Use space to select one or more and <Enter> to enter your selections.

- `emulators`: the pubsub and google cloud storage emulators
- `redis`
- `mongo`
- `postgres`
- `temporal`

#### Add tags

For services, you can add tags so that running `tw up -t my_tag` will start all services with `my_tag`.

Tags should be space-separated list: `my_tag another_tag`.

## Adding a new template

1. Add your template's info to `config.ts` (see types and existing templates for examples)
2. Add a new directory in the `/templates` folder with your files
   a. Keep in mind that certain defaults (e.g. infra folder for services, package.json for node repos) are created automatically.
   b. You can override these defaults by providing a file in your template directory: for example, `node-temporal-worker` has a custom `infra/index.ts`
3. The following variable values will be replaced in your template files (string replacement, see `replace.ts`):

   | Variable      | replaced with              | example                                                        |
   | ------------- | -------------------------- | -------------------------------------------------------------- |
   | $SERVICE_ID   | info.computerName          | "google-ads"                                                   |
   | $SERVICE_NAME | info.humanName             | "Google Ads", see `node-express-service/openapi.yaml`          |
   | $COLOR        | info.color                 | "FF00FF"                                                       |
   | $PACKAGE_NAME | '@tw/' + info.computerName | "@tw/utils"                                                    |
   | $PROVIDER_ID  | info.providerId            | "google-ads", see `node-sensory-fetcher/src/providerConfig.ts` |

### `config.ts`

When adding a new entry to the bases list in `config.ts`, you can use the following properties:

- id: string, unique identifier for this template
- dependencies: an array of dependencies
  - for node: npm package names like `['@tw/utils', 'express']`
  - for python: py package names like `['tw-utils', 'uvicorn']`
- devDependencies: (Optional), only for node
- infraDependencies: (Optional), only for services, will be added to the services's `infra/package.json`
- hasTwConfig: boolean, script will create a `tw-config.json` at the service root if true
- isJest: (Optional), boolean, will install jest-related dependencies if true
- isPackage: boolean, will install to a `packages` folder, add `npm publish` command, etc.
- isService: boolean, will install to a `services` folder, add `npm deploy` command, set up for `tw up`, etc.
- isFetcher: (Optional) boolean, if it's a sensory fetcher
- language: 'ts' or 'python'
- name: string, display name for the template
- templateDir: sud-directory in the `/templates` folder containing the files to be copied over for this template
- getNames: (Optional): function for getting the replacement values like `humanName`, `computerName`, and `providerId`, etc. If not passed, the default from `getName.ts` will be used.

## Questions?

`billy@triplewhale.com`, slack: `@Billy D`
