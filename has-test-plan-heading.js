'use strict';

const ATX_HEADING = /^[ \t]*#{1,6}[ \t]+(.*)$/;
const OPENING_FENCE = /^( {0,3})(`{3,}|~{3,})(.*)$/;

function headingText(line) {
  const match = line.match(ATX_HEADING);
  if (!match) {
    return null;
  }
  let content = match[1].replace(/[ \t]+$/, '');
  content = content.replace(/[ \t]+#+$/, '');
  return content.trim();
}

function fenceOpen(line) {
  const match = line.match(OPENING_FENCE);
  if (!match) {
    return null;
  }
  return { marker: match[2][0], length: match[2].length, info: match[3] };
}

function isClosingFence(line, open) {
  const match = line.match(/^( {0,3})(`{3,}|~{3,})[ \t]*$/);
  if (!match) {
    return false;
  }
  return match[2][0] === open.marker && match[2].length >= open.length;
}

function hasTestPlanHeading(body) {
  if (typeof body !== 'string' || body.length === 0) {
    return false;
  }

  let fence = null;
  for (const line of body.split(/\r?\n/)) {
    if (fence) {
      if (isClosingFence(line, fence)) {
        fence = null;
      }
      continue;
    }

    const opened = fenceOpen(line);
    if (opened) {
      fence = opened;
      continue;
    }

    const text = headingText(line);
    if (text && text.toLowerCase() === 'test plan') {
      return true;
    }
  }

  return false;
}

module.exports = { hasTestPlanHeading };
