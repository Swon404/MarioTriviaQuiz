# Project verification and release

- After the final application, asset, configuration or test edit, run `npm run test:all` (content/rules audit, entire browser suite and production build). Focused test runs help development but do not replace this final gate.
- Run `git diff --check` before committing. Do not describe a subset pass or an earlier revision's run as verification of the complete final change.
- If anything changes after the full suite, rerun the full suite before publishing. Documentation-only edits need a whitespace check, not another browser run.
- When the user requests a push, inspect the GitHub Actions run for the pushed commit and confirm both test and deployment results. Report any pending/failed stage explicitly; never equate a successful push with deployment success.
- When UI copy changes, update affected assertions. Test speech against the visible message rather than obsolete wording, while still asserting that the expected mascot/content is present. Do not weaken behavioural checks simply to make CI pass.
- Review incoming fixes before integrating them; verify every reported failure, even if a PR addresses only one.
