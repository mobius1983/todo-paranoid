# 🛡️ Todo Paranoid - Block Forbidden Comments

[![Version](https://img.shields.io/vscode-marketplace/v/todo-paranoid.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=mobius1983.todo-paranoid)
[![Downloads](https://img.shields.io/vscode-marketplace/d/todo-paranoid.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=mobius1983.todo-paranoid)
[![Rating](https://img.shields.io/vscode-marketplace/r/todo-paranoid.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=mobius1983.todo-paranoid)

> **Never commit embarrassing comments again!** Todo Paranoid prevents you from accidentally committing sensitive comments like `//PARANOID: use fake password` while still allowing you to test your code locally.

## 🎯 What Does It Do?

Todo Paranoid tracks two types of comments in your code:

### 🚫 **BLOCKING Comments** (Prevent Commits)

- `//PARANOID: temporary test code`
- `//NOCOMMIT: remove this line`
- **You can save and test** these files locally ✅
- **Cannot commit** them to Git ❌

### 📝 **TRACKING Comments** (Organizational Only)

- `//TODO: optimize this function`
- `//FIXME: handle edge case`
- `//BUG: fix validation logic`
- **Completely allowed** in commits ✅
- **Shows in sidebar** for organization 📋

## 🚀 Quick Start

1. **Install** the extension from VS Code Marketplace
2. **Open any project** - Todo Paranoid activates automatically
3. **Look for the shield icon** 🛡️ in your sidebar
4. **Write a test comment**: `//PARANOID: testing this extension`
5. **Try to commit** - it will be blocked! 🚫

## 📸 Screenshots

![Todo Paranoid Panel](https://cuponperu.s3.us-east-2.amazonaws.com/public/assets/comment_sidebar.png)
_The sidebar panel shows all your comments organized by type_

![Blocking Comment](https://cuponperu.s3.us-east-2.amazonaws.com/public/assets/no_commit.png)
_Blocking comments are highlighted in red and prevent commits_

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,`) and search for "Todo Paranoid":

### 🚫 Blocking Words (Prevent Commits)

```json
{
  "todoParanoid.blockingWords": ["PARANOID", "NOCOMMIT", "URGENT", "CRITICAL"]
}
```

### 📝 Tracking Words (Organization Only)

```json
{
  "todoParanoid.trackingWords": [
    "TODO",
    "FIXME",
    "BUG",
    "HACK",
    "NOTE",
    "REVIEW",
    "OPTIMIZE",
    "REFACTOR"
  ]
}
```

### 🔧 Other Settings

```json
{
  "todoParanoid.enabled": true,
  "todoParanoid.blockGitOperations": true,
  "todoParanoid.showNotifications": true,
  "todoParanoid.fileExtensions": [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".php",
    ".rb",
    ".go"
  ]
}
```

## 🔐 Dual Protection System

Todo Paranoid uses **two independent protection mechanisms** for maximum security:

### 🛡️ **Git API Integration** (VS Code)

- Intercepts commits directly within VS Code
- Works automatically when extension is active
- Can be toggled on/off instantly

### 🔒 **Git Hook Protection** (Terminal)

- Creates physical git hooks in `.git/hooks/pre-commit`
- Blocks commits even from external terminals
- Persists even if extension is disabled

## 🎛️ Managing Protection

### ⚡ Quick Toggle (Git API Only)

- Press `Ctrl+Shift+P` → `Todo Paranoid: Toggle Todo Paranoid ON/OFF`
- Instantly enables/disables commit blocking within VS Code
- Doesn't affect physical git hooks

### 🔧 Setup Git Hooks

- Press `Ctrl+Shift+P` → `Todo Paranoid: Setup Git Hook Protection`
- Creates physical git hook for terminal protection
- Blocks commits from any git client

### 🧹 Complete Removal

- Press `Ctrl+Shift+P` → `Todo Paranoid: Remove ALL Protections (Git API + Hooks)`
- Removes both VS Code integration AND physical git hooks
- **Use this when switching between projects with different accounts**

### 🔍 Diagnostic Tools

- Press `Ctrl+Shift+P` → `Todo Paranoid: Analyze Git Hooks`
- Shows detailed report of all git hooks in your repositories
- Helps identify protection status

## 🗑️ IMPORTANT: Uninstalling Todo Paranoid

> **⚠️ CRITICAL NOTICE**: Git hooks created by Todo Paranoid will **persist after uninstalling** the extension. This is intentional for security, but you need to clean them up manually.

### 🔴 **BEFORE Uninstalling (Recommended Method)**

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Run cleanup command**: `Todo Paranoid: Remove ALL Protections (Git API + Hooks)`
3. **Confirm removal** when prompted
4. **Now you can safely uninstall** the extension from Extensions panel

### 🟡 **AFTER Uninstalling (If You Forgot to Clean Up)**

If you already uninstalled and git commits are still being blocked:

#### **Single Repository Cleanup:**

```bash
# Check if the hook exists
ls -la .git/hooks/pre-commit

# Remove the Todo Paranoid hook
rm .git/hooks/pre-commit

# Verify it's gone
ls -la .git/hooks/pre-commit
```

#### **Multiple Repositories Cleanup:**

```bash
# Find and remove all Todo Paranoid hooks in current directory and subdirectories
find . -name ".git" -type d -exec sh -c 'if [ -f "$1/hooks/pre-commit" ]; then echo "Removing hook from: $1"; rm "$1/hooks/pre-commit"; fi' _ {} \;
```

#### **Windows Users:**

```powershell
# PowerShell command to remove hooks
Get-ChildItem -Path . -Recurse -Directory -Name ".git" | ForEach-Object {
    $hookPath = Join-Path $_ "hooks\pre-commit"
    if (Test-Path $hookPath) {
        Write-Host "Removing hook from: $_"
        Remove-Item $hookPath
    }
}
```

### 🚨 **Why Don't Hooks Auto-Remove?**

- **Security Feature**: Prevents accidental removal of commit protections
- **Team Safety**: Ensures hooks persist even if someone accidentally disables the extension
- **Cross-Platform**: Works independently of VS Code and the extension

### ✅ **Verification After Cleanup**

Test that hooks are completely removed:

```bash
# This should work without any blocking
echo "test" > test.txt
git add test.txt
git commit -m "test commit"
git reset --soft HEAD~1  # Undo the test commit
rm test.txt              # Clean up test file
```

## 🔒 How Protection Works

```bash
# ✅ This will work (saving and testing)
git add .

# ❌ This will be BLOCKED if you have blocking comments
git commit -m "my changes"

# Console output:
# 🚫 Todo Paranoid: Cannot commit! BLOCKING comments found:
# 📁 auth.js (Line 15): PARANOID
# 💡 Remove these comments before committing!
```

### 🏠 Is It Safe?

- **✅ Completely local** - only affects YOUR machine
- **✅ Not shared** - doesn't modify the shared repository
- **✅ Optional** - team members can choose to use it or not
- **✅ Removable** - can be disabled anytime with "Remove ALL Protections"

## 🎮 Commands Reference

Open Command Palette (`Ctrl+Shift+P`) and use these commands:

| Command                                                   | Description                                         |
| --------------------------------------------------------- | --------------------------------------------------- |
| `Todo Paranoid: Scan Workspace for Comments`              | Manually refresh the comments panel                 |
| `Todo Paranoid: Toggle Todo Paranoid ON/OFF`              | Enable/disable Git API integration                  |
| `Todo Paranoid: Setup Git Hook Protection`                | Install Git pre-commit hook for terminal protection |
| `Todo Paranoid: Remove ALL Protections (Git API + Hooks)` | **Complete removal** - disables everything          |

## 🚨 Multi-Account Git Workflow

**Working with different Git accounts?** Todo Paranoid's dual protection can interfere when switching between projects. Here's the workflow:

### 🔄 **When Switching Projects/Accounts:**

1. **Before switching accounts:**

   ```
   Ctrl+Shift+P → "Todo Paranoid: Remove ALL Protections"
   ```

2. **Switch to new account/project**

3. **If you want protection in new project:**
   ```
   Ctrl+Shift+P → "Todo Paranoid: Setup Git Hook Protection"
   ```

### 🧹 **Emergency Cleanup (if commits are blocked unexpectedly):**

```bash
# Remove git hooks manually
rm .git/hooks/pre-commit

# Or clean all repositories at once
find . -name ".git" -type d -exec rm -f {}/hooks/pre-commit \;
```

## 🤝 Perfect for Teams

### 👥 Team Lead

```json
// Add to .vscode/settings.json (shared)
{
  "todoParanoid.blockingWords": ["PARANOID", "NOCOMMIT", "DELETEME"],
  "todoParanoid.trackingWords": ["TODO", "FIXME", "BUG", "REVIEW"]
}
```

Each team member can:

- ✅ **See the same comment categories** (from shared settings)
- ✅ **Choose their own protection level** (personal preference)
- ✅ **Customize additional words** (personal productivity)

## 📊 Use Cases

### 🧪 **Testing & Development**

```javascript
function authenticate(user) {
  // PARANOID: using fake data for testing
  return { token: 'fake_token_123' };

  // TODO: implement real authentication
  // return realAuth(user);
}
```

- ✅ Can save and test this code
- ❌ Cannot commit the "PARANOID" line
- ✅ Can commit with the "TODO" line

### 🔒 **Security & Secrets**

```python
def connect_database():
    # NOCOMMIT: remove hardcoded password
    password = "admin123"

    # TODO: get password from environment
    # password = os.getenv('DB_PASSWORD')

    return connect(password)
```

### 🚀 **Production Deployments**

```javascript
const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.myapp.com'
    : 'http://localhost:3000'; // PARANOID: should be production URL

// FIXME: add error handling for API calls
```

## 🎨 Visual Indicators

| Type        | Highlight     | Sidebar Icon    | Action         |
| ----------- | ------------- | --------------- | -------------- |
| 🚫 Blocking | Red border    | ● Red circle    | Blocks commits |
| 📝 Tracking | Yellow border | ○ Orange circle | Allows commits |

## ⚡ Performance

- **🚀 Fast scanning** - Only scans when files change
- **💾 Low memory** - Minimal resource usage
- **⚙️ Smart updates** - Auto-refreshes when you save files
- **🎯 Targeted** - Only scans relevant file extensions

## 🔧 Troubleshooting

### Panel Not Showing Comments?

1. Check if your file extension is supported (see settings)
2. Press `Ctrl+Shift+P` → `Todo Paranoid: Scan Workspace for Comments`
3. Verify `todoParanoid.enabled` is `true` in settings

### 🔴 **Git Hook Still Blocking After Extension Removal?**

**This is the most common issue!** Git hooks are physical files that persist even after uninstalling the extension.

**⚡ Quick Fix:**

```bash
rm .git/hooks/pre-commit
```

**🧹 Complete Fix (Multiple Repositories):**

```bash
# Find and remove all Todo Paranoid hooks
find . -name ".git" -type d -exec rm -f {}/hooks/pre-commit \;
```

**🔍 Check What's Blocking You:**

```bash
# View the hook content to confirm it's from Todo Paranoid
cat .git/hooks/pre-commit

# Look for this line at the top:
# "# Todo Paranoid pre-commit hook"
```

### Comments Not Highlighted?

1. Make sure you're using the correct comment format: `//` or `#`
2. Check `todoParanoid.showNotifications` is enabled
3. Try switching to a different file and back

### Extension Seems Disabled But Still Blocking?

This means git hooks are still active. **Solution:**

1. Check if hooks exist: `ls -la .git/hooks/pre-commit`
2. Remove them: `rm .git/hooks/pre-commit`
3. Or use the extension's cleanup command (if still installed):
   ```
   Ctrl+Shift+P → "Todo Paranoid: Remove ALL Protections"
   ```

## 📝 Changelog

## [0.0.18] - 2025-05-31

### 🔧 Fixed

- **Git Hook Consistency**: Fixed inconsistent regex patterns between VS Code detection and Git pre-commit hooks
  - Git hooks now properly block comments with spaces like `// PARANOID` and `//PARANOID` consistently
  - Unified regex pattern across all blocking mechanisms (Git API, Git hooks, and visual highlighting)
  - Resolved issue where comments were visually highlighted but not blocked during commit operations

### 🎨 Improved

- **Enhanced Visual Highlighting**: Updated comment highlighting with improved colors and styling
  - Blocking comments now use red theme (`#f85149`) with subtle background and border
  - Tracking comments use amber theme (`#fbbc04`/`#bf8700`) for better visual distinction
  - Added bold font weight for blocking comments and medium weight for tracking comments
  - Improved border radius and opacity for better readability

### 🚀 Enhanced

- **Stricter Pattern Matching**: All blocking mechanisms now use consistent strict regex patterns
  - Comments must start with `//` or `#` followed by optional whitespace, then the blocking word
  - Prevents false positives like `// This code is PARANOID` from being blocked
  - Maintains protection for legitimate blocking comments like `// PARANOID: test data`

---

## [0.0.15] - 2025-05-29

- ✨ Initial release
- 🛡️ Blocking and tracking comment detection
- 🎨 Visual highlighting in editor
- 📋 Sidebar panel with organized view
- 🔐 Optional Git hook protection
- ⚙️ Fully configurable word lists

---

## ❤️ Support Todo Paranoid

If Todo Paranoid has saved you from embarrassing commits, consider supporting its development:

[![PayPal.Me](https://img.shields.io/badge/PayPal.Me-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/rludena1983)

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=4D98LB8PR6UPA)

Your support helps keep this project alive and improving! 🚀

## 🐛 Issues & Feature Requests

Found a bug or have a feature request?

[![GitHub Issues](https://img.shields.io/github/issues/mobius1983/todo-paranoid?style=for-the-badge)](https://github.com/mobius1983/todo-paranoid/issues)

## 📄 License

MIT © [Mobius1983](https://github.com/mobius1983)

---

**Made with ❤️ for developers who care about clean commits**
