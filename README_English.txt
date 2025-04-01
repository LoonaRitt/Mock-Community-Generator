Mock Communities Generator - Command Line Tool

Online access: https://mock-community-generator.onrender.com/



Overview:

This tool was developed during a student internship in Life Sciences - Population, Genomics, and Evolution track - at Aix-Marseille University, under the supervision of [Name], Associate Professor and co-responsible for the program.


What is this tool for?

The Mock Communities Generator allows you to generate mock communities for applications in metabarcoding. It uses the BOLD and GBIF APIs to retrieve DNA sequences of the searched taxa.

Key Features:
- Intuitive web interface (local and online).
- Search and selection of taxon sequences from the BOLD and GBIF databases.
- Download of sequences in FASTA format.

---


1️⃣ Local Installation

Prerequisites:
- Python 3 must be installed.
- pip (Python package manager).

Installation on Windows:
1. Open PowerShell or CMD.
2. Double-click on setup_windows.bat.
3. The script will install dependencies and automatically start the server.

Installation on macOS/Linux:
1. Open a terminal.
2. Navigate to the project folder:
   cd path/to/your/project
3. Option 1: Use setup_unix.sh
   chmod +x setup_unix.sh  # (to be executed once)
   ./setup_unix.sh
   If the script doesn't work, try:
   bash setup_unix.sh

4. Option 2: Use Makefile (if make is installed)
   make install  # Install dependencies
   make run      # Start the server
   make setup    # Install + start

---


2️⃣ Starting the Server

Once installed, open your browser and go to http://127.0.0.1:5000 to use the web interface.

---


3️⃣ Project Contents

- server.py: Python server.
- requirements.txt: List of Python dependencies.
- setup_windows.bat: Installation script for Windows.
- setup_unix.sh: Installation script for Linux.
- Makefile: Task automation for Linux/macOS.

---


🙌 Contribution

Contributions are welcome! If you have ideas for improvement, feel free to open an issue or a pull request.

Thank you for using Mock Communities Generator!
