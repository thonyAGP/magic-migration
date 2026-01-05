# Guide Structure XML Magic Unipaas

## Vue d'ensemble

Ce document decrit la structure des fichiers XML Magic Unipaas pour permettre:
1. La documentation automatique du legacy
2. La conversion vers TypeScript/C#/Python

---

## 0. Concepts fondamentaux Magic

### 0.1 Types de taches (TaskType)

| Code | Type | Description | Interaction |
|------|------|-------------|-------------|
| **B** | Batch | Traitement par lot, parcourt tous les enregistrements | Non-interactif |
| **O** | Online | Interface utilisateur, attend les actions utilisateur | Interactif |
| **I** | Internal | Sous-programme interne | Depend du parent |

**Batch Task:**
- Parcourt automatiquement tous les enregistrements du DataView
- Execute Record Prefix/Suffix pour chaque enregistrement
- Se termine quand tous les enregistrements sont traites ou EndCondition=True
- Pas d'attente utilisateur entre les enregistrements

**Online Task:**
- Affiche un formulaire et attend l'interaction utilisateur
- L'utilisateur navigue entre les enregistrements
- Se termine quand l'utilisateur ferme ou EndCondition=True
- Cycle: affiche → attend → traite → affiche suivant

### 0.2 Cycle de vie d'une tache

```
TASK START
    │
    ▼
┌─────────────────┐
│   TASK PREFIX   │  ← Initialisation (1 fois)
│   (Type="M")    │    - Chargement parametres
└────────┬────────┘    - Init variables globales
         │
         ▼
    ┌─────────┐
    │ RECORD  │◄──────────────────────┐
    │  LOOP   │                       │
    └────┬────┘                       │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│ RECORD PREFIX   │  ← Avant chaque   │
│                 │    enregistrement │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│  RECORD MAIN    │  ← Traitement     │
│  (interaction   │    (Batch: auto)  │
│   si Online)    │    (Online: user) │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│ RECORD SUFFIX   │  ← Apres chaque   │
│   (Type="S")    │    enregistrement │
└────────┬────────┘    - Validations  │
         │             - Updates DB   │
         ▼                            │
    End Condition?────Non────────────►┘
         │
        Oui
         │
         ▼
┌─────────────────┐
│   TASK SUFFIX   │  ← Finalisation (1 fois)
│                 │    - Cleanup
└────────┬────────┘    - Commit final
         │
         ▼
    TASK END
```

### 0.3 Transactions (TransactionMode)

| Code | Mode | Comportement |
|------|------|--------------|
| **P** | Physical | Commit immediat apres chaque Record Suffix |
| **D** | Deferred | Mise en cache, commit a la fin de la tache |
| **W** | Within | Utilise la transaction du parent |
| **N** | None | Pas de transaction |

**Physical (P):**
```
Record 1 → Update → COMMIT
Record 2 → Update → COMMIT
Record 3 → Update → COMMIT
```

**Deferred (D):**
```
Record 1 → Update → (cache)
Record 2 → Update → (cache)
Record 3 → Update → (cache)
Task Suffix → COMMIT ALL
```

### 0.4 Debut de transaction (TransactionBegin)

| Code | Mode | Quand |
|------|------|-------|
| **N** | None | Pas de debut explicite |
| **L** | Lazy | Au premier acces DB |
| **T** | Task | Au debut de la tache |
| **G** | Group | Au debut du groupe |
| **B** | Before Record | Avant le record prefix |
| **O** | On Record | Au record prefix |

### 0.5 Strategie de verrouillage (LockingStrategy)

| Code | Mode | Comportement |
|------|------|--------------|
| **I** | Immediate | Verrouille des la lecture |
| **M** | On Modify | Verrouille a la premiere modification |
| **O** | On Update | Verrouille juste avant l'ecriture |
| **N** | No Lock | Pas de verrouillage |

**Immediate (I):** Securite maximale, concurrence minimale
```
READ record → LOCK → ... traitement ... → UPDATE → UNLOCK
```

**On Modify (M):** Compromis (defaut Batch)
```
READ record → ... → FIRST CHANGE → LOCK → ... → UPDATE → UNLOCK
```

**Before Update (O):** Concurrence maximale, risque de conflits
```
READ record → ... traitement ... → LOCK → UPDATE → UNLOCK
(si conflit: perte des modifications)
```

### 0.6 Tache residente (Resident)

| Valeur | Comportement |
|--------|--------------|
| **Y** | Reste en memoire apres execution |
| **N** | Dechargee apres execution |

