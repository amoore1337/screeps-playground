# Screeps Playground
> Checkout [the screeps website](https://screeps.com/) for more info about this awesome game.

## Configure repo to push to screeps server:
1. Rename `temp.screeps.json` to `screeps.json` and fill in your username, password, and desired branch name:
```json
{
  "email": "your_email@example.com",
  "password": "youre_super_secret_password",
  "branch": "development",
  "ptr": false
}
```
2. Run the following npm command to push your changes to screeps:
```bash
npm run commit
```

## Preview build:
1. Run the following to compile things to `dist` without pushing to screeps:
```bash
npm run compile
```

## Linting:
1. Check for linting errors and fix basic errors with:
```bash
npm run lint
```