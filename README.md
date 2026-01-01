# envsync

Sync environment variables between your local `.env` files and GitLab CI/CD.

## Quick Start

Run directly with Deno:

```bash
deno run -RWNE jsr:@jonashaven/envsync
```

On first run, you'll be guided through connecting to your GitLab project.

## Installation

Install globally to use `envsync` as a command:

```bash
deno install -RWNE -n envsync jsr:@jonashaven/envsync
```

Then run it anytime:

```bash
envsync
```

## What It Does

- Scans your local `.env` files for environment variables
- Compares them with GitLab CI/CD variables in your project
- Interactively syncs missing variables in either direction
- Remembers your preferences in `.envsync.json`

## Requirements

- [Deno](https://deno.land/) v2.x or later
- A GitLab project with API access (you'll need a personal access token)

## License

MIT