**Resident=Y:**
- Charge une fois, reste en memoire
- Appels suivants plus rapides
- Consomme plus de RAM
- Ideal pour sous-programmes appeles frequemment

**Resident=N:**
- Charge/decharge a chaque appel
- Plus lent mais economise la memoire
- Comportement par defaut

### 0.7 Main Program

Le Main Program est une tache speciale:
- Execute au demarrage du projet
- Fonctionne comme un Batch sans source de donnees
- Ses variables racine sont **globales** (accessibles partout)
- Ne peut pas etre appele explicitement
- Quand sa EndCondition = True, le projet s'arrete

### 0.8 Cache Strategy

| Code | Mode | Description |
|------|------|-------------|
| **N** | None | Pas de cache |
| **P** | Position | Cache base sur la position |
| **T** | Table | Cache de la table entiere |
| **S** | Session | Cache pour la session |

---

## 1. Structure d'un fichier programme (Prg_XXX.xml)

```xml
<Application>
  <Header>                    <!-- Metadonnees fichier -->
    <Version val="12030"/>    <!-- Version Magic xpa -->
  </Header>

  <ProgramsRepository>
    <Programs>
      <Task MainProgram="N">  <!-- Tache principale -->
        <Header/>             <!-- Metadonnees programme -->
        <Resource/>           <!-- Variables (Columns) -->
        <Information/>        <!-- Config DataView -->
        <TaskLogic/>          <!-- Logique metier -->
        <TaskForms/>          <!-- UI (optionnel) -->
        <Expressions/>        <!-- Formules -->

        <Task>                <!-- Sous-tache imbriquee -->
          ...
        </Task>
      </Task>
    </Programs>
  </ProgramsRepository>
</Application>
```

---

## 2. Header du programme

```xml
<Header Description="Ouverture caisse" id="122" LastIsn="9">
  <TaskType val="B"/>           <!-- B=Batch, O=Online, I=Internal -->
  <TSK_PARAMS val="15"/>        <!-- Nombre de parametres -->
  <ParametersCount val="15"/>
  <ParametersAttributes>
    <Attr MgAttr="A"/>          <!-- A=Alpha, N=Numeric, D=Date, B=Boolean, T=Time, U=Unicode -->
    <Attr MgAttr="N"/>
    ...
  </ParametersAttributes>
  <Public val="NOM_PUBLIC"/>    <!-- Nom pour appel externe (optionnel) -->
</Header>
```

### Types MgAttr
| Code | Type | TypeScript | C# | Python |
|------|------|------------|-----|--------|
| A | Alpha | string | string | str |
| U | Unicode | string | string | str |
| N | Numeric | number | decimal | Decimal |
| D | Date | Date | DateOnly | date |
| T | Time | Date | TimeOnly | time |
| B | Boolean/Logical | boolean | bool | bool |
| O | BLOB | Uint8Array | byte[] | bytes |

---

## 3. Resource (Variables)

```xml
<Resource>
  <Columns>
    <Column id="57" name="Param societe">
      <PropertyList model="FIELD">
        <Model attr_obj="FIELD_ALPHA" id="1"/>
        <Picture id="157" valUnicode="U"/>      <!-- Format affichage -->
        <Size id="174" val="1"/>                <!-- Taille -->
        <Definition id="175" val="2"/>          <!-- 2=Parameter -->
        <NullValue id="167"/>                   <!-- Valeur nulle -->
        <Range id="98" valUnicode="Oui,Non"/>   <!-- Valeurs possibles -->
      </PropertyList>
    </Column>
  </Columns>
</Resource>
```

### Identification des parametres
- `Definition val="2"` = Parametre d'entree
- Position dans la liste = ordre du parametre
- Convention de nommage: prefixe "Param", "p.i.", "P."

### Types de champs (attr_obj)
| attr_obj | Type |
|----------|------|
| FIELD_ALPHA | String (ANSI) |
| FIELD_UNICODE | String (Unicode) |
| FIELD_NUMERIC | Number |
| FIELD_DATE | Date |
| FIELD_TIME | Time |
| FIELD_LOGICAL | Boolean |
| FIELD_BLOB | Binary |

---

## 4. Information (DataView)

