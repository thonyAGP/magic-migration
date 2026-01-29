# Pipeline V5.0 - Plan d'Amélioration

> **Date**: 2026-01-28
> **Objectif**: Corriger les régressions identifiées par comparaison V3.4/V3.5 vs V5.0
> **Programme test**: ADH IDE 237 - Transaction Nouv vente avec GP

---

## 1. RÉGRESSIONS CRITIQUES

### 1.1 Tables avec noms génériques (Table_XXX)

**Problème**: V5.0 affiche `Table_103`, `Table_70` au lieu de `cafil001_dat`, `prestations`

**Cause racine**: Le pipeline ne résout pas les noms de tables depuis REF.ecf

**Solution**:

```powershell
# Phase2-Mapping.ps1 - Ajouter résolution noms tables

function Resolve-TableName {
    param(
        [int]$TableId,
        [string]$Project
    )

    # 1. Chercher dans Tables.xml du projet
    $TablesPath = "D:\Data\Migration\XPA\PMS\REF\Source\Tables.xml"

    if (Test-Path $TablesPath) {
        [xml]$TablesXml = Get-Content $TablesPath -Encoding UTF8 -Raw
        $Table = $TablesXml.SelectSingleNode("//Table[@isn='$TableId']")

        if ($Table) {
            return @{
                PhysicalName = $Table.DBITableNam
                LogicalName  = $Table.nam
                Columns      = @($Table.Columns.Column | ForEach-Object { $_.nam })
            }
        }
    }

    # 2. Fallback: Query KB si disponible
    # sqlite3 ~/.magic-kb/knowledge.db "SELECT physical_name FROM tables WHERE table_id=$TableId"

    return @{ PhysicalName = "Table_$TableId"; LogicalName = "" }
}
```

**Fichiers à modifier**:
- `Phase2-Mapping.ps1`: Ajouter fonction `Resolve-TableName`
- Créer `utils/Table-Resolver.ps1` pour centraliser la logique

**Priorité**: P0 - CRITIQUE

---

### 1.2 Tables WRITE non identifiées (0 vs 9)

**Problème**: V5.0 montre 0 tables en écriture, V3.4 en montre 9

**Cause racine**: Le mode d'accès (access="W") n'est pas extrait correctement

**Solution**:

```powershell
# Phase2-Mapping.ps1 - Corriger extraction access mode

foreach ($DB in $DBList) {
    $AccessMode = "READ"  # Défaut

    # Chercher l'attribut access dans DataObject ou DB
    if ($DB.DataObject.access) {
        $AccessMode = switch ($DB.DataObject.access) {
            "W" { "WRITE" }
            "L" { "LINK" }
            "R" { "READ" }
            default { "READ" }
        }
    }

    # Aussi vérifier les opérations dans la logique
    # UPDATE/INSERT/DELETE = WRITE implicite
    $TaskLogic = $Task.Logic.LogicUnit
    if ($TaskLogic -match "Update|Insert|Delete") {
        $AccessMode = "WRITE"
    }

    $Tables += @{
        Id = $TableId
        AccessMode = $AccessMode
        # ...
    }
}
```

**Priorité**: P0 - CRITIQUE

---

### 1.3 Expressions non extraites (0 vs 849)

**Problème**: V5.0 n'extrait aucune expression, V3.4 en a 849

**Cause racine**: Phase3-Decode.ps1 ne parse pas les expressions du XML

**Solution**:

