# Reference Rapide - TOP 30 Fonctions Magic

> Les fonctions les plus utilisees dans les projets PMS.
> Source: Documentation CHM Magic xpa 2.3 + Analyse des projets ADH/PBP/REF/VIL/PBG/PVE

---

## Fonctions Conditionnelles (CRITIQUES)

### IF - Condition ternaire
```
Syntaxe: IF(Boolean, TrueValue, FalseValue)
Retour:  TrueValue si condition vraie, FalseValue sinon

Exemple: IF(A=1, 'Bleu', 'Vert')

TypeScript: condition ? trueVal : falseVal
C#:         condition ? trueVal : falseVal
Python:     trueVal if condition else falseVal
```

### CASE - Selection multiple
```
Syntaxe: CASE(cond1, val1, cond2, val2, ..., defaultVal)
Retour:  Valeur correspondant a la premiere condition vraie

Exemple: CASE(Status='A', 'Actif', Status='I', 'Inactif', 'Inconnu')

TypeScript: switch ou ternaires imbriques
C#:         switch expression (C# 8+)
Python:     match/case (Python 3.10+) ou dict
```

---

## Fonctions String (TRES FREQUENTES)

### Trim / LTrim / RTrim - Suppression espaces
```
Syntaxe: Trim(string)
Retour:  String sans espaces debut/fin

TypeScript: s.trim() / s.trimStart() / s.trimEnd()
C#:         s.Trim() / s.TrimStart() / s.TrimEnd()
Python:     s.strip() / s.lstrip() / s.rstrip()
```

### Upper / Lower - Casse
```
Syntaxe: Upper(string), Lower(string)

TypeScript: s.toUpperCase() / s.toLowerCase()
C#:         s.ToUpper() / s.ToLower()
Python:     s.upper() / s.lower()
```

### Len - Longueur
```
Syntaxe: Len(string)
Retour:  Numeric - longueur de la chaine

TypeScript: s.length
C#:         s.Length
Python:     len(s)
```

### MID - Extraction sous-chaine
```
Syntaxe: MID(string, start, length)
Retour:  Sous-chaine extraite
Note:    Index commence a 1 en Magic!

Exemple: MID('ABCDEF', 2, 3) = 'BCD'

TypeScript: s.substring(start-1, start-1+length)
C#:         s.Substring(start-1, length)
Python:     s[start-1:start-1+length]
```

### Left / Right - Extraction debut/fin
```
Syntaxe: Left(string, length), Right(string, length)

TypeScript: s.substring(0, length) / s.slice(-length)
C#:         s.Substring(0, length) / s.Substring(s.Length - length)
Python:     s[:length] / s[-length:]
```

### InStr - Recherche position
```
Syntaxe: InStr(string, substring)
Retour:  Position (1-based) ou 0 si non trouve

TypeScript: s.indexOf(sub) + 1  // 0 si non trouve
C#:         s.IndexOf(sub) + 1
Python:     s.find(sub) + 1  // 0 si non trouve
```

### Rep / RepStr - Remplacement
```
Syntaxe: Rep(string, replace, start, length)
         RepStr(string, search, replace)

TypeScript: s.replace(search, replace) / s.replaceAll(search, replace)
C#:         s.Replace(search, replace)
Python:     s.replace(search, replace)
```

---

## Fonctions Conversion (ESSENTIELLES)

### Val - String vers Nombre
```
Syntaxe: Val(string, picture)
Retour:  Numeric
Note:    picture vide accepte pour nombres standards

Exemple: Val('45.12', '##.#') = 45.1
         Val('123', '') = 123

TypeScript: parseFloat(s) ou new Decimal(s)
C#:         decimal.Parse(s) ou Convert.ToDecimal(s)
Python:     Decimal(s) ou float(s)
```

### Str - Nombre vers String
```
Syntaxe: Str(number, picture)
Retour:  Alpha

Exemple: Str(45.123, '##.##') = '45.12'

TypeScript: n.toFixed(2) ou format avec Decimal.js
C#:         n.ToString("F2") ou String.Format
Python:     f"{n:.2f}" ou format()
```

