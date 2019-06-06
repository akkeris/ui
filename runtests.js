const createTestCafe = require('testcafe');
const s3 = require('@auth0/s3');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('Running tests!');

  // Give react some time to spin up
  if (process.env.NODE_ENV === 'dev') {
    console.log('Sleeping for 20 seconds...');
    await sleep(20000);
  }

  const tests = process.env.TESTCAFE_TESTS ? process.env.TESTCAFE_TESTS : 'test/e2e/*';

  const browsers = process.env.SELENIUM_BROWSERS ?
    process.env.SELENIUM_BROWSERS.split(',') :
    'selenium:chrome';

  try {
    const testcafe = await createTestCafe();

    const testResult = await testcafe
      .createRunner()
      .src(tests)
      .browsers(browsers)
      .reporter('spec')
      .screenshots('screenshots', true, '${DATE}_${TIME}/${FIXTURE}/${TEST}/${BROWSER}/${FILE_INDEX}.png') // eslint-disable-line
      .concurrency(process.env.CONCURRENCY ? process.env.CONCURRENCY : 1)
      .run();

    if (testResult === 0) {
      console.log('All tests passed!');
      testcafe.close();
      process.exit(testResult);
    } else {
      console.log(`${testResult} TESTS FAILED`);
      // upload failed screenshots
      if (process.env.TAAS_ARTIFACT_BUCKET) {
        console.log('Uploading error screenshots...');
        const client = s3.createClient({
          s3Options: {
            accessKeyId: process.env.TAAS_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.TAAS_AWS_SECRET_ACCESS_KEY,
            region: process.env.TAAS_ARTIFACT_REGION,
          },
        });

        const params = {
          localDir: 'screenshots',
          s3Params: {
            Bucket: process.env.TAAS_ARTIFACT_BUCKET,
            Prefix: process.env.TAAS_RUNID,
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
