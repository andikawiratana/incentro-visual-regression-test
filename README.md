# Playwright Test Setup
A simple guide to get your visual tests running with Playwright.

## 🛠️ Setup Instructions
Follow these steps in your terminal.

Install Packages:
```Bash
pnpm install playwright odiff-bin
```

Install Browsers:
```Bash
npx playwright install
```

Install System Libraries (for Ubuntu/Debian only):
```Bash
sudo apt-get install libnspr4 libnss3 libasound2t64
```

Install Browser Dependencies:
```Bash
npx playwright install-deps
```

## ▶️ How to Run
To run the tests, use this command:
```Bash
npx playwright test ./index.test.ts
```
