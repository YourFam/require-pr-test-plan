'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { hasTestPlanHeading } = require('../has-test-plan-heading');

describe('hasTestPlanHeading', () => {
  it('fails on null, undefined, and empty bodies', () => {
    assert.equal(hasTestPlanHeading(null), false);
    assert.equal(hasTestPlanHeading(undefined), false);
    assert.equal(hasTestPlanHeading(''), false);
  });

  it('passes ATX headings named Test plan at any level', () => {
    assert.equal(hasTestPlanHeading('# Test plan'), true);
    assert.equal(hasTestPlanHeading('## Test plan'), true);
    assert.equal(hasTestPlanHeading('### Test plan'), true);
    assert.equal(hasTestPlanHeading('###### Test plan'), true);
  });

  it('compares heading text case-insensitively after trim', () => {
    assert.equal(hasTestPlanHeading('## test plan'), true);
    assert.equal(hasTestPlanHeading('## TEST PLAN'), true);
    assert.equal(hasTestPlanHeading('## Test Plan'), true);
    assert.equal(hasTestPlanHeading('  ##   Test plan  '), true);
  });

  it('allows optional closing hashes and surrounding whitespace', () => {
    assert.equal(hasTestPlanHeading('## Test plan ##'), true);
    assert.equal(hasTestPlanHeading('## Test plan ###'), true);
    assert.equal(hasTestPlanHeading('\t## Test plan\t'), true);
  });

  it('passes when the heading is present with no body text under it', () => {
    assert.equal(hasTestPlanHeading('Intro\n\n## Test plan\n'), true);
  });

  it('fails lookalikes that are not the exact heading text', () => {
    assert.equal(hasTestPlanHeading('## Testplan'), false);
    assert.equal(hasTestPlanHeading('## Test-plan'), false);
    assert.equal(hasTestPlanHeading('## Testing plan'), false);
    assert.equal(hasTestPlanHeading('## Test  plan'), false);
    assert.equal(hasTestPlanHeading('Test plan'), false);
    assert.equal(hasTestPlanHeading('**Test plan**'), false);
  });

  it('rejects seven hashes and a missing space after the hashes', () => {
    assert.equal(hasTestPlanHeading('####### Test plan'), false);
    assert.equal(hasTestPlanHeading('##Test plan'), false);
  });

  it('ignores a Test plan line inside a fenced code block', () => {
    assert.equal(hasTestPlanHeading('```\n## Test plan\n```'), false);
    assert.equal(hasTestPlanHeading('~~~\n## Test plan\n~~~'), false);
    assert.equal(hasTestPlanHeading('```\n## Test plan\n```\n## Test plan'), true);
  });

  it('does not treat setext headings as a match', () => {
    assert.equal(hasTestPlanHeading('Test plan\n========='), false);
  });

  it('handles CRLF line endings', () => {
    assert.equal(hasTestPlanHeading('Hello\r\n## Test plan\r\n'), true);
  });
});
