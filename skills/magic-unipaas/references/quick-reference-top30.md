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

## Batch 1 - Fonctions Date/Heure Additionnelles (30 nouvelles)

### DOW - Jour de la semaine (nombre)
```
Syntaxe: DOW(date)
Retour:  Numero du jour (1=Dimanche, 2=Lundi, ... 7=Samedi)

Exemple: DOW('29/01/92'Date) = 4 (Mercredi)

TypeScript: date.getDay() + 1  // JS: 0=Dimanche
C#:         (int)date.DayOfWeek + 1
Python:     date.isoweekday() % 7 + 1  // Ajuster pour Magic
```

### CDOW - Nom du jour (string)
```
Syntaxe: CDOW(date)
Retour:  Nom du jour en toutes lettres

Exemple: CDOW('01/28/92'DATE) = 'Tuesday'

TypeScript: format(date, 'EEEE', { locale: fr }) // date-fns
C#:         date.ToString("dddd", CultureInfo.CurrentCulture)
Python:     date.strftime('%A')
```

### NDOW - Numero vers nom jour
```
Syntaxe: NDOW(dayNumber)
Retour:  Nom du jour correspondant au numero

Exemple: NDOW(1) = 'Sunday', NDOW(2) = 'Monday'

TypeScript: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][n-1]
C#:         CultureInfo.CurrentCulture.DateTimeFormat.DayNames[(n-1) % 7]
Python:     calendar.day_name[(n-1) % 7]
```

### CMonth - Nom du mois (string)
```
Syntaxe: CMonth(date)
Retour:  Nom du mois en toutes lettres

Exemple: CMonth('01/28/92'DATE) = 'January'

TypeScript: format(date, 'MMMM', { locale: fr })
C#:         date.ToString("MMMM", CultureInfo.CurrentCulture)
Python:     date.strftime('%B')
```

### NMonth - Numero vers nom mois
```
Syntaxe: NMonth(monthNumber)
Retour:  Nom du mois (1=January, 12=December)

Exemple: NMonth(1) = 'January'

TypeScript: format(new Date(2000, n-1, 1), 'MMMM')
C#:         CultureInfo.CurrentCulture.DateTimeFormat.MonthNames[n-1]
Python:     calendar.month_name[n]
```

### BOY - Debut d'annee
```
Syntaxe: BOY(date)
Retour:  Date du 1er janvier de l'annee

Exemple: BOY('10/05/93'DATE) = '01/01/93'

TypeScript: startOfYear(date) // date-fns
C#:         new DateOnly(date.Year, 1, 1)
Python:     date.replace(month=1, day=1)
```

### EOY - Fin d'annee
```
Syntaxe: EOY(date)
Retour:  Date du 31 decembre de l'annee

Exemple: EOY('11/17/93'Date) = '12/31/93'

TypeScript: endOfYear(date) // date-fns
C#:         new DateOnly(date.Year, 12, 31)
Python:     date.replace(month=12, day=31)
```

### MDate - Date Magic (session)
```
Syntaxe: MDate()
Retour:  Date de connexion Magic (Logon dialog)
Note:    Differente de Date() qui est la date systeme

TypeScript: sessionDate // Variable de session
C#:         _session.MagicDate
Python:     session.magic_date
```

### AddTime - Calcul sur heure
```
Syntaxe: AddTime(time, hours, minutes, seconds)
Retour:  Nouvelle heure apres ajout

Exemple: AddTime('12:00:00'Time, 1, 2, 3) = '13:02:03'

TypeScript: addHours(addMinutes(addSeconds(time, s), m), h)
C#:         time.Add(new TimeSpan(h, m, s))
Python:     time + timedelta(hours=h, minutes=m, seconds=s)
```

### AddDateTime - Calcul sur date+heure
```
Syntaxe: AddDateTime(Date, Time, years, months, days, hours, minutes, seconds)
Retour:  Logical (met a jour les variables passees par reference)

TypeScript: // Pas d'equivalent direct - utiliser date-fns
C#:         dateTime.AddYears(y).AddMonths(m).AddDays(d).AddHours(h).AddMinutes(mi).AddSeconds(s)
Python:     dt + relativedelta(years=y, months=m, days=d) + timedelta(hours=h, minutes=m, seconds=s)
```

