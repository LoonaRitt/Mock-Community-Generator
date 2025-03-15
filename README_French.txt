# Guide d'installation de l'outil en ligne de commande

Bienvenue dans le dépôt de votre outil en ligne de commande ! Ce guide explique comment installer les dépendances et lancer le serveur sur **Windows**, **Linux** et **macOS**.

---

## 📁 Contenu du projet

- `server.py` : Serveur Python basé sur Flask.
- `requirements.txt` : Liste des dépendances Python.
- `setup_unix.sh` : Script d'installation et de lancement pour Linux/macOS.
- `setup_windows.bat` : Script d'installation et de lancement pour Windows.
- `Makefile` : Automatisation des tâches pour Linux/macOS.

---

## ⚙️ Prérequis
- **Python 3** doit être installé sur votre système.
- **pip** (gestionnaire de paquets Python).
- Pour Linux/macOS, assurez-vous que le terminal dispose des permissions d'exécution.

---

## 🚀 Installation et Lancement

### 🪟 Pour Windows
1. **Ouvrez le terminal** (PowerShell ou CMD).
2. **Naviguez jusqu'au dossier du projet** :
   ```powershell
   cd chemin\vers\votre\projet
   ```
3. **Exécutez le script** :
   ```powershell
   setup_windows.bat
   ```

Le script installera les dépendances et lancera automatiquement le serveur.

---

### 🍎🐧 Pour macOS/Linux

1. **Ouvrez le terminal**.
2. **Naviguez jusqu'au dossier du projet** :
   ```bash
   cd chemin/vers/votre/projet
   ```

3. **Option 1 : Utiliser `setup_unix.sh`**
   - Rendez le script exécutable (uniquement nécessaire une fois) :
     ```bash
     chmod +x setup_unix.sh
     ```
   - Ensuite, exécutez le script :
     ```bash
     ./setup_unix.sh
     ```
   
   👉 *Si le script ne s'exécute pas, essayez :*
   ```bash
   bash setup_unix.sh
   ```

4. **Option 2 : Utiliser le `Makefile`** (si `make` est installé)
   - Pour installer les dépendances :
     ```bash
     make install
     ```
   - Pour lancer le serveur :
     ```bash
     make run
     ```
   - Ou tout faire en une seule commande :
     ```bash
     make setup
     ```

---

## ✅ Vérification
- Une fois le serveur lancé, un message de confirmation apparaîtra.
- Accédez à l'interface via votre navigateur, généralement à l'adresse `http://127.0.0.1:5000`.

---

## ❓ Résolution des problèmes
- Vérifiez si **Python** est installé :
   ```bash
   python --version
   ```
- Si `python` ne fonctionne pas, essayez :
   ```bash
   python3 --version
   ```
- Vérifiez que `pip` est installé :
   ```bash
   pip --version
   ```
- Sur macOS/Linux, si `setup_unix.sh` ne s'exécute pas, vérifiez les permissions avec :
   ```bash
   ls -l setup_unix.sh
   ```
   et corrigez-les si nécessaire avec :
   ```bash
   chmod +x setup_unix.sh
   ```

---

## 🙌 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests pour améliorer ce projet.

---

Merci d'utiliser cet outil ! 🚀