```powershell
# Phase3-Decode.ps1 - Ajouter extraction expressions

function Extract-Expressions {
    param(
        [xml]$Xml,
        [string]$Project,
        [int]$IdePosition
    )

    $Expressions = @()

    # 1. Expressions dans les conditions (exp attribute)
    $CondNodes = $Xml.SelectNodes("//*[@exp]")
    foreach ($Node in $CondNodes) {
        $ExpId = $Node.exp
        if ($ExpId -and $ExpId -ne "0") {
            $Expressions += @{
                Id = [int]$ExpId
                Context = $Node.LocalName
                TaskISN = $Node.ParentNode.isn2
                Raw = $null  # À décoder
            }
        }
    }

    # 2. Expressions dans les LogicLines
    $LogicLines = $Xml.SelectNodes("//LogicLine")
    foreach ($Line in $LogicLines) {
        # Attributs contenant des expressions: exp, cnd, args, etc.
        foreach ($Attr in @("exp", "cnd", "val", "args")) {
            $Value = $Line.GetAttribute($Attr)
            if ($Value -match '\{(\d+),') {
                # Pattern {N,Y} détecté
                $ExpId = [int]$Matches[1]
                $Expressions += @{
                    Id = $ExpId
                    Context = "LogicLine.$Attr"
                    LineId = $Line.id
                    Raw = $Value
                }
            }
        }
    }

    return $Expressions | Sort-Object Id -Unique
}
```

**Priorité**: P0 - CRITIQUE

---

### 1.4 Call Graph vide (0 callers/callees vs 2/2)

**Problème**: V5.0 montre ORPHELIN alors que le programme a 2 callers et 2 callees

**Cause racine**: Pas de requête KB pour callers/callees

**Solution**:

```powershell
# Phase1-Discovery.ps1 - Ajouter requêtes KB

function Get-CallGraph {
    param(
        [string]$Project,
        [int]$IdePosition
    )

    $Result = @{
        Callers = @()
        Callees = @()
        ChainFromMain = @()
        IsOrphan = $true
    }

    # Option 1: Via MCP (préféré)
    # magic_kb_callers, magic_kb_callees, magic_kb_callgraph

    # Option 2: Query KB directe
    $KbPath = "$env:USERPROFILE\.magic-kb\knowledge.db"

    if (Test-Path $KbPath) {
        # Callers
        $CallerQuery = @"
SELECT DISTINCT caller_project, caller_program_id, caller_name
FROM program_calls
WHERE callee_project = '$Project' AND callee_program_id = $IdePosition
"@
        $Callers = sqlite3 $KbPath $CallerQuery

        # Callees
        $CalleeQuery = @"
SELECT DISTINCT callee_project, callee_program_id, callee_name
FROM program_calls
WHERE caller_project = '$Project' AND caller_program_id = $IdePosition
"@
        $Callees = sqlite3 $KbPath $CalleeQuery

        $Result.Callers = $Callers
        $Result.Callees = $Callees
        $Result.IsOrphan = ($Callers.Count -eq 0)
    }

    return $Result
}
```

**Dépendance**: sqlite3 doit être dans PATH

**Priorité**: P0 - CRITIQUE

---

## 2. RÉGRESSIONS MAJEURES

### 2.1 Algorigramme trop simple (START→END)

**Problème**: V5.0 génère un algorigramme vide, V3.4 montre le flux Gift Pass complet

**Cause racine**: Phase4-Synthesis ne construit pas le flux depuis la logique

**Solution**:

```powershell
# Phase4-Synthesis.ps1 - Générer algorigramme depuis flux

function Build-Flowchart {
    param($Discovery, $Mapping, $Decoded)

    $Nodes = @()
    $Edges = @()

    # START
    $Nodes += "START([START - $($Discovery.Identification.ParameterCount) params])"

    # Analyser les tâches principales
    foreach ($Task in $Discovery.TaskStructure.Tasks | Where-Object { $_.Level -eq 1 }) {
        $TaskName = $Task.Name -replace '[^a-zA-Z0-9]', ''
        $NodeId = "T$($Task.TaskNumber)"

        if ($Task.IsDisabled) {
            continue  # Ignorer tâches désactivées
        }

        # Détecter le type de noeud
        if ($Task.Name -match 'IF|Condition|Test') {
            $Nodes += "$NodeId{$($Task.Name)}"
        } else {
            $Nodes += "$NodeId[$($Task.Name)]"
        }
    }

    # Construire les edges depuis les CallTask/CallProgram
    foreach ($Callee in $Decoded.Callees) {
        $Edges += "T$($Callee.FromTask) --> T$($Callee.ToTask)"
    }

    # END
    $Nodes += "ENDOK([END])"

    # Générer Mermaid
    $Mermaid = @"
flowchart TD
    $($Nodes -join "`n    ")
    $($Edges -join "`n    ")

    style START fill:#3fb950
    style ENDOK fill:#f85149