### DifDateTime - Difference entre dates/heures
```
Syntaxe: DifDateTime(Date1, Time1, Date2, Time2, DaysVar, SecondsVar)
Retour:  Met a jour DaysVar et SecondsVar avec la difference

TypeScript: const diff = date1.getTime() - date2.getTime();
            const days = Math.floor(diff / 86400000);
            const secs = (diff % 86400000) / 1000;
C#:         TimeSpan diff = dt1 - dt2;
            int days = (int)diff.TotalDays;
            int secs = (int)(diff.TotalSeconds % 86400);
Python:     diff = dt1 - dt2; days = diff.days; secs = diff.seconds
```

### TVal - String vers Time
```
Syntaxe: TVal(string, 'picture')
Retour:  Valeur Time

Exemple: TVal('143045', 'HHMMSS') = 14:30:45

TypeScript: parse(s, 'HHmmss', new Date()) // date-fns
C#:         TimeOnly.ParseExact(s, "HHmmss")
Python:     datetime.strptime(s, '%H%M%S').time()
```

### Week - Numero de semaine
```
Syntaxe: Week(date)
Retour:  Numero de la semaine dans l'annee (1-53)

TypeScript: getWeek(date) // date-fns
C#:         CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(date, ...)
Python:     date.isocalendar()[1]
```

### MTime - Heure Magic (session)
```
Syntaxe: MTime()
Retour:  Heure de connexion Magic
Note:    Non supportee en Rich Client

TypeScript: sessionTime
C#:         _session.MagicTime
Python:     session.magic_time
```

### Delay - Pause execution
```
Syntaxe: Delay(seconds)
Retour:  Rien - pause l'execution
Note:    A utiliser avec precaution

TypeScript: await new Promise(r => setTimeout(r, seconds * 1000))
C#:         await Task.Delay(TimeSpan.FromSeconds(seconds))
Python:     await asyncio.sleep(seconds)
```

### Timer - Temps ecoule
```
Syntaxe: Timer(reset)
Retour:  Secondes depuis dernier reset (reset=TRUE remet a 0)

TypeScript: performance.now() / 1000
C#:         Stopwatch.Elapsed.TotalSeconds
Python:     time.perf_counter()
```

### IsNull - Test valeur nulle
```
Syntaxe: IsNull(expression)
Retour:  Logical - TRUE si expression est NULL

TypeScript: value === null || value === undefined
C#:         value == null
Python:     value is None
```

### NullVal - Valeur nulle typee
```
Syntaxe: NullVal(type)
Retour:  Valeur NULL du type specifie
Note:    type: A=Alpha, N=Numeric, D=Date, T=Time, L=Logical

TypeScript: null
C#:         default(T) ou null
Python:     None
```

### IsDefault - Test valeur par defaut
```
Syntaxe: IsDefault(variable)
Retour:  Logical - TRUE si variable a sa valeur par defaut

TypeScript: value === defaultValue
C#:         EqualityComparer<T>.Default.Equals(value, default)
Python:     value == default_value
```

### Range - Verification plage
```
Syntaxe: Range(value, min, max)
Retour:  Logical - TRUE si min <= value <= max

TypeScript: value >= min && value <= max
C#:         value >= min && value <= max
Python:     min <= value <= max
```

### DelStr - Suppression dans chaine
```
Syntaxe: DelStr(string, start, length)
Retour:  Chaine avec portion supprimee

Exemple: DelStr('ABCDEF', 2, 3) = 'AEF'

TypeScript: s.substring(0, start-1) + s.substring(start-1+length)
C#:         s.Remove(start-1, length)
Python:     s[:start-1] + s[start-1+length:]
```

