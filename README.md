# devops-pipeline-task-management
## Branching Strategy

- `main`: Production-ready code, protected
- `develop`: Integration branch for features
- `feature/*`: New features (branch from develop)
- `bugfix/*`: Bug fixes (branch from develop)
- `hotfix/*`: Emergency fixes (branch from main)
- `release/*`: Release preparation (branch from develop)

## Workflow
1. Create feature branch from develop
2. Develop and commit changes
3. Push branch and create Pull Request to develop
4. Pass all CI checks
5. Obtain 2 peer reviews
6. Merge to develop
7. Periodically merge develop to main through release branch
