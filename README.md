# Require PR Test Plan

Fails the pull request check unless the PR body includes a markdown heading named **Test plan**. Empty bodies fail. The heading alone is enough — no text is required under it.

This is a JavaScript GitHub Action. It reads the PR body from the workflow event payload. It does not check out the repository, read files, or call the GitHub API.

## Use it in 30 seconds

Add `.github/workflows/require-test-plan.yml`:

```yaml
name: Require test plan
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
permissions:
  pull-requests: read
  checks: write
jobs:
  test-plan:
    runs-on: ubuntu-latest
    steps:
      - uses: YourFam/require-pr-test-plan@v1
```

Then make the workflow a required status check if you want it to block merge.

Pin `@v1` for the moving major tag, or a full tag such as `@v1.0.0`. Until you have published a release of *this* repo, the listing repository dogfoods with `uses: ./` after `actions/checkout`.

## Heading rule

The Action looks at ATX headings only (`#` … `######`).

| Body | Result |
| --- | --- |
| *(empty / null)* | fail |
| `## Test plan` | pass |
| `### test plan` | pass |
| `## TEST PLAN` | pass |
| `## Test plan ##` (optional closing `#`s) | pass |
| `  ## Test plan` (leading/trailing whitespace on the line) | pass |
| `## Test plan` with nothing under it | pass |
| `## Testplan` | fail |
| `## Test-plan` | fail |
| `## Testing plan` | fail |

- Heading text is compared **case-insensitively** after trim. `Test plan`, `test plan`, and `TEST PLAN` all pass.
- Surrounding whitespace on the heading line is OK. Optional closing `#`s are OK.
- A space (or tab) is required after the `#`s. `##Test plan` does not match.
- Setext headings (`Test plan` underlined with `===`) do not match.
- A `## Test plan` line inside a fenced code block does not match.

Editing the PR description from missing → present re-runs the check on `edited`. No new commit is required.

## Permissions

| Permission | Why |
| --- | --- |
| `pull-requests: read` | Documented for callers. The Action reads `github.event.pull_request.body` from the event payload and does not call the API. |
| `checks: write` | So GitHub can record the job as a check on the pull request (red X / green check). |

No `contents: read` is required for the Action itself. Callers should not check out the head repo just to run this check.

## What this Action does not do

It does not lint commit titles, labels, issue numbers, or conventional commits. It does not require any text under the heading.

## Development

```bash
npm test
```

Requires Node 20+.

## License

[MIT](LICENSE)
