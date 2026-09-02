'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const indexPath = path.join(__dirname, '..', 'index.js');
let tmpDir;

function run(event, extraEnv = {}) {
  const eventPath = path.join(tmpDir, 'event.json');
  fs.writeFileSync(eventPath, JSON.stringify(event));
  return spawnSync(process.execPath, [indexPath], {
    env: { ...process.env, GITHUB_EVENT_PATH: eventPath, ...extraEnv },
    encoding: 'utf8',
  });
}

describe('index.js', () => {
  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'require-pr-test-plan-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fails when GITHUB_EVENT_PATH is missing', () => {
    const result = spawnSync(process.execPath, [indexPath], {
      env: { ...process.env, GITHUB_EVENT_PATH: '' },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
  });

  it('fails when the event is not a pull_request', () => {
    const result = run({ ref: 'refs/heads/main' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /pull_request event/);
  });

  it('fails on an empty PR body', () => {
    const result = run({ pull_request: { body: null } });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Test plan/);
  });

  it('passes when the body has a Test plan heading', () => {
    const result = run({ pull_request: { body: '## Test plan\n\n- [ ] checked locally' } });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Found a "Test plan" heading/);
  });
});
