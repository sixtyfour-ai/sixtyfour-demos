# How To Use This Template

> Remove after setting up a new repo from this template

[Watch demo on Loom](https://www.loom.com/share/372d7dd58d254b63b751fde366ab774c)

# [Project Name]

> One-line description of what this project does and who it's for.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

<!-- Replace this with a 2–3 sentence description of the project. What problem does it solve? What does a user get out of it? -->

## Getting Started

### Prerequisites

<!-- List what a user needs before they can run this project. Examples: -->

- Node.js 18+ or Python 3.10+
- A Sixtyfour API key ([get one here](https://docs.sixtyfour.ai/get-api-key))

### Installation

```bash
# Clone the repository
git clone https://github.com/sixtyfour-ai/<repo-name>.git
cd <repo-name>

# Install dependencies (Node.js example)
npm install

# Copy the environment variable template
cp .env.example .env
```

Then open `.env` and add your Sixtyfour API key:

```
SIXTYFOUR_API_KEY=your_api_key_here
```

### Running the project

```bash
# Node.js example
npm run dev

# Python example
python main.py
```

## Getting an API Key

To use this project you will need a Sixtyfour API key.

1. Sign up or log in at [sixtyfour.ai](https://sixtyfour.ai)
2. Follow the instructions at [docs.sixtyfour.ai/get-api-key](https://docs.sixtyfour.ai/get-api-key)

## Documentation

Full documentation for the Sixtyfour platform is available at [docs.sixtyfour.ai](https://docs.sixtyfour.ai/introduction).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

<details>
<summary><strong>Repo Setup Checklist (for Sixtyfour team — remove this section before publishing)</strong></summary>

When creating a new repo from this template, complete the following steps in **Settings**:

**General**
- [ ] Set the repository description and topic tags
- [ ] Uncheck **Wikis**
- [ ] Uncheck **Projects**
- [ ] Check **Automatically delete head branches**

**Branch protection — `main`**
- [ ] Go to **Branches → Add classic branch protection rule** for `main`
- [ ] Enable **Require a pull request before merging**
- [ ] Set **Required approvals** to `1`
- [ ] Enable **Require status checks to pass before merging** (if applicable)
- [ ] Enable **Do not allow bypassing the above settings**

**After setup**
- [ ] Replace all `[placeholder]` values in this README
- [ ] Update `.github/ISSUE_TEMPLATE/config.yml` — change the security `url` to point to this repo's security policy (e.g. `https://github.com/sixtyfour-ai/<repo-name>/security/policy`)
- [ ] Copy `.env.example` and create a `.env` file with any project-specific environment variables.
- [ ] Delete this checklist section from the README
- [ ] Remove how to use this template video link

</details>