"@

    return $Mermaid
}
```

**Priorité**: P1 - MAJEUR

---

### 2.2 Règles métier génériques (1 vs 6)

**Problème**: V5.0 a une seule règle générique, V3.4 a 6 règles détaillées

**Cause racine**: Les règles métier ne sont pas extraites depuis les conditions IF/CASE

**Solution**:

```powershell
# Phase3-Decode.ps1 - Extraire règles métier

function Extract-BusinessRules {
    param($Expressions, $Xml)

    $Rules = @()
    $RuleIndex = 1

    # Chercher les conditions IF significatives
    $IfConditions = $Expressions | Where-Object {
        $_.Context -match 'cnd|Condition' -and
        $_.Decoded -notmatch '^\s*0\s*$'  # Ignorer conditions mortes
    }

    foreach ($Cond in $IfConditions) {
        # Analyser la condition décodée
        $DecodedExpr = $Cond.Decoded

        # Pattern matching pour règles courantes
        if ($DecodedExpr -match 'Variable\s+(\w+)\s*(=|<>|>|<)') {
            $Rules += @{
                Code = "RM-$('{0:D3}' -f $RuleIndex)"
                Rule = "Vérification $($Matches[1])"
                Condition = $DecodedExpr
                TaskRef = "Tâche $($Cond.TaskNumber)"
            }
            $RuleIndex++
        }
    }

    return $Rules
}
```

**Priorité**: P1 - MAJEUR

---

### 2.3 Variables non mappées

**Problème**: V5.0 n'a pas de section variables, V3.5 a 171 variables mappées

**Cause racine**: Les colonnes DataView ne sont pas extraites avec leurs noms

**Solution**:

```powershell
# Phase2-Mapping.ps1 - Ajouter section variables

function Extract-Variables {
    param([xml]$Xml, $Discovery)

    $Variables = @{
        WorkVariables = @()   # W0*, V0*
        GlobalVariables = @() # VG*
        TableColumns = @()    # Colonnes tables
        Parameters = @()      # Paramètres
    }

    # Parcourir toutes les tâches
    foreach ($Task in $Discovery.TaskStructure.Tasks) {
        $TaskXml = $Xml.SelectSingleNode("//Task[@isn2='$($Task.ISN2)']")
        $DataView = $TaskXml.DataView

        if ($DataView -and $DataView.Column) {
            $FieldIndex = 1
            foreach ($Col in $DataView.Column) {
                $Letter = Convert-FieldToLetter $FieldIndex
                $VarName = $Col.nam

                # Catégoriser
                if ($VarName -match '^W0|^V0') {
                    $Variables.WorkVariables += @{
                        Letter = $Letter
                        Name = $VarName
                        Type = $Col.pic
                        Task = $Task.TaskNumber
                    }
                }
                elseif ($VarName -match '^VG') {
                    $Variables.GlobalVariables += @{
                        Letter = $Letter
                        Name = $VarName
                        Type = $Col.pic
                    }
                }

                $FieldIndex++
            }
        }
    }

    return $Variables
}
```

**Priorité**: P1 - MAJEUR

---

## 3. RÉGRESSIONS MINEURES

### 3.1 Paramètres sans direction IN/OUT

**Problème**: V5.0 liste les paramètres mais pas leur direction

**Solution**:

```powershell
# Phase2-Mapping.ps1 - Ajouter direction paramètres

# L'attribut 'par' indique la direction:
# par="I" = IN
# par="O" = OUT
# par="IO" = IN/OUT
# par="" ou absent = IN (défaut)

