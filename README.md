# Require PR Test Plan

Fails the pull request check unless the PR body includes a markdown heading named **Test plan**. Empty bodies fail. The heading alone is enough — no text is required under it.

This is a JavaScript GitHub Action. It reads the PR body from the workflow event payload. It does not check out the repository, read files, or call the GitHub API.

## Install

You need **two** things. The workflow YAML only **runs** the check (red X / green check). A **ruleset** is what **blocks the Merge button**. Copying the YAML alone will not stop anyone from merging.

You need permission to merge to `main` (step 1) and **admin** on the repo (step 3).

### 1. Put the workflow on `main`

Create a branch. Add this file as `.github/workflows/require-test-plan.yml` (copy as-is, including `name: Require test plan` on the job — that string is the check name GitHub will show later):

```yaml
name: Require test plan
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
permissions:
  pull-requests: read
  checks: write
jobs:
  require-test-plan:
    name: Require test plan
    runs-on: ubuntu-latest
    steps:
      - uses: YourFam/require-pr-test-plan@v1
```

Do **not** add `actions/checkout`. This Action only reads the PR description from the event payload.

Commit, push the branch, open a **normal PR into `main`**.

On that first PR, put this in the description so the new workflow (which GitHub will already run on this PR) can pass:

```markdown
## Test plan
```

Merge it. After merge, the Action is live on `main`.

Leave `@v1` in `uses:` so you get the latest 1.x. Use a full tag such as `@v1.0.4` only if you need that exact version frozen.

### 2. Run the check once so GitHub remembers its name

GitHub **will not** list a check under Settings until that check has run on **this** repository. Open a **second** PR against `main` with:

- any tiny commit (or an empty commit)
- **empty PR description** (no `## Test plan`)

Intended result: the check **Require test plan** fails with a red X. That failure is what you want. It registers the name **Require test plan** in GitHub’s check list.

The PR check should be named **Require test plan**.

You can close this dummy PR without merging. The run still counts.

### 3. Create a ruleset so a red X blocks merge

Until this step, GitHub still shows **Merging can be performed automatically** even when the check failed.

1. Repo **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
2. **Ruleset name:** `Require PR Test Plan` (any name is fine).
3. **Enforcement status:** **Active**. Not Disabled. (Evaluate only reports; it does not block.)
4. **Bypass list:** leave empty unless you know you need an escape hatch.
5. **Target branches:** this is easy to miss. Click **Add target** → **Include default branch** (or include by pattern `main`). If it still says “Branch targeting has not been configured,” the ruleset matches nothing.
6. Under **Rules**, turn on **only** these two (leave the rest unchecked):

   **Require a pull request before merging** — turn this **on**. Status checks alone do not disable the Merge button; this rule does. Then:

   - **Required approvals:** `0` unless you also want human reviews.
   - Leave off unless you want them: dismiss stale approvals, review from specific teams, Code Owners, restrict who can dismiss reviews, approval of the most recent push, conversation resolution, Copilot extra approval, allowed merge methods.

   **Require status checks to pass** — turn this **on**. Then:

   - **Add checks** → search **Require test plan** → **select it from the dropdown**. Do not type a name that is not in the list. Typed names often never match, and merge stays allowed or stays blocked forever.
   - Leave **Require branches to be up to date before merging** off unless you want that extra rule.

7. **Save** the ruleset.

**Leave these rules off** unless you already use them for other reasons. They are not part of this Action:

| Rule | Why leave it off |
| --- | --- |
| Restrict creations | Blocks creating matching branches. |
| Restrict updates | Often breaks normal PR merges. |
| Restrict deletions | Optional extra; not needed for the test-plan check. |
| Require linear history | Bans merge commits. |
| Require deployments to succeed | Needs environments you probably do not have. |
| Require signed commits | Needs commit signing set up. |
| Block force pushes | Optional extra. |
| Require code scanning / code quality / code coverage | Other products; not this Action. |
| Automatically request Copilot code review | Unrelated. |
| Restrict commit metadata / Restrict branch names | Unrelated. |

Do **not** also add a classic **Branch protection rule** for this. If GitHub says an existing `main` protection rule is fully covered by the ruleset, delete that classic rule.

**Private repositories:** rulesets are enforced on private repos only on GitHub Team / Enterprise (and Pro for some cases). On GitHub Free, use a **public** repo, or classic branch protection will not be a substitute we document here — upgrade or use a public repo.

### 4. Confirm it actually blocks

Open (or reuse) a PR whose description has no `## Test plan`. You want:

- red X on **Require test plan**
- **Merging is blocked** (not “Merging can be performed automatically”)

Edit the PR description (no new commit) to:

```markdown
## Test plan
```

The check re-runs on `edited` and should turn green. Merge should then be allowed (approvals `0`).

If the Merge button is still active on a red X: the ruleset is not targeting `main`, enforcement is not Active, **Require a pull request before merging** is off, or the required check name does not match the job `name` (you typed it instead of picking it).

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

The `permissions:` block in the YAML is for **your** workflow, not a Marketplace setting. It limits what GitHub’s job token may do.

| Permission | Why |
| --- | --- |
| `pull-requests: read` | This job may look at pull request data. The Action does not call the API; it reads the description already included in the `pull_request` event. |
| `checks: write` | So GitHub can show the job as a check on the PR (red X / green check). |

Do not add `contents: read` or `actions/checkout` just to run this Action. It does not read your repository files.

## What this Action does not do

It does not lint commit titles, labels, issue numbers, or conventional commits. It does not require any text under the heading.

## Development

```bash
npm test
```

Requires Node 20+.

## License

[MIT](LICENSE)