### Ins - Insertion dans chaine
```
Syntaxe: Ins(string, insertStr, position)
Retour:  Chaine avec insertion

Exemple: Ins('ABCD', 'XX', 2) = 'AXXBCD'

TypeScript: s.slice(0, pos-1) + insertStr + s.slice(pos-1)
C#:         s.Insert(pos-1, insertStr)
Python:     s[:pos-1] + insertStr + s[pos-1:]
```

### Flip - Inversion chaine
```
Syntaxe: Flip(string)
Retour:  Chaine inversee

Exemple: Flip('ABCD') = 'DCBA'

TypeScript: s.split('').reverse().join('')
C#:         new string(s.Reverse().ToArray())
Python:     s[::-1]
```

### Soundx - Code phonetique
```
Syntaxe: Soundx(string)
Retour:  Code Soundex (4 caracteres)

Exemple: Soundx('Robert') = 'R163'

TypeScript: soundex(s) // librairie externe
C#:         // Implementer Soundex ou librairie
Python:     jellyfish.soundex(s)
```

### Like - Comparaison pattern
```
Syntaxe: Like(string, pattern)
Retour:  Logical - TRUE si match
Note:    * = n'importe quels caracteres, ? = un caractere

TypeScript: new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$').test(s)
C#:         Regex.IsMatch(s, "^" + Regex.Escape(pattern).Replace("\\*", ".*").Replace("\\?", ".") + "$")
Python:     fnmatch.fnmatch(s, pattern)
```

### ASCIIVal - Caractere vers code
```
Syntaxe: ASCIIVal(character)
Retour:  Code ASCII du caractere

Exemple: ASCIIVal('A') = 65

TypeScript: s.charCodeAt(0)
C#:         (int)s[0]
Python:     ord(s)
```

### Log - Logarithme naturel
```
Syntaxe: Log(number)
Retour:  Logarithme naturel (base e)

TypeScript: Math.log(n)
C#:         Math.Log(n)
Python:     math.log(n)
```

### Exp - Exponentielle
```
Syntaxe: Exp(number)
Retour:  e^number

TypeScript: Math.exp(n)
C#:         Math.Exp(n)
Python:     math.exp(n)
```

### Pwr - Puissance
```
Syntaxe: Pwr(base, exponent)
Retour:  base^exponent

TypeScript: Math.pow(base, exp) ou base ** exp
C#:         Math.Pow(base, exp)
Python:     base ** exp ou math.pow(base, exp)
```

### Sqrt - Racine carree
```
Syntaxe: Sqrt(number)
Retour:  Racine carree

TypeScript: Math.sqrt(n)
C#:         Math.Sqrt(n)
Python:     math.sqrt(n)
```

---

## Resume - Couverture Fonctions

| Categorie | Fonctions documentees | Coverage |
|-----------|----------------------|----------|
| Conditionnelles | IF, CASE, IN, IsNull, IsDefault, Range | 100% |
| String | 20 fonctions (Mid, Left, Right, Trim, Ins, DelStr, Flip, Soundx, Like...) | 95% |
| Conversion | Val, Str, DStr, DVal, TStr, TVal, ASCIIChr, ASCIIVal, NullVal | 95% |
| Date/Heure | 22 fonctions (Date, Time, BOM, EOM, BOY, EOY, DOW, CDOW, NDOW, CMonth, NMonth, Week, AddDate, AddTime, AddDateTime, DifDateTime, MDate, MTime...) | 98% |
| Numeriques | Round, ABS, MIN, MAX, MOD, Fix, Log, Exp, Pwr, Sqrt | 95% |
| Base de donnees | DbRecs, DbDel, DbName, Counter, EOF | 80% |
| Programme | CallProg, Prog, Level, ExpCalc | 85% |
| Systeme | GetParam, SetParam, OSEnvGet, User, INIGet, Delay, Timer | 95% |
| Fichiers | FileExist, Translate | 70% |
| I18n | MlsTrans | 100% |

**Total: 80 fonctions avec equivalences TS/C#/Python**

---

*Genere le 2026-01-11 depuis C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\*
*Mis a jour avec Batch 1 : 30 fonctions Date/Heure + Strings + Math additionnelles*
