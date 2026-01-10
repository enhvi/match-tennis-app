# Repository Setup Guide

## Initializing Git Repository

If Git is installed, run these commands to set up the repository:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Version 0.1.0"

# Create version tag
git tag -a v0.1.0 -m "Version 0.1.0 - Initial release"

# Optional: Add remote repository (GitHub, GitLab, etc.)
git remote add origin <your-repository-url>
git push -u origin main
git push origin v0.1.0
```

## Version Information

- **Current Version**: 0.1.0
- **Package Name**: find-a-match
- **App Name**: Find A Match

## Files Included

- Source code in `/screens`, `/context`, `/components`
- Configuration files (`app.json`, `package.json`)
- Backend server in `/server` (optional)
- Documentation files

## Excluded Files

See `.gitignore` for files that are not tracked:
- `node_modules/`
- `.expo/`
- Build outputs
- Environment files
- Logs and temporary files
