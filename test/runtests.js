const createTestCafe = require('testcafe');
const s3 = require('@auth0/s3');

/* eslint-disable no-console */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getS3Creds() {
  const creds = {};

  if (process.env.TAAS_AWS_ACCESS_KEY_ID) {
    creds.aws_access_key_id = process.env.TAAS_AWS_ACCESS_KEY_ID;
  } else if (process.env.S3_ACCESS_KEY) {
    creds.aws_access_key_id = process.env.S3_ACCESS_KEY;
  } else {
    return false;
  }

  if (process.env.TAAS_AWS_SECRET_ACCESS_KEY) {
    creds.aws_secret_access_key = process.env.TAAS_AWS_SECRET_ACCESS_KEY;
  } else if (process.env.S3_SECRET_KEY) {
    creds.aws_secret_access_key = process.env.S3_SECRET_KEY;
  } else {
    return false;
  }

  if (process.env.TAAS_ARTIFACT_REGION) {
    creds.aws_region = process.env.TAAS_ARTIFACT_REGION;
  } else if (process.env.S3_REGION) {
    creds.aws_region = process.env.S3_REGION;
  } else {
    return false;
  }

  if (process.env.TAAS_ARTIFACT_BUCKET) {
    creds.aws_s3_bucket = process.env.TAAS_ARTIFACT_BUCKET;
  } else if (process.env.S3_BUCKET) {
    creds.aws_s3_bucket = process.env.S3_BUCKET;
  } else {
    return false;
  }

  if (process.env.TAAS_RUNID) {
    creds.aws_s3_prefix = process.env.TAAS_RUNID;
  } else if (process.env.S3_PREFIX) {
    creds.aws_s3_prefix = process.env.S3_PREFIX;
  } else {
    creds.aws_s3_prefix = Date.now();
  }

  return creds;
}

async function uploadScreenshots(testcafe, testResult) {
  const creds = getS3Creds();
  if (!creds) {
    console.log('Error uploading screenshots - ensure all required environment variables are present.');
    testcafe.close();
    process.exit(testResult);
  }

  const client = s3.createClient({ s3Options: {
    accessKeyId: creds.aws_access_key_id,
    secretAccessKey: creds.aws_secret_access_key,
    region: creds.aws_region,
  } });

  const params = {
    localDir: 'screenshots',
    s3Params: {
      Bucket: creds.aws_s3_bucket,
      Prefix: creds.aws_s3_prefix,
    },
  };

  const uploader = client.uploadDir(params);

  uploader.on('error', (err) => {
    console.error('Unable to upload screenshots:', err.stack);
    testcafe.close();
    process.exit(testResult);
  });

  uploader.on('end', () => {
    console.log('Done uploading screenshots!');
    testcafe.close();
    process.exit(testResult);
  });
}

async function runTests() {
  console.log('Running tests!\n');

  const mode = process.env.TESTCAFE_MODE ? process.env.TESTCAFE_MODE : 'local';

  // Give react some time to spin up
  if (process.env.NODE_ENV === 'dev') {
    console.log('Sleeping for 20 seconds...');
    await sleep(20000);
  }

  let browsers;

  if (process.env.TESTCAFE_BROWSERS) {
    browsers = process.env.TESTCAFE_BROWSERS.split(',');
  } else if (mode === 'selenium') {
    browsers = 'selenium:chrome';
  } else if (mode === 'docker') {
    browsers = 'chromium';
  } else {
    browsers = 'chrome';
  }

  try {
    const testcafe = await createTestCafe();

    const tests = process.env.TESTCAFE_TESTS ? process.env.TESTCAFE_TESTS.split(',') : 'e2e/*';

    const testResult = await testcafe
      .createRunner()
      .src(tests)
      .browsers(browsers)
      .reporter('spec')
      .screenshots('screenshots', true, '${DATE}_${TIME}/${FIXTURE}/${TEST}/${BROWSER}/${FILE_INDEX}.png') // eslint-disable-line
      .concurrency(process.env.TESTCAFE_CONCURRENCY ? Number(process.env.TESTCAFE_CONCURRENCY) : 1)
      .run();

    if (testResult === 0) {
      console.log('\nAll tests passed!');
      testcafe.close();
      process.exit(testResult);
    } else {
      console.error(`\n${testResult} TESTS FAILED`);
      // upload failed screenshots
      if (process.env.TAAS_ARTIFACT_BUCKET || process.env.TESTCAFE_SCREENSHOTS) {
        console.log('Uploading error screenshots...');
        uploadScreenshots(testcafe, testResult);
      } else {
        testcafe.close();
        process.exit(testResult);
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }
}

module.exports = {
  runTests,
};

/* eslint-enable no-console */