foreach ($Col in $FirstTaskDataView.Column) {
    if ($Col.cls -eq "P") {  # P = Parameter
        $Direction = switch ($Col.par) {
            "I"  { "IN" }
            "O"  { "OUT" }
            "IO" { "IN/OUT" }
            default { "IN" }
        }

        $Parameters += @{
            Letter = Convert-FieldToLetter $Index
            Name = $Col.nam
            Type = Get-MagicType $Col.pic
            Direction = $Direction
            Picture = $Col.pic
        }
    }
}
```

**Priorité**: P2 - MINEUR

---

## 4. AMÉLIORATIONS V5.0 (à conserver)

| Feature V5.0 | Description | Garder |
|--------------|-------------|--------|
| Pipeline 4-Phase | Structure claire Discovery→Mapping→Decode→Synthesis | OUI |
| Fichiers JSON intermédiaires | Debugging et traçabilité | OUI |
| Comptage automatique | Tasks, Lines, Expressions | OUI |
| Format Markdown 3 onglets | Structure spec standardisée | OUI |

---

## 5. PLAN D'EXÉCUTION

### Phase 1: Pré-requis (30 min)

| Tâche | Script | Priorité |
|-------|--------|----------|
| Installer sqlite3 dans PATH | Manuel | P0 |
| Créer `utils/Table-Resolver.ps1` | Nouveau | P0 |
| Créer `utils/KB-Query.ps1` | Nouveau | P0 |

### Phase 2: Corrections critiques (2h)

| Tâche | Script | Priorité |
|-------|--------|----------|
| Résolution noms tables | Phase2-Mapping.ps1 | P0 |
| Extraction access mode WRITE | Phase2-Mapping.ps1 | P0 |
| Extraction expressions | Phase3-Decode.ps1 | P0 |
| Call graph via KB | Phase1-Discovery.ps1 | P0 |

### Phase 3: Corrections majeures (2h)

| Tâche | Script | Priorité |
|-------|--------|----------|
| Algorigramme détaillé | Phase4-Synthesis.ps1 | P1 |
| Règles métier | Phase3-Decode.ps1 | P1 |
| Section variables | Phase2-Mapping.ps1 | P1 |

### Phase 4: Finitions (1h)

| Tâche | Script | Priorité |
|-------|--------|----------|
| Direction paramètres | Phase2-Mapping.ps1 | P2 |
| Tests validation | test-pipeline-v50.ps1 | P2 |

---

## 6. CRITÈRES DE SUCCÈS

Après implémentation, ADH IDE 237 doit afficher:

| Critère | Cible |
|---------|-------|
| Tables | 30 avec noms réels (cafil001_dat, etc.) |
| Tables WRITE | 9 identifiées |
| Expressions | 849+ avec décodage |
| Callers | 2 (IDE 166, 242) |
| Callees | 2 (IDE 229, 236) |
| Statut | NON ORPHELIN |
| Règles métier | 6+ (RM-001 à RM-006) |
| Variables | 171+ mappées |

---

## 7. TESTS VALIDATION

```powershell
# test-pipeline-improvements.ps1

Describe "Pipeline V5.0 Improvements" {

    Context "ADH IDE 237 - Tables" {
        It "Should have 30 tables with real names" {
            $Spec = Get-Content ".openspec/specs/ADH-IDE-237.md" -Raw
            $Spec | Should -Match "cafil001_dat"
            $Spec | Should -Match "prestations"
            $Spec | Should -Not -Match "Table_103"
        }

        It "Should have 9 tables in WRITE mode" {
            $Spec | Should -Match "\*\*WRITE\*\*.*9"
        }
    }

    Context "ADH IDE 237 - Expressions" {
        It "Should have 849+ expressions" {
            $Spec | Should -Match "849"
        }
    }

    Context "ADH IDE 237 - Call Graph" {
        It "Should NOT be orphan" {
            $Spec | Should -Match "NON ORPHELIN"
            $Spec | Should -Not -Match "ORPHELIN CONFIRME"
        }

        It "Should have 2 callers" {
            $Spec | Should -Match "IDE 166"
            $Spec | Should -Match "IDE 242"
        }
    }
}
```

---

*Document créé: 2026-01-28*
*Basé sur: Comparaison V3.4/V3.5/V5.0 de ADH-IDE-237.md*
