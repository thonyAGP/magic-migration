# Reference des Fonctions Magic Unipaas

Ce document reference toutes les fonctions disponibles dans Magic Unipaas 2.3,
extraites de la documentation officielle (mghelpw.chm).

## Sources Documentation

| Source | Chemin | Contenu |
|--------|--------|---------|
| **CHM Principal** | `C:\Appwin\Magic\Magicxpa23\Support\MgHelpW.chm` | Documentation complete |
| **CHM Extrait** | `C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\` | 484 fichiers HTM |
| **Function Directory** | `.../Expression_Editor/Function_Directory.htm` | Index alphabetique |
| **Reference Rapide** | `quick-reference-top30.md` | TOP 30 avec equivalences TS/C#/Python |

**Total fonctions documentees**: ~380+ fonctions dans 28 categories

---

## 1. Fonctions Date et Heure

| Fonction | Description | Syntaxe |
|----------|-------------|---------|
| `AddDate` | Calcul sur une date | `AddDate(date, years, months, days)` |
| `AddDateTime` | Ajoute un intervalle a une valeur DateTime | `AddDateTime(date, time, years, months, days, hours, minutes, seconds)` |
| `AddTime` | Calcul sur une heure | `AddTime(time, hours, minutes, seconds)` |
| `BOM` | Debut du mois (Beginning Of Month) | `BOM(date)` |
| `BOY` | Debut de l'annee (Beginning Of Year) | `BOY(date)` |
| `CDOW` | Nom du jour (ex: Sunday) | `CDOW(date)` |
| `CMonth` | Nom du mois (ex: January) | `CMonth(date)` |
| `Date` | Date systeme | `Date()` |
| `Day` | Jour du mois (1-31) | `Day(date)` |
| `DifDateTime` | Difference entre deux DateTime | `DifDateTime(date1, time1, date2, time2, 'days'VAR, 'time'VAR)` |
| `DOW` | Numero du jour de la semaine (1-7) | `DOW(date)` |
| `DStr` | Conversion date vers chaine | `DStr(date, 'picture')` |
| `DVal` | Conversion chaine vers date | `DVal(string, 'picture')` |
| `EOM` | Fin du mois (End Of Month) | `EOM(date)` |
| `EOY` | Fin de l'annee (End Of Year) | `EOY(date)` |
| `Hour` | Portion heure | `Hour(time)` |
| `MDate` | Date Magic (logon) | `MDate()` |
| `Minute` | Portion minute | `Minute(time)` |
| `Month` | Portion mois | `Month(date)` |
| `mTime` | Heure en millisecondes | `mTime()` |
| `mTStr` | Conversion millisec vers chaine | `mTStr(milliseconds, 'picture')` |
| `NDOW` | Numero vers nom du jour | `NDOW(dayNumber)` |
| `NMonth` | Numero vers nom du mois | `NMonth(monthNumber)` |
| `Second` | Portion seconde | `Second(time)` |
| `Time` | Heure systeme | `Time()` |
| `TStr` | Conversion heure vers chaine | `TStr(time, 'picture')` |
| `TVal` | Conversion chaine vers heure | `TVal(string, 'picture')` |
| `Year` | Annee d'une date | `Year(date)` |

### Exemples d'utilisation

```
// Debut du mois courant
BOM(Date())  --> '01/12/2025'DATE

// Fin du mois d'une date
EOM('05/10/93'DATE)  --> '05/31/93'DATE

// Formatage de date
DStr(Date(), 'YYYYMMDD')  --> '20251222'

