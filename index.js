'use strict';

const fs = require('node:fs');
const { hasTestPlanHeading } = require('./has-test-plan-heading');

const FAIL_MESSAGE =
  'Pull request body must include a markdown heading named "Test plan" (any ATX level, case-insensitive). An empty body fails. The heading alone is enough; no text is required under it.';

function readEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    throw new Error('GITHUB_EVENT_PATH is not set. This Action only runs on GitHub Actions.');
  }
  return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
}

function main() {
  const event = readEvent();
  if (!event.pull_request) {
    console.error(
      '::error::This Action only supports the pull_request event. Add `on: pull_request` to the workflow.',
    );
    process.exit(1);
  }

  if (!hasTestPlanHeading(event.pull_request.body)) {
    console.error(`::error::${FAIL_MESSAGE}`);
    process.exit(1);
  }

  console.log('Found a "Test plan" heading in the pull request body.');
}

if (require.main === module) {
  main();
}

module.exports = { main };
