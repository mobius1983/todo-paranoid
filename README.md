# 🛡️ Todo Paranoid - Block Forbidden Comments

[![Version](https://img.shields.io/vscode-marketplace/v/tu-nombre.code-guardian.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.code-guardian)
[![Downloads](https://img.shields.io/vscode-marketplace/d/tu-nombre.code-guardian.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.code-guardian)
[![Rating](https://img.shields.io/vscode-marketplace/r/tu-nombre.code-guardian.svg)](https://marketplace.visualstudio.com/items?itemName=tu-nombre.code-guardian)

> **Never commit embarrassing comments again!** Code Guardian prevents you from accidentally committing sensitive comments like `//PARANOID: use fake password` while still allowing you to test your code locally.

## 🎯 What Does It Do?

Code Guardian tracks two types of comments in your code:

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
2. **Open any project** - Code Guardian activates automatically
3. **Look for the shield icon** 🛡️ in your sidebar
4. **Write a test comment**: `//PARANOID: testing this extension`
5. **Try to commit** - it will be blocked! 🚫

## 📸 Screenshots

![Code Guardian Panel](https://raw.githubusercontent.com/tu-usuario/code-guardian/main/images/panel-screenshot.png)
_The sidebar panel shows all your comments organized by type_

![Blocking Comment](https://raw.githubusercontent.com/tu-usuario/code-guardian/main/images/blocking-comment.png)
_Blocking comments are highlighted in red and prevent commits_

![Tracking Comments](https://raw.githubusercontent.com/tu-usuario/code-guardian/main/images/tracking-comments.png)
_Tracking comments are highlighted in yellow for organization_

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,`) and search for "Code Guardian":

### 🚫 Blocking Words (Prevent Commits)

```json
{
  "codeGuardian.blockingWords": ["PARANOID", "NOCOMMIT", "URGENT", "CRITICAL"]
}
```

### 📝 Tracking Words (Organization Only)

```json
{
  "codeGuardian.trackingWords": [
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
  "codeGuardian.enabled": true,
  "codeGuardian.blockGitOperations": true,
  "codeGuardian.showNotifications": true,
  "codeGuardian.fileExtensions": [
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

## 🔐 Git Hook Protection

For **maximum security**, Code Guardian can create a Git pre-commit hook that blocks commits even from the terminal.

### 🎛️ Activate Git Hook

**Method 1: Automatic Prompt**

- When you first install, you'll see a popup asking to create the Git hook
- Click "Yes" to enable terminal protection

**Method 2: Manual Activation**

- Press `Ctrl+Shift+P` (Command Palette)
- Type: `Code Guardian: Setup Git Hook`
- Click to install the hook

**Method 3: From Settings**

- Go to Code Guardian settings
- Click "Setup Git Hook" button

### 🔒 How Git Hooks Work

```bash
# ✅ This will work (saving and testing)
git add .

# ❌ This will be BLOCKED if you have blocking comments
git commit -m "my changes"

# Console output:
# 🚫 Code Guardian: Cannot commit! BLOCKING comments found:
# 📁 auth.js (Line 15): PARANOID
# 💡 Remove these comments before committing!
```

### 🏠 Is It Safe?

- **✅ Completely local** - only affects YOUR machine
- **✅ Not shared** - doesn't modify the shared repository
- **✅ Optional** - team members can choose to use it or not
- **✅ Removable** - can be disabled anytime

## 🎮 Commands

Open Command Palette (`Ctrl+Shift+P`) and use these commands:

| Command                           | Description                            |
| --------------------------------- | -------------------------------------- |
| `Code Guardian: Scan Workspace`   | Manually refresh the comments panel    |
| `Code Guardian: Toggle Extension` | Enable/disable Code Guardian           |
| `Code Guardian: Setup Git Hook`   | Install Git pre-commit hook protection |
| `Code Guardian: Remove Git Hook`  | Uninstall Git hook protection          |

## 🤝 Perfect for Teams

### 👥 Team Lead

```json
// Add to .vscode/settings.json (shared)
{
  "codeGuardian.blockingWords": ["PARANOID", "NOCOMMIT", "DELETEME"],
  "codeGuardian.trackingWords": ["TODO", "FIXME", "BUG", "REVIEW"]
}
```

Each team member can:

- ✅ **See the same comment categories** (from shared settings)
- ✅ **Choose their own Git hook level** (personal preference)
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
2. Press `Ctrl+Shift+P` → `Code Guardian: Scan Workspace`
3. Verify `codeGuardian.enabled` is `true` in settings

### Git Hook Not Working?

1. Press `Ctrl+Shift+P` → `Code Guardian: Setup Git Hook`
2. Check if `.git/hooks/pre-commit` file exists in your project
3. Verify the file has execute permissions (`chmod +x .git/hooks/pre-commit`)

### Comments Not Highlighted?

1. Make sure you're using the correct comment format: `//` or `#`
2. Check `codeGuardian.showNotifications` is enabled
3. Try switching to a different file and back

## 📝 Changelog

### v1.0.0

- ✨ Initial release
- 🛡️ Blocking and tracking comment detection
- 🎨 Visual highlighting in editor
- 📋 Sidebar panel with organized view
- 🔐 Optional Git hook protection
- ⚙️ Fully configurable word lists

## ❤️ Support Code Guardian

If Code Guardian has saved you from embarrassing commits, consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/tu-usuario?style=for-the-badge&logo=github)](https://github.com/sponsors/tu-usuario)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://ko-fi.com/renzoludena)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/tu-usuario)

## 🐛 Issues & Feature Requests

Found a bug or have a feature request?

[![GitHub Issues](https://img.shields.io/github/issues/tu-usuario/code-guardian?style=for-the-badge)](https://github.com/tu-usuario/code-guardian/issues)

## 📄 License

MIT © [Tu Nombre](https://github.com/tu-usuario)

---

**Made with ❤️ for developers who care about clean commits**