// Difference entre deux dates (resultat dans variables)
DifDateTime(dateEnd, Time(), dateStart, Time(), 'A'VAR, 'B'VAR)
// A = nombre de jours, B = portion temps
```

---

## 2. Fonctions Chaines (String)

| Fonction | Description | Syntaxe |
|----------|-------------|---------|
| `&` | Concatenation | `string1 & string2` |
| `ANSI2OEM` | Conversion ANSI vers OEM | `ANSI2OEM(string)` |
| `ASCIIChr` | Code vers caractere ASCII | `ASCIIChr(code)` |
| `ASCIIVal` | Caractere vers code ASCII | `ASCIIVal(string)` |
| `AStr` | Formatage de chaine | `AStr(string, 'picture')` |
| `CRC` | Calcul checksum | `CRC(string)` |
| `Del` | Suppression caracteres | `Del(string, start, length)` |
| `Fill` | Repetition chaine | `Fill(string, count)` |
| `Flip` | Inversion chaine | `Flip(string)` |
| `HVal` | Hexa vers decimal | `HVal(hexString)` |
| `Ins` | Insertion chaine | `Ins(string, insert, position)` |
| `InStr` | Recherche sous-chaine | `InStr(string, search)` |
| `Left` | Extraction gauche | `Left(string, length)` |
| `Len` | Longueur definie | `Len(string)` |
| `Logical` | Visual vers logique | `Logical(string)` |
| `Lower` | Minuscules | `Lower(string)` |
| `LTrim` | Suppression espaces gauche | `LTrim(string)` |
| `MID` | Extraction sous-chaine | `MID(string, start, length)` |
| `MlsTrans` | Traduction MLS | `MlsTrans(string)` |
| `OEM2ANSI` | Conversion OEM vers ANSI | `OEM2ANSI(string)` |
| `Rep` | Remplacement sous-chaine | `Rep(string, replace, start, length)` |
| `RepStr` | Remplacement toutes occurrences | `RepStr(string, search, replace)` |
| `Right` | Extraction droite | `Right(string, length)` |
| `RTrim` | Suppression espaces droite | `RTrim(string)` |
| `SoundX` | Comparaison phonetique | `SoundX(string)` |
| `StrBuild` | Construction avec placeholders | `StrBuild(template, arg1, arg2, ...)` |
| `StrToken` | Extraction token | `StrToken(string, delimiter, index)` |
| `StrTokenCnt` | Nombre de tokens | `StrTokenCnt(string, delimiter)` |
| `StrTokenIdx` | Index d'un token | `StrTokenIdx(string, delimiter, search)` |
| `Translate` | Resolution noms logiques | `Translate(string)` |
| `Trim` | Suppression espaces debut/fin | `Trim(string)` |
| `UnicodeChr` | Code vers Unicode | `UnicodeChr(code)` |
| `UnicodeFromANSI` | ANSI vers Unicode | `UnicodeFromANSI(string, codepage)` |
| `UnicodeToANSI` | Unicode vers ANSI | `UnicodeToANSI(string, codepage)` |
| `UnicodeVal` | Unicode vers code | `UnicodeVal(string)` |
| `Upper` | Majuscules | `Upper(string)` |
| `Val` | Chaine vers nombre | `Val(string, 'picture')` |
| `Visual` | Logique vers visual | `Visual(string)` |

### Exemples d'utilisation

```
// Suppression espaces
Trim(' abc ')  --> 'abc'

// Concatenation
'Hello' & ' ' & 'World'  --> 'Hello World'

// Extraction
MID('ABCDEF', 2, 3)  --> 'BCD'
Left('ABCDEF', 3)  --> 'ABC'
Right('ABCDEF', 3)  --> 'DEF'

