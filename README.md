# envsync

`envsync` is a CLI tool designed to help you synchronize your environment variables between your local development environment and remote services (currently supporting GitLab).

It scans your local environment files (like `.env`) and compares them with variables configured in your remote project, helping you keep them in sync.

## Features

- **Local Scanning**: Detects environment variables in your local files.
- **Remote Integration**: Synchronize with GitLab CI/CD variables.
- **Interactive Prompts**: Easily resolve differences and configure new variables.
- **Settings Management**: Persists your preferences in `.envsync.json`.
- **Token Management**: Securely handles remote access tokens.

## Usage

To start the synchronization process:

```bash
deno task dev
```

If no configuration exists, `envsync` will guide you through setting up a remote connection (e.g., to GitLab).

## License

MIT
