# Require PR Test Plan

Fails the pull request check unless the PR body includes a markdown heading named **Test plan**. Empty bodies fail. The heading alone is enough — no text is required under it.

This is a JavaScript GitHub Action. It reads the PR body from the workflow event payload. It does not check out the repository, read files, or call the GitHub API.

## Use it in 30 seconds

1. Add `.github/workflows/require-test-plan.yml` on your default branch (`main`):

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
    name: Require test plan
    runs-on: ubuntu-latest
    steps:
      - uses: YourFam/require-pr-test-plan@v1
```

2. Open any pull request so the check runs once. GitHub will not list a check in Settings until it has run.

3. Make the check required so a red X actually blocks merge (repo admin):

   **Rulesets (current GitHub UI)**

   1. Repo **Settings** → **Rules** → **Rulesets**.
   2. **New ruleset** → **New branch ruleset**.
   3. Enforcement: **Active**. Target: your default branch (`main`).
   4. Enable **Require status checks to pass**.
   5. **Add checks**, search for **Require test plan**, select it.
   6. Save the ruleset.

   **Classic branch protection**

   1. Repo **Settings** → **Branches** → **Add classic branch protection rule**.
   2. Branch name pattern: `main`.
   3. Enable **Require status checks to pass before merging**.
   4. Search for **Require test plan**, select it.
   5. Save.

Until you do step 3, the Action still posts a green check or red X on the PR, but GitHub will allow merge.

Use `@v1` in the YAML above (moving major). Pin `@v1.0.1` (or a later full tag) if you want the version frozen.

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
