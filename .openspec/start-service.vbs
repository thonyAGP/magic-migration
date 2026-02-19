' OpenSpec Viewer - Demarrage silencieux (sans fenetre)
' Place ce fichier dans le dossier Demarrage pour auto-start

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\Projects\Lecteur Magic\.openspec"
WshShell.Run "cmd /c npx serve -l 3070 . --no-clipboard", 0, False