---

## Fonctions Date/Heure (FREQUENTES)

### Date / Time - Dates systeme
```
Syntaxe: Date(), Time()
Retour:  Date actuelle, Heure actuelle

TypeScript: new Date()
C#:         DateTime.Now / DateTime.Today / DateOnly.FromDateTime(DateTime.Now)
Python:     datetime.now() / date.today()
```

### DStr - Date vers String
```
Syntaxe: DStr(date, 'picture')

Exemple: DStr(Date(), 'YYYYMMDD') = '20260111'
         DStr(Date(), 'DD/MM/YYYY') = '11/01/2026'

TypeScript: format(date, 'yyyyMMdd') // date-fns
C#:         date.ToString("yyyyMMdd")
Python:     date.strftime('%Y%m%d')
```

### DVal - String vers Date
```
Syntaxe: DVal(string, 'picture')

Exemple: DVal('20260111', 'YYYYMMDD')

TypeScript: parse(s, 'yyyyMMdd', new Date()) // date-fns
C#:         DateOnly.ParseExact(s, "yyyyMMdd")
Python:     datetime.strptime(s, '%Y%m%d').date()
```

### Year / Month / Day - Extraction composants
```
Syntaxe: Year(date), Month(date), Day(date)

TypeScript: date.getFullYear(), date.getMonth()+1, date.getDate()
C#:         date.Year, date.Month, date.Day
Python:     date.year, date.month, date.day
```

### BOM / EOM - Debut/Fin de mois
```
Syntaxe: BOM(date), EOM(date)
Retour:  Premier/Dernier jour du mois

TypeScript: startOfMonth(date), endOfMonth(date) // date-fns
C#:         new DateOnly(d.Year, d.Month, 1)
            new DateOnly(d.Year, d.Month, DateTime.DaysInMonth(d.Year, d.Month))
Python:     d.replace(day=1)
            (d.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
```

### AddDate - Calcul sur date
```
Syntaxe: AddDate(date, years, months, days)

TypeScript: addYears(addMonths(addDays(date, days), months), years)
C#:         date.AddYears(y).AddMonths(m).AddDays(d)
Python:     date + relativedelta(years=y, months=m, days=d)
```

---

## Fonctions Base de Donnees (IMPORTANTES)

### Counter - Compteur iterations
```
Syntaxe: Counter(generation)
Retour:  Numero iteration record (1-based)
Note:    generation 0 = tache courante, 1 = parent

TypeScript: let counter = 0; for(...) { counter++; }
C#:         int counter = 0; foreach(...) { counter++; }
Python:     for i, record in enumerate(records, 1):
```

### DbRecs - Nombre d'enregistrements
```
Syntaxe: DbRecs(tableNumber, '')
Retour:  Nombre total de records dans la table

TypeScript: await prisma.table.count()
C#:         await context.Table.CountAsync()
Python:     session.query(Table).count()
```

### EOF - End Of File
```
Syntaxe: EOF(generation)
Retour:  Logical - TRUE si fin de fichier/table

TypeScript: index >= records.length
C#:         !reader.HasRows ou fin de foreach
Python:     iteration terminee
```

---

## Fonctions Programme (CRITIQUES pour migration)

### CallProg - Appel programme
```
Syntaxe: CallProg(programNumber, arg1, arg2, ...)
Retour:  Valeur retournee par le programme
Note:    Parametres toujours "by value"

TypeScript: await service.methodName(args)
C#:         await _service.MethodNameAsync(args)
Python:     await service.method_name(args)
```

### Prog - Programme courant
```
Syntaxe: Prog()
Retour:  Numero du programme en cours

TypeScript: // Nom de la classe/methode
C#:         nameof(ClassName)
Python:     __name__
```