// Remplacement
RepStr('aaa', 'a', 'bb')  --> 'bbbbbb'
```

---

## 3. Fonctions Numeriques

| Fonction | Description | Syntaxe |
|----------|-------------|---------|
| `*` | Multiplication | `a * b` |
| `+` | Addition | `a + b` |
| `-` | Soustraction | `a - b` |
| `/` | Division | `a / b` |
| `^` | Puissance | `a ^ b` |
| `MOD` | Modulo | `a MOD b` |
| `ABS` | Valeur absolue | `ABS(number)` |
| `ACOS` | Arc cosinus (radians) | `ACOS(number)` |
| `ASIN` | Arc sinus (radians) | `ASIN(number)` |
| `ATAN` | Arc tangente (radians) | `ATAN(number)` |
| `ChkDgt` | Chiffre de controle | `ChkDgt(number)` |
| `COS` | Cosinus | `COS(radians)` |
| `EXP` | Exponentielle | `EXP(number)` |
| `Fix` | Partie entiere | `Fix(number, decimals)` |
| `HStr` | Decimal vers hexa | `HStr(number)` |
| `LOG` | Logarithme naturel | `LOG(number)` |
| `MAX` | Maximum | `MAX(value1, value2, ...)` |
| `MIN` | Minimum | `MIN(value1, value2, ...)` |
| `MStr` | Nombre vers Magic format | `MStr(number, length)` |
| `RAND` | Nombre aleatoire | `RAND(seed)` |
| `Range` | Test intervalle | `Range(value, min, max)` |
| `Round` | Arrondi | `Round(number, decimals)` |
| `SIN` | Sinus | `SIN(radians)` |
| `Str` | Nombre vers chaine | `Str(number, 'picture')` |
| `TAN` | Tangente | `TAN(radians)` |

### Exemples d'utilisation

```
// Valeur absolue
ABS(-42)  --> 42

// Arrondi
Round(3.14159, 2)  --> 3.14

// Test intervalle
Range(5, 1, 10)  --> True
Range(15, 1, 10)  --> False

