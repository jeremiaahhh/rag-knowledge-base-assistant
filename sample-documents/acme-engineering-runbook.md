# ACME Engineering — On-Call & Incident Runbook

## On-Call Rotation

Engineering on-call rotates weekly, starting Mondays at 10:00 UTC. Each
rotation has a primary and a secondary engineer. The primary owns the first
response; the secondary is paged automatically if the primary does not
acknowledge within 15 minutes. Rotations are visible in PagerDuty and mirrored
to the `#oncall` Slack channel.

The on-call commitment is roughly four hours of focused availability per day
on weekdays, with full coverage required on weekends and holidays. Engineers
swap shifts directly through PagerDuty if they cannot cover a window. Backup
coverage is provided by the platform team for any rotation gap longer than 30
minutes.

## Incident Severity Levels

Incidents are classified into four severities:

- **SEV-1** — customer-facing outage affecting more than 5% of users. Pages
  the primary, secondary, and engineering manager. Requires a public
  statuspage post within 15 minutes.
- **SEV-2** — significant degradation or partial outage. Pages the primary
  and engineering manager. Internal status update every 30 minutes.
- **SEV-3** — minor degradation, workarounds available. Tracked in the
  incident channel; no paging.
- **SEV-4** — internal tooling impact only. Tracked in Jira.

A SEV-1 or SEV-2 always triggers a post-incident review within five business
days, owned by the incident commander.

## Deploy Process

Production deploys run on the main branch through GitHub Actions. Each merge
to main triggers the deploy pipeline, which (1) runs the integration test
suite, (2) builds container images, (3) deploys to staging, (4) runs smoke
tests, and (5) deploys to production with a canary at 5% traffic for ten
minutes before full rollout. Deploys can be paused or rolled back via the
`/deploy` Slack command. Friday deploys after 15:00 UTC require approval
from the on-call engineering manager.