```xml
<Information>
  <Key>
    <Mode val="N"/>             <!-- N=None, U=Unique -->
  </Key>
  <DB comp="4" obj="232"/>      <!-- Table principale (comp=composant, obj=id table) -->
  <InitialMode val="M"/>        <!-- M=Modify, C=Create, Q=Query -->
  <EndTaskCondition Exp="4"/>   <!-- Condition de fin (ref expression) -->
  <TaskProperties>
    <TransactionMode val="P"/>  <!-- P=Physical, D=Deferred, N=None -->
  </TaskProperties>
</Information>
```

### References aux tables
- `comp="-1"` = Pas de table (tache sans DataView)
- `comp="4"` = Composant REF (tables partagees)
- `obj="XXX"` = ID de la table dans le composant

---

## 5. TaskLogic (Logique metier)

```xml
<TaskLogic>
  <LogicUnit id="2" propagate="78">
    <Level val="R"/>            <!-- R=Record, T=Task, G=Group -->
    <Type val="M"/>             <!-- M=Main(Prefix), S=Suffix, P=Prefix -->
    <Event>
      <EventType val="S"/>      <!-- S=System, U=User, I=Internal -->
    </Event>
    <LogicLines>
      <!-- Operations -->
    </LogicLines>
  </LogicUnit>
</TaskLogic>
```

### Types de LogicUnit (handlers)

**Level (niveau) :**
| Level | Description |
|-------|-------------|
| R | Record - exécuté par enregistrement |
| T | Task - exécuté une fois par tâche |
| G | Group - rupture de groupe (Batch) |
| H | Handler - gestionnaire d'événement |

**Type (moment dans le niveau) :**
| Level | Type | Description IDE |
|-------|------|-----------------|
| T | P | Task Prefix (init tâche) |
| T | S | Task Suffix (fin tâche) |
| R | P | Record Prefix (avant record) |
| R | M | Record Main (traitement) |
| R | S | Record Suffix (après record) |
| G | P | Group Prefix (en-tête) |
| G | S | Group Suffix (pied) |