// Maximum
MAX(1, 5, 3, 2)  --> 5
```

---

## 4. Fonctions de Conversion

| Fonction | Description |
|----------|-------------|
| `ANSI2OEM` | ANSI vers OEM |
| `ASCIIChr` | Code vers caractere |
| `ASCIIVal` | Caractere vers code |
| `AStr` | Formatage chaine |
| `Blb2File` | BLOB vers fichier |
| `DStr` | Date vers chaine |
| `DVal` | Chaine vers date |
| `File2Blb` | Fichier vers BLOB |
| `File2Ole` | Fichier vers OLE |
| `HStr` | Decimal vers hexa |
| `HVal` | Hexa vers decimal |
| `Lower` | Vers minuscules |
| `MStr` | Nombre vers Magic format |
| `mTStr` | Millisec vers chaine |
| `mTVal` | Chaine vers millisec |
| `MVal` | Magic format vers nombre |
| `OEM2ANSI` | OEM vers ANSI |
| `TStr` | Heure vers chaine |
| `TVal` | Chaine vers heure |
| `UnicodeChr` | Code vers Unicode |
| `UnicodeVal` | Unicode vers code |
| `Upper` | Vers majuscules |
| `UTF8FromAnsi` | ANSI vers UTF8 |
| `UTF8ToAnsi` | UTF8 vers ANSI |
| `Val` | Chaine vers nombre |

---

## 5. Fonctions Base de Donnees

| Fonction | Description |
|----------|-------------|
| `ClrCache` | Vide le cache de la tache |
| `CurrPosition` | Position interne du record courant |
| `DbCache` | Ratio cache database |
| `DbCopy` | Copie fichier de donnees |
| `DbDel` | Supprime table Magic |
| `DbDiscnt` | Deconnecte la DB |
| `DbERR` | Message d'erreur DB |
| `DbExist` | Verifie existence DB |
| `DbName` | Nom de la table |
| `DbRecs` | Nombre de lignes |
| `DbReload` | Recharge table residente |
| `DbRound` | Arrondi DB SQL |
| `DbSize` | Taille de la table |
| `DbViewRowIdx` | Index de ligne dans vue cached |
| `DbViewSize` | Nombre de records cached |
| `EmptyDataview` | True si vue vide |
| `ErrDatabaseName` | Nom DB de l'erreur |
| `ErrDbmsCode` | Code erreur DBMS |
| `ErrDbmsMessage` | Message erreur DBMS |
| `ErrMagicName` | Literal Magic de l'erreur |
| `ErrPosition` | Position du record en erreur |
| `ErrTableName` | Nom table en erreur |
| `InTrans` | True si transaction ouverte |
| `LocateAdd` | Ajoute critere Locate |
| `LocateReset` | Reset Locate |
| `Logging` | Active/desactive logging |
| `MTblGet` | Recup contenu memory table |
| `MTblSet` | Cree records dans memory table |
| `RangeAdd` | Ajoute critere Range |
| `RangeReset` | Reset Range |
| `Rollback` | Rollback transaction |
| `SortAdd` | Ajoute critere tri |
| `SortReset` | Reset tri |
| `TransMode` | Info sur transaction active |
| `ViewMod` | True si records modifies |

---

## 6. Fonctions de Tache

| Fonction | Description |
|----------|-------------|
| `CallProg` | Appelle un programme |
| `Counter` | Compteur d'iterations |
| `DataViewToHTML` | Vue vers HTML |
| `DataViewToText` | Vue vers texte |
| `DataViewToXML` | Vue vers XML |
| `DataViewVars` | Variables de la vue |
| `Delay` | Pause execution |
| `EmptyDataview` | True si vue vide |
| `Flow` | Mode de flow |
| `FlwMtr` | Ajoute message activite |
| `GetComponentName` | Nom du composant |
| `GetGUID` | GUID de l'application |
| `GetLang` | Langue active |
| `GetParam` | Recupere parametre global |
| `GetParamAttr` | Attribut du parametre |
| `GetParamNames` | Noms des parametres |
| `HandledCtrl` | Nom du controle du handler |
| `Idle` | Temps d'inactivite |
| `InTrans` | Transaction ouverte? |
| `IsComponent` | Est un composant? |
| `IsFirstRecordCycle` | Premier cycle record? |
| `KbGet` | Derniere touche |
| `KbPut` | Simule touche |
| `Level` | Niveau d'execution |
| `Lock` | Verrouille ligne/tache |
| `LoopCounter` | Compteur de boucle |
| `MainDisplay` | Index du form affiche |
| `MainLevel` | Niveau principal |
| `Menu` | Chemin menu |
| `MenuIdx` | Index menu |
| `MMClear` | Efface records marques |
| `MMCount` | Nombre records marques |
| `MMCurr` | Record marque courant |
| `MMStop` | Arrete handler multi-mark |
| `MnuAdd` | Ajoute menu |
| `MnuCheck` | Coche menu |
| `MnuEnabl` | Active/desactive menu |
| `MnuName` | Texte menu |
| `MnuRemove` | Supprime menu |
| `MnuReset` | Reset menu |
| `MnuShow` | Affiche/cache menu |
| `Prog` | Chemin tache |
| `ProgIdx` | Index programme |
| `ProjectDir` | Repertoire composant |
| `PublicName` | Nom public programme |
| `RunMode` | Mode runtime |
| `SetLang` | Definit langue |
| `SetParam` | Definit parametre global |
| `SetWindowFocus` | Focus sur fenetre |
| `SharedValGet` | Recupere valeur partagee |
| `SharedValSet` | Definit valeur partagee |
| `Stat` | Mode de la tache |
| `SubformExecMode` | Mode execution subform |
| `TaskID` | ID de la tache |
| `TaskInstance` | Instance de la tache |
| `TaskTypeGet` | Type de la tache |
| `TDepth` | Profondeur tache |
| `THIS` | Reference tache/variable courante |
| `TransMode` | Info transaction |
| `TreeLevel` | Niveau noeud arbre |
| `TreeNodeGoto` | Aller au noeud |
| `TreeValue` | Valeur noeud |
| `UnLock` | Deverrouille |
| `ViewMod` | Records modifies? |

---

## 7. Fonctions Environnement

| Fonction | Description |
|----------|-------------|
| `ANSI2OEM` | ANSI vers OEM |
| `AppName` | Nom de l'application |
| `INIGet` | Lit valeur Magic.ini |
| `INIGetLn` | Lit ligne Magic.ini |
| `INIPut` | Ecrit valeur Magic.ini |
| `OEM2ANSI` | OEM vers ANSI |
| `OSEnvGet` | Lit variable environnement OS |
| `OSEnvSet` | Definit variable environnement |
| `Owner` | Valeur Owner |
| `ParamsPack` | Pack parametres en BLOB |
| `ParamsUnPack` | Unpack parametres |
| `SetLang` | Definit langue |
| `SharedValPack` | Pack valeurs partagees |
| `SharedValUnpack` | Unpack valeurs partagees |
| `Term` | Numero terminal |

---

## 8. Fonctions Variables

| Fonction | Description |
|----------|-------------|
| `CaretPosGet` | Position curseur Edit |
| `EditGet` | Valeur en mode edit |
| `EditSet` | Definit valeur edit |
| `IsDefault` | Valeur = defaut? |
| `ISNULL` | Valeur NULL? |
| `MarkedTextGet` | Texte selectionne |
| `MarkedTextSet` | Remplace texte selectionne |
| `MarkText` | Selectionne texte |
| `VarAttr` | Attribut variable |
| `VarCurr` | ID variable courante |
| `VarCurrN` | Valeur par nom |
| `VarDbName` | Nom physique variable |
| `VarIndex` | Index par nom |
| `VarInp` | Derniere variable input |
| `VarMod` | Variable modifiee? |
| `VarName` | Origine et description |
| `VarPic` | Picture de la variable |
| `VarPrev` | Valeur precedente |
| `VarSet` | Definit valeur variable |

---

## 9. Fonctions Interface

| Fonction | Description |
|----------|-------------|
| `CHeight` | Hauteur controle |
| `ClickCX` | X click relatif controle |
| `ClickCY` | Y click relatif controle |
| `ClickWX` | X click relatif fenetre |
| `ClickWY` | Y click relatif fenetre |
| `CtrlGoto` | Deplace curseur |
| `CtrlHWND` | Handle controle |
| `CurRow` | Ligne courante table |
| `CWidth` | Largeur controle |
| `CX` | Position X controle |
| `CY` | Position Y controle |
| `FormStateClear` | Efface etat form |
| `LastClicked` | Nom dernier controle clique |
| `LastPark` | Nom dernier park |
| `SetCrsr` | Forme curseur |
| `StatusBarSetText` | Texte barre statut |
| `TreeNodeGoto` | Aller au noeud |
| `WinBox` | Dimension fenetre |
| `WinHWND` | Handle fenetre |
| `WinMaximize` | Maximise fenetre |
| `WinMinimize` | Minimise fenetre |
| `WinRestore` | Restaure fenetre |

---

## 10. Fonctions I/O (Fichiers)

| Fonction | Description |
|----------|-------------|
| `Blb2File` | BLOB vers fichier |
| `DirDlg` | Dialog selection repertoire |
| `EOF` | Fin de fichier |
| `EOP` | Fin de page |
| `File2Blb` | Fichier vers BLOB |
| `File2OLE` | Fichier vers OLE |
| `FileCopy` | Copie fichier |
| `FileDelete` | Supprime fichier |
| `FileDlg` | Dialog ouverture fichier |
| `FileExist` | Fichier existe? |
| `FileInfo` | Proprietes fichier |
| `FileListGet` | Liste fichiers repertoire |
| `FileRename` | Renomme fichier |
| `IOCurr` | Position I/O device |
| `Line` | Numero ligne sortie |
| `Page` | Numero page sortie |

### Fonctions Rich Client

| Fonction | Description |
|----------|-------------|
| `ClientBlb2File` | BLOB vers fichier client |
| `ClientDirDlg` | Dialog rep client |
| `ClientFile2Blb` | Fichier client vers BLOB |
| `ClientFileCopy` | Copie fichier client |
| `ClientFileDelete` | Supprime fichier client |
| `ClientFileExist` | Fichier client existe? |
| `ClientFileInfo` | Props fichier client |
| `ClientFileListGet` | Liste fichiers client |
| `ClientFileOpenDlg` | Dialog ouverture client |
| `ClientFileRename` | Renomme fichier client |
| `ClientFileSaveDlg` | Dialog sauvegarde client |
| `ClientFileToServer` | Client vers serveur |
| `ServerFileToClient` | Serveur vers client |

---

## 11. Fonctions XML

### Fonctions Generales

| Fonction | Description |
|----------|-------------|
| `XMLStr` | XML valide vers chaine |
| `XMLVal` | Chaine vers XML valide |
| `XMLValidate` | Valide XML contre schema |
| `XMLValidationError` | Erreurs validation |

### Fonctions Vue XML

| Fonction | Description |
|----------|-------------|
| `DbXmlMixedGet` | Lit valeur mixed XML |
| `DbXmlMixedSet` | Ecrit valeur mixed XML |

### Fonctions XML Legacy

| Fonction | Description |
|----------|-------------|
| `XMLBlobGet` | Lit element par path |
| `XMLCnt` | Compte occurrences |
| `XMLDelete` | Supprime element |
| `XMLExist` | Element existe? |
| `XMLFind` | Trouve element par valeur |
| `XMLGet` | Lit valeur element |
| `XMLGetAlias` | Alias namespace |
| `XMLGetEncoding` | Encodage document |
| `XMLInsert` | Insere element |
| `XMLModify` | Modifie element |
| `XMLSetEncoding` | Definit encodage |
| `XMLSetNS` | Definit namespace |

---

## 12. Fonctions Vector (Tableaux)

| Fonction | Description |
|----------|-------------|
| `BufGetVector` | Buffer vers Vector |
| `BufSetVector` | Vector vers buffer |
| `VecCellAttr` | Attribut cellule |
| `VecGet` | Lit valeur cellule |
| `VecSet` | Ecrit valeur cellule |
| `VecSize` | Nombre cellules |

---

## 13. Fonctions Buffer

| Fonction | Description |
|----------|-------------|
| `BufGetAlpha` | Buffer vers Alpha |
| `BufGetBit` | Buffer vers Bit |
| `BufGetBlob` | Buffer vers BLOB |
| `BufGetDate` | Buffer vers Date |
| `BufGetLog` | Buffer vers Logical |
| `BufGetNum` | Buffer vers Numeric |
| `BufGetTime` | Buffer vers Time |
| `BufGetUnicode` | Buffer vers Unicode |
| `BufGetVariant` | Buffer vers Variant |
| `BufGetVector` | Buffer vers Vector |
| `BufSetAlpha` | Alpha vers buffer |
| `BufSetBit` | Bit vers buffer |
| `BufSetBlob` | BLOB vers buffer |
| `BufSetDate` | Date vers buffer |
| `BufSetLog` | Logical vers buffer |
| `BufSetNum` | Numeric vers buffer |
| `BufSetTime` | Time vers buffer |
| `BufSetUnicode` | Unicode vers buffer |
| `BufSetVariant` | Variant vers buffer |
| `BufSetVector` | Vector vers buffer |

---

## 14. Autres Categories

### Fonctions DLL

| Fonction | Description |
|----------|-------------|
| `CallDLL` | Appelle fonction DLL |
| `CallDLLF` | Appelle fonction DLL (float) |
| `CallDLLS` | Appelle fonction DLL (string) |

### Fonctions HTTP

| Fonction | Description |
|----------|-------------|
| `CallURL` | Appelle URL |
| `CallProgURL` | Appelle programme via URL |

### Fonctions Mail

| Fonction | Description |
|----------|-------------|
| `MailSend` | Envoie email |

### Fonctions Securite

| Fonction | Description |
|----------|-------------|
| `Cipher` | Chiffrement |
| `ClientCertificateAdd` | Ajoute certificat |
| `ClientCertificateDiscard` | Supprime certificat |

### Fonctions Presse-papier

| Fonction | Description |
|----------|-------------|
| `ClipAdd` | Ajoute au presse-papier |
| `ClipRead` | Lit presse-papier |
| `ClipWrite` | Ecrit presse-papier |

### Fonctions Contexte

| Fonction | Description |
|----------|-------------|
| `CtxClose` | Ferme contexte |
| `CtxGetAllNames` | Tous les noms |
| `CtxGetId` | ID contexte |
| `CtxGetName` | Nom contexte |
| `CtxKill` | Tue contexte |
| `CtxLstUse` | Derniere utilisation |
| `CtxNum` | Numero contexte |
| `CtxProg` | Programme contexte |
| `CtxSetName` | Definit nom |
| `CtxSize` | Taille contexte |
| `CtxStat` | Statut contexte |

### Fonctions COM/OLE

| Fonction | Description |
|----------|-------------|
| `COMError` | Erreur COM |
| `COMHandleGet` | Handle COM |
| `COMHandleSet` | Definit handle COM |
| `COMObjCreate` | Cree objet COM |
| `COMObjRelease` | Libere objet COM |

---

## 15. Operateurs Logiques et Conditions

### Operateurs

| Operateur | Description |
|-----------|-------------|
| `=` | Egalite |
| `<>` | Different |
| `<` | Inferieur |
| `<=` | Inferieur ou egal |
| `>` | Superieur |
| `>=` | Superieur ou egal |
| `AND` | ET logique |
| `OR` | OU logique |
| `NOT` | NON logique |

### Fonctions Conditionnelles

| Fonction | Description | Syntaxe |
|----------|-------------|---------|
| `IF` | Condition | `IF(condition, valueIfTrue, valueIfFalse)` |
| `CASE` | Selection multiple | `CASE(cond1, val1, cond2, val2, ..., defaultVal)` |
| `CndRange` | Range conditionnel | `CndRange(value, min, max)` |

### Exemples

```
// IF simple
IF(A > B, A, B)  --> retourne le maximum

