# Contributing to Sixtyfour Open Source Projects

Thank you for your interest in contributing! We welcome contributions from the community — bug reports, feature requests, documentation improvements, and code changes are all appreciated.

Please read this guide before opening a pull request.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms. Please report unacceptable behavior to [support@sixtyfour.ai](mailto:support@sixtyfour.ai).

## Getting Started

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
3. **Create a branch** from `main` using a descriptive name:
   ```bash
   git checkout -b feat/short-description   # new feature
   git checkout -b fix/short-description    # bug fix
   git checkout -b docs/short-description   # documentation
   ```
4. Make your changes, then **commit** with a clear message:
   ```bash
   git commit -m "fix: correct API key validation logic"
   ```
5. **Push** your branch and open a **Pull Request** against `main` on the upstream repo.

## Pull Request Guidelines

- Keep PRs focused — one logical change per PR.
- Fill out the pull request template completely.
- All PRs require **at least one approving review** before merging.
- Ensure your branch is up to date with `main` before requesting review.
- Head branches are deleted automatically after merge — no manual cleanup needed.
- Link any related issues in the PR description using `Closes #<issue-number>`.

## Reporting Bugs

Open a [GitHub Issue](../../issues) and include:

- A clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (OS, runtime version, etc.)

## Suggesting Features

Open a [GitHub Issue](../../issues) with the label `enhancement` and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Development Tips

- Copy `.env.example` to `.env` and fill in your credentials — never commit real secrets.
- You will need a Sixtyfour API key to run most projects locally. See [Getting an API Key](https://docs.sixtyfour.ai/get-api-key).
- Refer to the [Sixtyfour documentation](https://docs.sixtyfour.ai/introduction) for platform details.

## Questions?

If you have a question that isn't a bug or feature request, feel free to open a discussion or reach out at [support@sixtyfour.ai](mailto:support@sixtyfour.ai).
