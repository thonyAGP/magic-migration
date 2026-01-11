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

*Genere le 2026-01-11 depuis C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\*
