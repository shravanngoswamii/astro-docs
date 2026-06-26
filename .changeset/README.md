# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets) —
it drives versioning, changelogs, and npm publishing.

When you make a change worth releasing, run:

```sh
pnpm changeset
```

Pick the bump (patch / minor / major) and write a short, user-facing summary.
That creates a markdown file here. On merge to `main`, the Release workflow opens
a "Version Packages" PR; merging that PR publishes to npm and tags the release.
