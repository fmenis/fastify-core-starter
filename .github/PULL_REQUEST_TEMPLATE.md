## What changed

<!-- Describe your architectural decisions, don't list modified files (the diff shows those).
     Example: "Added a pre-upload validation middleware -->

## Requirements before merge

<!-- List anything that must happen before this PR can be merged.
     If none, write "None".
     Examples:
     - PR #42 must be merged first (adds the `user` table this PR depends on)
     - Update the mobile app to handle the new response shape (v2.3.0+)
     - Enable feature flag `ENABLE_NEW_AUTH` on the VPS after deploy
     - Coordinate with the frontend team — they need to update the API client -->

None

## Breaking changes

<!-- If none, write "None".
     If any, specify:
     - What breaks (endpoint, payload shape, behavior)
     - Who is impacted (frontend, mobile app, third-party services, cron jobs)
     - Migration path (what consumers of this API need to do) -->

None

## Checklist

- [ ] Tested locally / in dev
- [ ] No hardcoded secrets or credentials
- [ ] Added/updated tests (unit / integration)
- [ ] DB migrations are reversible (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Postman request added

## Additional notes

<!-- Anything the reviewer should know:
     - Tech debt introduced intentionally
     - Approaches you considered but discarded (and why)
     - Dependencies on other PRs or deploys
     - Feature flags to enable -->

None
