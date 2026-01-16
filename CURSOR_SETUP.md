# 🚀 Running in Cursor IDE

This guide shows you how to run the Ko Hnit Aung Pharmacy application directly from Cursor.

## Quick Start

### Option 1: Using Tasks (Recommended)

1. **Open Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type**: `Tasks: Run Task`
3. **Select**: `🚀 Start All Servers`

This will start both backend and frontend servers automatically!

### Option 2: Using Terminal

Open Cursor's integrated terminal (`Ctrl+`` or `View → Terminal`) and run:

```bash
npm start
```

Or manually:
```bash
# Terminal 1
npm run backend:dev

# Terminal 2  
npm run dev
```

### Option 3: Using Debug Panel

1. Click the **Run and Debug** icon in the sidebar (or press `Cmd+Shift+D`)
2. Select **🚀 Launch Full Stack (Backend + Frontend)** from the dropdown
3. Click the green play button ▶️

## 📋 Available Tasks

Access via `Cmd+Shift+P` → `Tasks: Run Task`:

- **🚀 Start All Servers** - Starts both backend and frontend
- **📦 Start Backend Server** - Backend only (port 4000)
- **🎨 Start Frontend Server** - Frontend only (port 5173)
- **🛑 Stop All Servers** - Stops all running servers
- **🔧 Build Backend** - Compiles TypeScript backend
- **🎨 Build Frontend** - Builds production frontend
- **🌱 Seed Database** - Seeds database with test data
- **✅ Check Health** - Tests backend health endpoint

## 🐛 Debugging

### Debug Backend

1. Set breakpoints in `backend/src/` files
2. Go to Run and Debug panel
3. Select **🔧 Debug Backend**
4. Click ▶️

### Debug Frontend

1. Set breakpoints in React components
2. Go to Run and Debug panel
3. Select **🎨 Debug Frontend**
4. Click ▶️

### Debug Full Stack

1. Set breakpoints in both frontend and backend
2. Select **🚀 Full Stack Debug**
3. Click ▶️

This starts both servers with debugging enabled!

## 🌐 Launch in Browser

1. Go to Run and Debug panel
2. Select **🌐 Launch in Browser**
3. Click ▶️

This will:
- Start both servers
- Open Chrome with debugging enabled
- Navigate to http://localhost:5173

## ⚙️ Keyboard Shortcuts

You can create custom shortcuts in Cursor:

1. `Cmd+K Cmd+S` (or `Ctrl+K Ctrl+S`) to open keyboard shortcuts
2. Search for "task" or "debug"
3. Assign your preferred shortcuts

## 📁 Project Structure

```
Ko copy/
├── .vscode/              # Cursor/VSCode configurations
│   ├── tasks.json        # Task definitions
│   ├── launch.json       # Debug configurations
│   ├── settings.json     # Workspace settings
│   └── extensions.json   # Recommended extensions
├── backend/              # Backend API
├── public/               # Static assets
├── src/                  # Frontend source (implicit)
└── package.json          # NPM scripts
```

## 🔧 Troubleshooting

### Servers Won't Start

1. Check if ports are in use:
   ```bash
   lsof -ti:4000,5173
   ```

2. Kill existing processes:
   - Run task: **🛑 Stop All Servers**
   - Or manually: `lsof -ti:4000,5173 | xargs kill`

### Debugging Not Working

1. Make sure you have the **Debugger for Chrome** extension installed
2. Check that breakpoints are set in the correct files
3. Verify the debug configuration is selected

### Tasks Not Showing

1. Reload Cursor: `Cmd+Shift+P` → `Developer: Reload Window`
2. Check that `.vscode/tasks.json` exists
3. Verify file permissions

## 📝 Recommended Extensions

Cursor will prompt you to install recommended extensions. These include:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Prisma** - Database schema support
- **TypeScript** - TypeScript support

## 🎯 Tips

1. **Use Multiple Terminals**: Cursor supports multiple terminal tabs
   - Right-click terminal tab → Split Terminal
   - Or `Cmd+\` to split

2. **Quick Access**: 
   - `Cmd+Shift+P` for Command Palette
   - `Ctrl+`` for Terminal
   - `Cmd+Shift+D` for Debug panel

3. **Auto-save**: Files auto-save on focus change (configured in settings)

4. **Hot Reload**: Both servers support hot reload - changes appear instantly!

## ✅ Verification

After starting servers, verify:

1. **Backend**: http://localhost:4000/health
2. **Frontend**: http://localhost:5173
3. **Login**: Use `admin@parami.com` / `password`

## 🚀 Happy Coding!

Your application is now ready to run directly from Cursor IDE!
