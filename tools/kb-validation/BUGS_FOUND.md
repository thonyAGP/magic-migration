# Bugs Identifiés dans les Parsers KB

## Bug 1: Expressions non parsées (CRITIQUE)

**Fichier**: `MagicKnowledgeBase/Indexing/ProgramParser.cs`
**Lignes**: 468, 480

### Problème
```csharp
// Ligne 468 - Mauvais nom d'élément
var expressions = exprsElement.Elements("Exp").ToList();  // BUGGY

// Ligne 480 - Mauvaise extraction du contenu
Content = expr.Value ?? "",  // BUGGY
```

### Structure XML réelle
```xml
<Expressions>
  <Expression id="1">
    <ExpSyntax val="{0,1}=''"/>
    <ExpAttribute val="B"/>
  </Expression>
</Expressions>
```

### Correction
```csharp
// Ligne 468
var expressions = exprsElement.Elements("Expression").ToList();

// Ligne 480
Content = expr.Element("ExpSyntax")?.Attribute("val")?.Value ?? "",
Comment = expr.Element("Remark")?.Attribute("val")?.Value  // si existe
```

---

## Bug 2: Program Calls non détectés (CRITIQUE)

**Fichier**: `MagicKnowledgeBase/Indexing/ProgramParser.cs`
**Lignes**: 378-404

### Problème
```csharp
// Cherche "Call" avec <DB>
if (opName == "Call")
{
    var callDb = operation.Element("DB");  // N'existe pas
```

### Structure XML réelle
```xml
<LogicLine>
  <CallTask FlowIsn="51">
    <OperationType val="P"/>           <!-- P=Program, T=Task -->
    <TaskID comp="-1" obj="181"/>      <!-- comp=-1=local, obj=XmlId -->
    <Arguments>...</Arguments>
  </CallTask>
</LogicLine>
```

### Correction
```csharp
// Chercher CallTask avec OperationType="P"
if (opName == "CallTask")
{
    var opType = operation.Element("OperationType")?.Attribute("val")?.Value;
    if (opType == "P")  // Only program calls, not subtask calls
    {
        var taskId = operation.Element("TaskID");
        if (taskId != null)
        {
            var compAttr = taskId.Attribute("comp")?.Value ?? "-1";
            var objAttr = taskId.Attribute("obj")?.Value;

            if (int.TryParse(objAttr, out int targetPrgId))
            {
                // comp="-1" means same project
                var targetProject = compAttr == "-1" ? projectName : $"Comp{compAttr}";
                var argCount = operation.Element("Arguments")?.Elements("Arg").Count() ?? 0;

                calls.Add(new ParsedProgramCall
                {
                    LineNumber = lineNum,
                    TargetProject = targetProject,
                    TargetProgramXmlId = targetPrgId,
                    ArgCount = argCount
                });
            }
        }
    }
}
```

---

## Bug 3: Table Names non résolus (MINEUR)

### Problème
Les `table_usage` ont `table_name = NULL` car le nom n'est pas joint depuis la table `tables`.

### Observation
```
| Task | Type   | Table ID | Table Name       | Link# |
|------|--------|----------|------------------|-------|
|   69 | READ   |       47 |                  |     - |
```

### Correction suggérée
Faire une jointure avec la table `tables` lors du requêtage ou stocker le nom au moment de l'indexation.

---

## Tests de validation suggérés

### Test 1: Expressions
```bash
dotnet run -- expressions ADH 69
# Attendu: ~30 expressions
# Actuel: 0
```

### Test 2: Program Calls
```bash
dotnet run -- calls ADH 69
# Attendu: ~4+ appels (vers ADH 181, 71, 43, 44)
# Actuel: 0
```

### Test 3: Comparaison XML complète
```bash
dotnet run -- compare-xml ADH 69
# Vérifier match Tasks, Expressions, Columns, Logic, Calls
```

---

## Captures d'écran IDE nécessaires

Pour valider complètement, fournir captures de l'IDE Magic pour ADH IDE 69:

1. **Onglet Expressions** - Liste complète avec numéros IDE
2. **Logic Handler RM** - Lignes avec CallTask vers programmes
3. **Program Properties** - Nom public, nombre tâches

---

## Priorité de correction

| Bug | Impact | Effort | Priorité |
|-----|--------|--------|----------|
| Expressions | 0 indexées sur ~200K | 5 min | P0 |
| Program Calls | 0 résolus, pas de call graph | 15 min | P0 |
| Table Names | Affichage seulement | 5 min | P2 |