// IF imbrique
IF(A > 100, 'Grand', IF(A > 50, 'Moyen', 'Petit'))

// CASE
CASE(Status = 'A', 'Actif', Status = 'I', 'Inactif', 'Inconnu')

// Comparaison de dates
IF(ED > DP, ED, DP)  --> date la plus recente
IF(EE < DQ, EE, DQ)  --> date la plus ancienne
```

---

## 16. Syntaxe Speciale

### References de Variables

```
{0, N}      --> Variable N du contexte courant
{32768, N}  --> Variable N du Main Program
A, B, ... Z --> Variables 1-26
BA, BB, ... --> Variables 27-52
```

### Suffixes de Type

```
'valeur'ALPHA  --> Type Alpha
'valeur'DATE   --> Type Date
'valeur'VAR    --> Reference a une variable
```

### Parametres Speciaux

```
GetParam('nom')     --> Lit parametre global
SetParam('nom', v)  --> Definit parametre global
INIGet('section', 'key')  --> Lit depuis Magic.ini
```

---

## Notes de Migration

### Equivalences TypeScript

| Magic | TypeScript |
|-------|------------|
| `Trim(s)` | `s.trim()` |
| `Upper(s)` | `s.toUpperCase()` |
| `Lower(s)` | `s.toLowerCase()` |
| `Len(s)` | `s.length` |
| `MID(s,start,len)` | `s.substring(start-1, start-1+len)` |
| `InStr(s,search)` | `s.indexOf(search) + 1` |
| `Date()` | `new Date()` |
| `BOM(d)` | `startOfMonth(d)` (date-fns) |
| `EOM(d)` | `endOfMonth(d)` (date-fns) |
| `DifDateTime(...)` | `differenceInDays(d1, d2)` |
| `IF(c,t,f)` | `c ? t : f` |
| `CASE(...)` | `switch` ou ternaires |

### Equivalences C#

| Magic | C# |
|-------|-----|
| `Trim(s)` | `s.Trim()` |
| `Date()` | `DateTime.Today` ou `DateOnly.Today` |
| `BOM(d)` | `new DateOnly(d.Year, d.Month, 1)` |
| `EOM(d)` | `new DateOnly(d.Year, d.Month, DateTime.DaysInMonth(d.Year, d.Month))` |

### Equivalences Python

| Magic | Python |
|-------|--------|
| `Trim(s)` | `s.strip()` |
| `Date()` | `date.today()` |
| `BOM(d)` | `d.replace(day=1)` |
| `EOM(d)` | `(d.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)` |
