# Workflow

## Branch Strategy
- feature/* -> PR to develop
- develop -> PR to main for stable milestones only

## Conventional Commits
- feat: new functionality
- docs: documentation only
- chore: scaffolding/maintenance

## Branch Protection (Recommended)
Set these on the `main` and `develop` branches in GitHub:

Main:
- Require pull request before merging
- Require approvals: 1+
- Require status checks to pass (when checks exist)
- Require linear history (optional)
- Restrict who can push to main

Develop:
- Require pull request before merging
- Require approvals: 1+
- Require status checks to pass (when checks exist)
- Allow administrators to bypass only if needed

## Release Flow
1. Merge feature branches into develop.
2. Stabilise develop for a milestone.
3. Open PR from develop into main.
4. Tag releases after merge.