# Command-Line Tool Setup Guide

Welcome to the repository of your command-line tool! This guide explains how to install dependencies and launch the server on **Windows**, **Linux**, and **macOS**.

---

## 📁 Project Contents

- `server.py`: Python server based on Flask.
- `requirements.txt`: List of Python dependencies.
- `setup_unix.sh`: Installation and launch script for Linux/macOS.
- `setup_windows.bat`: Installation and launch script for Windows.
- `Makefile`: Task automation for Linux/macOS.

---

## ⚙️ Prerequisites
- **Python 3** must be installed on your system.
- **pip** (Python package manager).
- For Linux/macOS, ensure the terminal has execution permissions.

---

## 🚀 Installation and Launch

### 🪟 For Windows
1. **Open the terminal** (PowerShell or CMD).
2. **Navigate to the project folder**:
   ```powershell
   cd path\to\your\project
   ```
3. **Run the script**:
   ```powershell
   setup_windows.bat
   ```

The script will install dependencies and automatically start the server.

---

### 🍎🐧 For macOS/Linux

1. **Open the terminal**.
2. **Navigate to the project folder**:
   ```bash
   cd path/to/your/project
   ```

3. **Option 1: Using `setup_unix.sh`**
   - Make the script executable (only needed once):
     ```bash
     chmod +x setup_unix.sh
     ```
   - Then run the script:
     ```bash
     ./setup_unix.sh
     ```
   
   👉 *If the script doesn't run, use this instead:*
   ```bash
   bash setup_unix.sh
   ```

4. **Option 2: Using the `Makefile`** (if `make` is installed)
   - To install dependencies:
     ```bash
     make install
     ```
   - To start the server:
     ```bash
     make run
     ```
   - Or do it all at once:
     ```bash
     make setup
     ```

---

## ✅ Verification
- Once the server is running, a confirmation message will appear.
- Access the interface via your browser, usually at `http://127.0.0.1:5000`.

---

## ❓ Troubleshooting
- Check if **Python** is installed:
   ```bash
   python --version
   ```
- If `python` doesn't work, try:
   ```bash
   python3 --version
   ```
- Ensure that `pip` is installed:
   ```bash
   pip --version
   ```
- On macOS/Linux, if `setup_unix.sh` doesn't run, check permissions with:
   ```bash
   ls -l setup_unix.sh
   ```
   and fix them if needed with:
   ```bash
   chmod +x setup_unix.sh
   ```

---

## 🙌 Contribution
Contributions are welcome! Feel free to open issues or pull requests to improve this project.

---

Thank you for using this tool! 🚀

