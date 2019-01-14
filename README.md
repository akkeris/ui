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
* OAUTH_ENDPOINT (Provider url)

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

E2E testing are testcafe scripts in the test/e2e folder.
Bot User is required.  Create config.env or set env variables

* BASE_URL
* BOT_USER
* BOT_PASS

### Run

1. `npm install -g testcafe`
2. `npm run testcafe:chrome`