**Source:** [Logic Units (Magic xpa)](https://kb.magicsoftware.com/articles/Knowledge/Logic-Units-xpa)

---

## 6. Operations (LogicLines)

### 6.1 Update (affectation)
```xml
<Update FlowIsn="80">
  <FieldID val="18"/>           <!-- Variable cible (Column id) -->
  <WithValue val="3"/>          <!-- Expression source (id) -->
  <Condition val="Y"/>          <!-- Y=toujours, Exp="X"=conditionnel -->
</Update>
```

**Conversion TypeScript:**
```typescript
// WithValue="3" reference Expression id="3"
variable18 = expression3Result;
```

### 6.2 Block (IF/ELSE)
```xml
<BLOCK EndBlock="84" Type="I">  <!-- I=If, E=Else -->
  <Condition Exp="5"/>          <!-- Si expression #5 vraie -->
</BLOCK>
<!-- ... code du bloc ... -->
<EndBlock FlowIsn="84"/>
```

**Conversion TypeScript:**
```typescript
if (expression5Result) {
  // code du bloc
}
```

### 6.3 CallTask (appel programme)
```xml
<CallTask FlowIsn="83">
  <OperationType val="P"/>      <!-- P=Programme, T=Task interne -->
  <TaskID comp="-1" obj="139"/> <!-- Programme 139 local -->
  <Arguments>
    <Argument>
      <id val="1"/>
      <Variable val="1"/>       <!-- Passe variable #1 -->
      <Skip val="N"/>           <!-- N=passer, Y=ignorer -->
    </Argument>
    <Argument>
      <id val="10"/>
      <Expression val="7"/>     <!-- Passe resultat expression #7 -->
    </Argument>
  </Arguments>
  <Condition Exp="8"/>          <!-- Condition d'execution -->
  <Wait val="Y"/>               <!-- Attendre fin -->
</CallTask>
```

**Conversion TypeScript:**
```typescript
if (expression8Result) {
  await ticketApproRemise(variable1, variable3, ..., expression7Result, ...);
}
```

### 6.4 Select (lecture variable DataView)
```xml
<Select FieldID="1" id="1">
  <Column val="1"/>             <!-- Colonne de la table -->
  <Type val="V"/>               <!-- V=Virtual, R=Real -->
  <IsParameter val="Y"/>        <!-- Est un parametre -->
</Select>
```

### 6.5 Remark (commentaire)
```xml
<Remark FlowIsn="81">
  <Type val="2"/>
  <Text val="edition ticket appro"/>
</Remark>
```

---

## 7. Expressions

```xml
<Expressions>
  <Expression id="1">
    <ExpSyntax val="{0,17}=0"/>
    <ExpAttribute val="B"/>     <!-- Type retour: B=Bool, N=Num, A=Alpha -->
  </Expression>
</Expressions>
```

### Syntaxe des expressions

| Pattern | Signification | Exemple |
|---------|---------------|---------|
| `{0,X}` | Variable #X de tache courante | `{0,17}` = var17 |
| `{1,X}` | Variable #X de tache parente | `{1,5}` = parent.var5 |
| `{C,X}` | Colonne #X du DataView | `{C,3}` = table.col3 |
| `'text'` | Constante string | `'O'` |
| `'TRUE'LOG` | Constante booleen | TRUE |
| `123` | Constante numerique | 123 |
| `=, <>, <, >, <=, >=` | Comparaison | `{0,1}=0` |
| `AND, OR, NOT` | Logique | `{0,1} AND {0,2}` |
| `+, -, *, /` | Arithmetique | `{0,1}+{0,2}` |

### Fonctions Magic courantes

| Fonction Magic | TypeScript |
|----------------|------------|
| `Trim({0,1})` | `var1.trim()` |
| `Len({0,1})` | `var1.length` |
| `Val({0,1})` | `parseFloat(var1)` |
| `Str({0,1},'format')` | `var1.toFixed()` |
| `Date({0,1})` | `new Date(var1)` |
| `Today()` | `new Date()` |
| `Time()` | `new Date()` |
| `User()` | `getCurrentUser()` |
| `Null({0,1})` | `var1 === null` |

---

## 8. Sous-taches (Tasks imbriquees)

Une tache peut contenir des sous-taches avec leur propre:
- Resource (variables locales)
- Information (DataView)
- TaskLogic (logique)
- Expressions

```xml
<Task MainProgram="N">
  <!-- Tache principale ISN_2="1" -->
  <Header ISN_2="1"/>
  ...

  <Task MainProgram="N">
    <!-- Sous-tache ISN_2="2" -->
    <Header ISN_2="2"/>
    ...
  </Task>
</Task>
```

Les sous-taches heritent des variables parentes via `{1,X}`.

---

## 9. Mapping Tables (Composants)

### Dans Comps.xml
```xml
<ComponentDataObjects>
  <Object>
    <id val="246"/>              <!-- ID interne composant -->
    <ItemIsn val="246"/>         <!-- ID dans DataSources.xml -->
    <PublicName val="caisse_session01"/>
  </Object>
</ComponentDataObjects>
```

### Dans DataSources.xml (REF)
```xml
<DataObject PhysicalName="caisse_session" id="246" name="histo_sessions_caisse">
  <Columns>
    <Column id="1" name="utilisateur">
      <PropertyList>
        <Model attr_obj="FIELD_UNICODE"/>
        <Size id="174" val="16"/>
      </PropertyList>
    </Column>
  </Columns>
  <Indexes>
    <Index id="1" name="caisse_session_IDX_1">
      <Segments>
        <Segment><Column val="1"/></Segment>
      </Segments>
    </Index>
  </Indexes>
</DataObject>
```

---

## 10. Exemple de conversion complete

### XML Magic (simplifie)
```xml
<Task>
  <Header Description="Calcul total" id="100">
    <TSK_PARAMS val="2"/>
    <ParametersAttributes>
      <Attr MgAttr="N"/>  <!-- montant -->
      <Attr MgAttr="N"/>  <!-- taux -->
    </ParametersAttributes>
  </Header>

  <Resource>
    <Column id="1" name="P montant"/>
    <Column id="2" name="P taux"/>
    <Column id="3" name="V resultat"/>
  </Resource>

  <TaskLogic>
    <LogicUnit Type="M">
      <LogicLines>
        <Update>
          <FieldID val="3"/>
          <WithValue val="1"/>
        </Update>
      </LogicLines>
    </LogicUnit>
  </TaskLogic>

  <Expressions>
    <Expression id="1">
      <ExpSyntax val="{0,1}*{0,2}/100"/>
    </Expression>
  </Expressions>
</Task>
```

### TypeScript
```typescript
interface CalculTotalParams {
  montant: number;
  taux: number;
}

function calculTotal(params: CalculTotalParams): number {
  const { montant, taux } = params;
  const resultat = montant * taux / 100;
  return resultat;
}
```

### C#
```csharp
public decimal CalculTotal(decimal montant, decimal taux)
{
    var resultat = montant * taux / 100m;
    return resultat;
}
```

---

*Document technique - Migration Magic Unipaas*
*Derniere MAJ: 2025-12-24*
