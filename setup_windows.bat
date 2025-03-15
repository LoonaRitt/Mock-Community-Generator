@echo off

:: Vérifier si Python est installé
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python n'est pas installé. Veuillez l'installer avant de continuer.
    exit /b
)

:: Installer les dépendances Python
echo Installation des dépendances Python...
pip install -r requirements.txt

:: Lancer le serveur Python
echo Lancement du serveur...
python server.py
pause