### Level - Niveau tache
```
Syntaxe: Level(generation)
Retour:  Niveau hierarchique (0=Main, 1+=subtasks)
```

---

## Fonctions Systeme

### GetParam / SetParam - Parametres globaux
```
Syntaxe: GetParam('name'), SetParam('name', value)

TypeScript: process.env.NAME ou config.get('name')
C#:         Configuration["Name"] ou IOptions
Python:     os.environ.get('NAME') ou config
```

### OSEnvGet - Variable environnement
```
Syntaxe: OSEnvGet('NAME')
Retour:  Valeur de la variable d'environnement

TypeScript: process.env.NAME
C#:         Environment.GetEnvironmentVariable("NAME")
Python:     os.environ.get('NAME')
```

### User - Utilisateur connecte
```
Syntaxe: User()
Retour:  Nom utilisateur Magic connecte

TypeScript: req.user?.name ou context.user
C#:         User.Identity?.Name
Python:     current_user.username
```

---

## Fonctions Numeriques

### Round - Arrondi
```
Syntaxe: Round(number, decimals)

TypeScript: Math.round(n * 10**d) / 10**d ou Decimal.round()
C#:         Math.Round(n, d)
Python:     round(n, d)
```

### ABS - Valeur absolue
```
Syntaxe: ABS(number)

TypeScript: Math.abs(n)
C#:         Math.Abs(n)
Python:     abs(n)
```

### MIN / MAX
```
Syntaxe: MIN(val1, val2, ...), MAX(val1, val2, ...)

TypeScript: Math.min(...values), Math.max(...values)
C#:         Math.Min(a, b), Math.Max(a, b)
Python:     min(values), max(values)
```

### MOD - Modulo
```
Syntaxe: MOD(dividend, divisor)

TypeScript: dividend % divisor
C#:         dividend % divisor
Python:     dividend % divisor
```

---

## Litteraux Speciaux Magic

| Litteral | Description | Exemple |
|----------|-------------|---------|
| `'text'` | Chaine Alpha | `'Hello'` |
| `'date'DATE` | Valeur date | `'25/12/2025'DATE` |
| `'time'TIME` | Valeur heure | `'14:30:00'TIME` |
| `'n'PROG` | Reference programme | `'23'PROG` |
| `'n'DSOURCE` | Reference table | `'40'DSOURCE` |
| `{0,N}` | Variable N contexte 0 | `{0,3}` = Variable D |
| `{32768,N}` | Variable N Main Program | `{32768,0}` |

---

## Operateurs

| Magic | TypeScript | C# | Python | Description |
|-------|------------|-----|--------|-------------|
| `=` | `===` | `==` | `==` | Egalite |
| `<>` | `!==` | `!=` | `!=` | Difference |
| `&` | `+` | `+` | `+` | Concatenation |
| `AND` | `&&` | `&&` | `and` | ET logique |
| `OR` | `\|\|` | `\|\|` | `or` | OU logique |
| `NOT` | `!` | `!` | `not` | Negation |

---

## Patterns de Migration Courants

### Pattern 1: Boucle sur table
```
Magic:
  Task Type: Batch
  Main Source: Table 40
  Range: Variable A = Param

TypeScript:
  const records = await prisma.table40.findMany({
    where: { variableA: param }
  });
  for (const record of records) { ... }

C#:
  var records = await _context.Table40
    .Where(x => x.VariableA == param)
    .ToListAsync();
  foreach (var record in records) { ... }
```

### Pattern 2: Calcul conditionnel
```
Magic:
  IF(A > 0, A * B / 100, 0)

TypeScript:
  const result = a > 0 ? a * b / 100 : 0;

C#:
  var result = a > 0 ? a * b / 100m : 0m;
```

### Pattern 3: Formatage date
```
Magic:
  DStr(Date(), 'DD/MM/YYYY')

TypeScript:
  format(new Date(), 'dd/MM/yyyy')

C#:
  DateTime.Now.ToString("dd/MM/yyyy")
```

---

---

