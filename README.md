# Akkeris UI

- [Akkeris UI](#akkeris-ui)
  - [Setup](#setup)
  - [Environment](#environment)
    - [Authentication](#authentication)
    - [Session](#session)
    - [Akkeris Specific](#akkeris-specific)
  - [Testing](#testing)
    - [Automated Test Runner](#automated-test-runner)
      - [Environment](#environment-1)
      - [Run](#run)
    - [Selenium](#selenium)
      - [Environment](#environment-2)
      - [Run](#run-1)
    - [Docker Image](#docker-image)
      - [Environment](#environment-3)
      - [Run](#run-2)
    - [Manually via Testcafe](#manually-via-testcafe)
    - [Taking Screenshots](#taking-screenshots)

## Setup

---

To run locally,

1. Add application authorization to your oauth
2. Add application with redirect of `http://localhost:3000/oauth/callback`
3. Save id and secret as environment variables
4. start redis in brew
    ```bash
    brew install redis
    brew services start redis
    ```
5. run
    ```bash
    npm install
    npm start
    ````

## Environment

---

### Authentication

Connect an oauth provider with the following env info.

* CLIENT_ID
* CLIENT_SECRET
* OAUTH_ENDPOINT (In the format schema://host no path is necessary, e.g., no /authorize etc.)

We also connect to github for use of repo webhooks.  Register this app with your account or organization like explained [here](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/).

* GIT_CLIENT_ID
* GIT_CLIENT_SECRET

### Session

We use a redis cache for session storage.  Create an encryption secret and add it to the env.

* REDIS_URL (defaults to localhost, can be Akkeris)
* SESSION_SECRET

### Akkeris Specific

* CLIENT_URI (defaults to localhost)
* AKKERIS_API (backend api server)

## Testing

Testing is provided via a series of Testcafe scripts in the `test/e2e` directory. A few different methods have been provided to run these tests:

- [Automated Test Runner](#automated-test-runner) (recommended)
- [Docker Image](#docker-image)
- [Selenium](#selenium)
- [Manually via Testcafe](#manually-via-testcafe)

If you're not sure which option to choose, start with the _Automated Test Runner_ option.

Please note that for these tests the UI must be running somewhere (e.g. on your local machine) and be accessible to the test driver.

### Automated Test Runner

If you have Chrome (or Firefox) installed on your local machine, you can set some environment variables and have npm automatically run Testcafe tests with the same `npm start` command used for starting the UI.

You can also use this option to automatically "clean up" remaining Akkeris resources if tests fail by providing the `AKKERIS_API` and `OAUTH_ENDPOINT` options.

_This is the preferred (and easiest) option for testing on development machines_

#### Environment

| Environment Variable | Default               | Required | Description                                                    | Notes                                                                                                                                        |
|----------------------|-----------------------|----------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | http://localhost:3000 | No       | The URL of a running Akkeris UI instance that you want to test | You'll usually use the default URL when testing locally.                                                                                     |
| BOT_USER             | -                     | Yes      | Username of the testing bot user                               | For authentication to the UI                                                                                                                 |
| BOT_PASS             | -                     | Yes      | Password of the testing bot user                               | For authentication to the UI                                                                                                                 |
| OAUTH_ENDPOINT       | -                     | No       | The URL of the OAuth provider                                  | Provide this to perform post-test cleanup verification.                                                                                      |
| AKKERIS_API          | -                     | No       | The URL of the Akkeris API                                     | Provide this to perform post-test cleanup verification.                                                                                      |
| RUN_TESTCAFE         | false                 | Yes      | Run tests instead of starting the UI                           | Must be set to `true` otherwise the UI will start                                                                                            |
| TESTCAFE_BROWSERS    | chrome                | No       | Comma separated list of browsers to use                        | Multiple values means run simultaneously on both (e.g. `chrome,firefox`)                                                                     |
| TESTCAFE_TESTS       | e2e/*                 | No       | Comma separated list of test files                             | Use `e2e/` as the root folder - e.g. `e2e/*` or `e2e/apps.test.js`                                                                           |
| TESTCAFE_CONCURRENCY | 1                     | No       | Number of browser instances to use                             | [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html)) |

For screenshot options, see the [Taking Screenshots](#taking-screenshots) section below.

#### Run

Given that the applicable environment variables have been saved to `config.env`...

1. `source config.env`
2. `npm start`

The presence of the "RUN_TESTCAFE" environment variable will instruct the UI to run the Testcafe tests rather than starting normally.

### Selenium

If you have access to Selenium Grid (open source and [simple to setup](https://github.com/SeleniumHQ/docker-selenium)), you can run Testcafe tests using Selenium as a remote browser. This is especially useful for testing with [Akkeris TaaS](https://github.com/akkeris/taas). 

This method utilizes the [Automated Test Runner](#automated-test-runner).

#### Environment

| Environment Variable | Default         | Required | Description                                | Notes                                                                                                                                        |
|----------------------|-----------------|----------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | -               | Yes      | URL of running Akkeris UI instance to test |                                                                                                                                              |
| OAUTH_ENDPOINT       | -               | No       | The URL of the OAuth provider              | Provide this to perform post-test cleanup verification.                                                                                      |
| AKKERIS_API          | -               | No       | The URL of the Akkeris API                 | Provide this to perform post-test cleanup verification.                                                                                      |
| BOT_USER             | -               | Yes      | Username of bot user                       |                                                                                                                                              |
| BOT_PASS             | -               | Yes      | Password of bot user                       |                                                                                                                                              |
| RUN_TESTCAFE         | -               | Yes      | Run tests instead of UI                    | Must be set to `true`                                                                                                                        |
| SELENIUM_SERVER      | -               | Yes      | URL of Selenium Grid Hub                   | e.g. https://localhost:4444/wd/hub                                                                                                           |
| TESTCAFE_MODE        | -               | Yes      | Mode to run in                             | `selenium` for running in Selenium Grid                                                                                                      |
| TESTCAFE_BROWSERS    | selenium:chrome | No       | Comma separated list of browsers to use    | Multiple values means run simultaneously on both browsers. Prefix with `selenium:`                                                           |
| TESTCAFE_TESTS       | e2e/*           | No       | Comma separated list of test files         | Use `e2e/` as the root folder                                                                                                                |
| TESTCAFE_CONCURRENCY | 1               | No       | Number of browser instances to use         | [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html)) |

For screenshot options, see the [Taking Screenshots](#taking-screenshots) section below.

#### Run

With Docker:

Given that the applicable environment variables have been saved to `config.env`...

1. `docker build -t akkeris-ui .`
2. `docker run --env-file config.env -n akkeris-ui --rm akkeris-ui`

Locally:

1. `source config.env`
2. `npm start`

### Docker Image

A Dockerfile has been provided in the `test` directory for running Testcafe tests entirely in Docker. It contains both Chromium and Firefox along with XVFB, Fluxbox, and all the bits and pieces needed to virtualize browsers and test code in Docker. This image is built upon the [Testcafe docker image](https://hub.docker.com/r/testcafe/testcafe/).

This method isn't recommended as it requires building a seperate Docker image and uses quite a bit of resources, but is provided just in case. Please note that this method isn't officially supported and functionality may be unstable.

#### Environment

| Environment Variable | Default  | Required | Description                                | Notes                                                                                                                                        |
|----------------------|----------|----------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | -        | Yes      | URL of running Akkeris UI instance to test |                                                                                                                                              |
| OAUTH_ENDPOINT       | -        | No       | The URL of the OAuth provider              | Provide this to perform post-test cleanup verification.                                                                                      |
| AKKERIS_API          | -        | No       | The URL of the Akkeris API                 | Provide this to perform post-test cleanup verification.                                                                                      |
| BOT_USER             | -        | Yes      | Username of bot user                       |                                                                                                                                              |
| BOT_PASS             | -        | Yes      | Password of bot user                       |                                                                                                                                              |
| TESTCAFE_MODE        | -        | Yes      | Mode to run in                             | `docker` for running in Docker                                                                                                               |
| TESTCAFE_BROWSERS    | chromium | No       | Comma separated list of browsers to use    | Multiple values means run simultaneously on both browsers                                                                                    |
| TESTCAFE_TESTS       | e2e/*    | No       | Comma separated list of test files         | Use `e2e/` as the root folder                                                                                                                |
| TESTCAFE_CONCURRENCY | 1        | No       | Number of browser instances to use         | [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html)) |

#### Run

Given that the applicable environment variables have been saved to `config.env`...

1. `cd test`
2. `docker build -t akkeris-ui-tests .`
3. `docker run --env-file config.env --name akkeris-ui-tests --rm akkeris-ui-tests`

_Note - the docker image does not use the `RUN_TESTCAFE` environment variable because it does not contain the full UI._

### Manually via Testcafe

You can also access Testcafe directly, if desired. The following environment variables are required for manually running tests:

* BASE_URL
* OAUTH_ENDPOINT
* BOT_USER
* BOT_PASS

(see the above section for an explanation of these variables)

Once these variables are set, you can then access Testcafe directly:

- `npm run testcafe` - Run all Testcafe tests with the "chrome:headless" browser.

OR to run specific tests...

- `npm install` - Make sure Testcafe is installed
- `./node_modules/.bin/testcafe [BROWSER] [TEST TO RUN]`
e.g. `./node_modules/.bin/testcafe chrome test/e2e/apps.test.js`

For more information on the available Testcafe CLI options, see the [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html)).

### Taking Screenshots

Screenshot configuration via environment variables are available using the [Automated Test Runner](#automated-test-runner) or [Selenium](#selenium) testing methods.

If you want Testcafe to take screenshots when a test fails and upload them to S3, set the following environment variables:

| Environment Variable | Alternate Name             | Description                                                                          |
|----------------------|----------------------------|--------------------------------------------------------------------------------------|
| TESTCAFE_SCREENSHOTS |                            | Take screenshots of errors and upload them to AWS S3 (S3 vars required)              |
| S3_ACCESS_KEY        | TAAS_AWS_ACCESS_KEY_ID     | Access key for AWS S3                                                                |
| S3_SECRET_KEY        | TAAS_AWS_SECRET_ACCESS_KEY | Secret key for AWS S3                                                                |
| S3_REGION            | TAAS_ARTIFACT_REGION       | Region for AWS S3                                                                    |
| S3_BUCKET            | TAAS_ARTIFACT_BUCKET       | Bucket for AWS S3                                                                    |
| S3_PREFIX            | TAAS_RUNID                 | (Optional) Folder prefix (path) for the screenshot folder (defaults to `Date.now()`) |
