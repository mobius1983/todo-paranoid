# 🛡️ Todo Paranoid - Block Forbidden Comments

[![Version](https://img.shields.io/vscode-marketplace/v/tu-nombre.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.todo-paranoid)
[![Downloads](https://img.shields.io/vscode-marketplace/d/tu-nombre.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.todo-paranoid)
[![Rating](https://img.shields.io/vscode-marketplace/r/tu-nombre.todo-paranoid.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.todo-paranoid)

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

![Todo Paranoid Panel](https://raw.githubusercontent.com/mobius1983/todo-paranoid/main/images/panel-screenshot.png)
_The sidebar panel shows all your comments organized by type_

![Blocking Comment](https://raw.githubusercontent.com/mobius1983/todo-paranoid/main/images/blocking-comment.png)
_Blocking comments are highlighted in red and prevent commits_

![Tracking Comments](https://raw.githubusercontent.com/mobius1983/todo-paranoid/main/images/tracking-comments.png)
_Tracking comments are highlighted in yellow for organization_

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
| `Todo Paranoid: Analyze Git Hooks`                        | **New!** Diagnostic tool to analyze git hook status |

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

### Git Hook Still Blocking After Extension Removal?

**This is the most common issue!** Git hooks are physical files that persist even after uninstalling the extension.

**Quick Fix:**

```bash
rm .git/hooks/pre-commit
```

**Complete Fix:**

1. Press `Ctrl+Shift+P` → `Todo Paranoid: Remove ALL Protections`
2. Or manually: `find . -name ".git" -type d -exec rm -f {}/hooks/pre-commit \;`

### Comments Not Highlighted?

1. Make sure you're using the correct comment format: `//` or `#`
2. Check `todoParanoid.showNotifications` is enabled
3. Try switching to a different file and back

### Extension Seems Disabled But Still Blocking?

This means git hooks are still active:

1. Press `Ctrl+Shift+P` → `Todo Paranoid: Analyze Git Hooks`
2. Use `Todo Paranoid: Remove ALL Protections` to clean everything

## 📝 Changelog

### v1.0.5

- 🆕 **Advanced protection management** - New "Remove ALL Protections" command
- 🔍 **Diagnostic tools** - "Analyze Git Hooks" command for troubleshooting
- 🧹 **Better cleanup** - Handles git hooks that persist after extension removal
- 🔄 **Multi-account support** - Easier workflow for developers with multiple git accounts
- 📋 **Improved documentation** - Clear instructions for dual protection system

### v1.0.4

- 🛠️ **Dual protection system** - Git API integration + physical git hooks
- ⚡ **Performance improvements** - Faster scanning and real-time updates
- 🎨 **Enhanced visual indicators** - Better highlighting for different comment types

### v1.0.0

- ✨ Initial release
- 🛡️ Blocking and tracking comment detection
- 🎨 Visual highlighting in editor
- 📋 Sidebar panel with organized view
- 🔐 Optional Git hook protection
- ⚙️ Fully configurable word lists

## ❤️ Support Todo Paranoid

If Todo Paranoid has saved you from embarrassing commits, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://ko-fi.com/renzoludena)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/rludena1983)

## 🐛 Issues & Feature Requests

Found a bug or have a feature request?

[![GitHub Issues](https://img.shields.io/github/issues/mobius1983/todo-paranoid?style=for-the-badge)](https://github.com/mobius1983/todo-paranoid/issues)

## 📄 License

MIT © [Mobius1983](https://github.com/mobius1983)

---

**Made with ❤️ for developers who care about clean commits**