## Fonctions Supplementaires (TOP 20 par frequence)

### MlsTrans - Traduction Multi-Language System
```
Syntaxe: MlsTrans(string)
Retour:  Traduction de la chaine selon langue active
Usage:   710 occurrences dans projets PMS

TypeScript: i18n.t(key) // i18next
C#:         _localizer[key] // IStringLocalizer
Python:     gettext(key) ou _(key)
```

### ExpCalc - Evaluateur d'expressions dynamiques
```
Syntaxe: ExpCalc(expressionNumber)
Retour:  Resultat de l'expression referencee
Note:    Permet d'evaluer dynamiquement une expression
Usage:   175 occurrences

TypeScript: // Pas d'equivalent direct - stocker dans variable
C#:         // Utiliser delegate ou Func<T>
Python:     eval() // avec precautions
```

### IN - Test appartenance
```
Syntaxe: value IN list
Retour:  Logical - TRUE si valeur dans liste
Usage:   145 occurrences

Exemple: Status IN 'A,B,C'

TypeScript: ['A','B','C'].includes(status)
C#:         new[] {"A","B","C"}.Contains(status)
Python:     status in ['A','B','C']
```

### CndRange - Range conditionnel
```
Syntaxe: CndRange(condition, table, field, from, to)
Retour:  Logical
Note:    Applique un range sur table si condition vraie
Usage:   99 occurrences

TypeScript: if (cond) query = query.where(field).gte(from).lte(to)
C#:         if (cond) query = query.Where(x => x.Field >= from && x.Field <= to)
Python:     if cond: query = query.filter(Table.field.between(from, to))
```

### INIGet - Lecture fichier INI
```
Syntaxe: INIGet(file, section, key)
Retour:  Valeur de la cle INI
Usage:   95 occurrences

TypeScript: ini.parse(fs.readFileSync(file))[section][key]
C#:         Configuration.GetSection(section)[key]
Python:     configparser.read(file); config[section][key]
```

### TStr - Time vers String
```
Syntaxe: TStr(time, 'picture')
Usage:   79 occurrences

Exemple: TStr(Time(), 'HH:MM:SS') = '14:30:45'

TypeScript: format(time, 'HH:mm:ss') // date-fns
C#:         time.ToString("HH:mm:ss")
Python:     time.strftime('%H:%M:%S')
```

### Fill - Repetition caractere
```
Syntaxe: Fill(string, count)
Retour:  Chaine repetee count fois
Usage:   77 occurrences

Exemple: Fill('*', 5) = '*****'

TypeScript: '*'.repeat(5)
C#:         new string('*', 5)
Python:     '*' * 5
```

### DbDel - Suppression table Magic
```
Syntaxe: DbDel(tableNumber, mode)
Retour:  Logical - TRUE si succes
Usage:   67 occurrences

TypeScript: await prisma.table.deleteMany()
C#:         await context.Table.ExecuteDeleteAsync()
Python:     session.query(Table).delete()
```

### GetHostName - Nom machine
```
Syntaxe: GetHostName()
Retour:  Nom de la machine cliente
Usage:   65 occurrences

TypeScript: os.hostname()
C#:         Environment.MachineName
Python:     socket.gethostname()
```

### ASCIIChr - Code vers caractere
```
Syntaxe: ASCIIChr(code)
Retour:  Caractere ASCII correspondant
Usage:   60 occurrences

Exemple: ASCIIChr(65) = 'A'

TypeScript: String.fromCharCode(65)
C#:         (char)65 ou Convert.ToChar(65)
Python:     chr(65)
```

### Fix - Partie entiere (troncature)
```
Syntaxe: Fix(number, decimals)
Retour:  Nombre tronque (pas arrondi)
Usage:   36 occurrences

Exemple: Fix(3.7, 0) = 3

TypeScript: Math.trunc(n) ou Math.floor(n)
C#:         Math.Truncate(n)
Python:     math.trunc(n) ou int(n)
```

