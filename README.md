# Akkeris UI

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
---

Testing is available as a series of Testcafe scripts in the `test/e2e` directory, and can be run locally, via Docker, or with Selenium Grid. For these tests, the UI must be running somewhere and be accessible to the test driver.

### Testing Locally

If you have Chrome (and/or Firefox) installed on your local machine, you can run tests locally.

#### Environment

| Environment Variable | Default               | Required | Description                                                    | Notes                                                                                                                                        |
|----------------------|-----------------------|----------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | http://localhost:3000 | No       | The URL of a running Akkeris UI instance that you want to test | You'll usually use the default URL when testing locally.                                                                                     |
| BOT_USER             |                       | Yes      | Username of the testing bot user                               |                                                                                                                                              |
| BOT_PASS             |                       | Yes      | Password of the testing bot user                               |                                                                                                                                              |
| RUN_TESTCAFE         | false                 | Yes      | Run tests instead of starting the UI                           | Must be set to `true` otherwise the UI will start                                                                                            |
| TESTCAFE_MODE        | local                 | No       | Mode to run in                                                 |                                                                                                                                              |
| TESTCAFE_BROWSERS    | chrome                | No       | Comma separated list of browsers to use                        | Multiple values means run simultaneously on both                                                                                             |
| TESTCAFE_TESTS       | e2e/*                 | No       | Comma separated list of test files                             | Use `e2e/` as the root folder                                                                                                                |
| TESTCAFE_CONCURRENCY | 1                     | No       | Number of browser instances to use                             | [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html)) |

#### Run

Given that the applicable environment variables have been saved to `config.env`...

1. `source config.env`
2. `npm start`

Alternatively, to access Testcafe directly:

1. `npm install -g testcafe`
2. `npm run testcafe` OR `testcafe chrome:headless test/e2e/*`

### Testing with Docker

A Dockerfile has been provided in the `test` directory for running Testcafe tests in Docker. This image is built upon the [Testcafe docker image](https://hub.docker.com/r/testcafe/testcafe/) and contains both Chromium and Firefox.

#### Environment

| Environment Variable | Default  | Required | Description                                | Notes                                                                                                                                        |
|----------------------|----------|----------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | -        | Yes      | URL of running Akkeris UI instance to test |                                                                                                                                              |
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
3. `docker run --env-file config.env -n akkeris-ui-tests --rm akkeris-ui-tests`

Note - the docker image does not use the `RUN_TESTCAFE` environment variable because it does not contain the full UI.

### Testing with Selenium

The Dockerfile in the `test` directory contains both Chromium and Firefox along with XVFB, Fluxbox, and all the bits and pieces needed to virtualize browsers and test code in Docker. However, this image is rather large, and requires building a separate image alongside the UI image.

This is where Selenium comes in. If you have access to Selenium Grid (open source and [simple to setup](https://github.com/SeleniumHQ/docker-selenium)), you can build the standard UI image and also use that same image for testing - using Selenium Grid as a remote browser - without the need for building a separate test image. This is especially useful for testing with [Akkeris TaaS](https://github.com/akkeris/taas). 

#### Environment

| Environment Variable | Default         | Required | Description                                | Notes                                                                                                                                        |
|----------------------|-----------------|----------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| BASE_URL             | -               | Yes      | URL of running Akkeris UI instance to test |                                                                                                                                              |
| BOT_USER             | -               | Yes      | Username of bot user                       |                                                                                                                                              |
| BOT_PASS             | -               | Yes      | Password of bot user                       |                                                                                                                                              |
| RUN_TESTCAFE         | -               | Yes      | Run tests instead of UI                    | Must be set to `true`                                                                                                                        |
| SELENIUM_SERVER      | -               | Yes      | URL of Selenium Grid Hub                   | e.g. https://localhost:4444/wd/hub                                                                                                           |
| TESTCAFE_MODE        | -               | Yes      | Mode to run in                             | `selenium` for running in Selenium Grid                                                                                                      |
| TESTCAFE_BROWSERS    | selenium:chrome | No       | Comma separated list of browsers to use    | Multiple values means run simultaneously on both browsers. Prefix with `selenium:`                                                           |
| TESTCAFE_TESTS       | e2e/*           | No       | Comma separated list of test files         | Use `e2e/` as the root folder                                                                                                                |
| TESTCAFE_CONCURRENCY | 1               | No       | Number of browser instances to use         | [Testcafe documentation](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html)) |

#### Run

With Docker:

Given that the applicable environment variables have been saved to `config.env`...

1. `docker build -t akkeris-ui .`
2. `docker run --env-file config.env -n akkeris-ui --rm akkeris-ui`

Locally:

1. `source config.env`
2. `npm start`

### Taking Screenshots

If you want Testcafe to take screenshots when a test fails and upload them to S3, set the following environment variables:

| Environment Variable | Alternate Name             | Description                                                                          |
|----------------------|----------------------------|--------------------------------------------------------------------------------------|
| TESTCAFE_SCREENSHOTS |                            | Take screenshots of errors and upload them to AWS S3 (S3 vars required)              |
| S3_ACCESS_KEY        | TAAS_AWS_ACCESS_KEY_ID     | Access key for AWS S3                                                                |
| S3_SECRET_KEY        | TAAS_AWS_SECRET_ACCESS_KEY | Secret key for AWS S3                                                                |
| S3_REGION            | TAAS_ARTIFACT_REGION       | Region for AWS S3                                                                    |
| S3_BUCKET            | TAAS_ARTIFACT_BUCKET       | Bucket for AWS S3                                                                    |
| S3_PREFIX            | TAAS_RUNID                 | (Optional) Folder prefix (path) for the screenshot folder (defaults to `Date.now()`) |