### FileExist - Test existence fichier
```
Syntaxe: FileExist(filename)
Retour:  Logical - TRUE si fichier existe
Usage:   30 occurrences

TypeScript: fs.existsSync(filename)
C#:         File.Exists(filename)
Python:     os.path.exists(filename)
```

### Stat - Statistiques
```
Syntaxe: Stat(type, generation)
Retour:  Statistique demandee (records lus, modifies, etc)
Usage:   29 occurrences

Type: 0=Total, 1=Inserted, 2=Updated, 3=Deleted

TypeScript: // Compteurs manuels dans le code
C#:         context.ChangeTracker.Entries().Count(...)
Python:     session.new, session.dirty, session.deleted
```

### Translate - Resolution noms logiques
```
Syntaxe: Translate(logicalName)
Retour:  Chemin physique correspondant
Usage:   24 occurrences

TypeScript: config.paths[logicalName]
C#:         Configuration["Paths:" + logicalName]
Python:     config.paths.get(logical_name)
```

### Hour - Extraction heure
```
Syntaxe: Hour(time)
Retour:  Partie heure (0-23)
Usage:   23 occurrences

TypeScript: date.getHours()
C#:         time.Hour
Python:     time.hour
```

### StrBuild - Construction chaine avec placeholders
```
Syntaxe: StrBuild(template, arg1, arg2, ...)
Retour:  Chaine construite
Usage:   18 occurrences

Exemple: StrBuild('Hello %s, you have %d messages', name, count)

TypeScript: `Hello ${name}, you have ${count} messages`
C#:         string.Format("Hello {0}, you have {1} messages", name, count)
            $"Hello {name}, you have {count} messages"
Python:     f"Hello {name}, you have {count} messages"
```

### IsFirstRecordCycle - Premier cycle record
```
Syntaxe: IsFirstRecordCycle(generation)
Retour:  Logical - TRUE si premier passage sur ce record
Usage:   17 occurrences

TypeScript: index === 0 // dans une boucle
C#:         isFirst flag
Python:     enumerate avec check index == 0
```

### DbName - Nom de table
```
Syntaxe: DbName(tableNumber)
Retour:  Nom de la table
Usage:   15 occurrences

TypeScript: tableName // stocke dans config
C#:         context.Model.FindEntityType(typeof(T))?.GetTableName()
Python:     Table.__tablename__
```

### Year / Month - Extraction annee/mois
```
Syntaxe: Year(date), Month(date)
Usage:   Deja dans section Date/Heure principale

TypeScript: date.getFullYear(), date.getMonth() + 1
C#:         date.Year, date.Month
Python:     date.year, date.month
```

### Minute / Second - Extraction minute/seconde
```
Syntaxe: Minute(time), Second(time)
Retour:  Partie minute (0-59), seconde (0-59)

TypeScript: date.getMinutes(), date.getSeconds()
C#:         time.Minute, time.Second
Python:     time.minute, time.second
```

---

## Resume - Couverture Fonctions

| Categorie | Fonctions documentees | Coverage |
|-----------|----------------------|----------|
| Conditionnelles | IF, CASE, IN | 100% |
| String | 15 fonctions | 90% |
| Conversion | Val, Str, DStr, DVal, TStr, ASCIIChr | 85% |
| Date/Heure | 12 fonctions | 95% |
| Numeriques | Round, ABS, MIN, MAX, MOD, Fix | 90% |
| Base de donnees | DbRecs, DbDel, DbName, Counter, EOF | 80% |
| Programme | CallProg, Prog, Level, ExpCalc | 85% |
| Systeme | GetParam, SetParam, OSEnvGet, User, INIGet | 90% |
| Fichiers | FileExist, Translate | 70% |
| I18n | MlsTrans | 100% |

**Total: 50 fonctions avec equivalences TS/C#/Python**

---

*Genere le 2026-01-11 depuis C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\*
*Mis a jour avec analyse frequence sur 200 fichiers XML projets PMS*
