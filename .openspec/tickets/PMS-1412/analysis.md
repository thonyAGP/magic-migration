# PMS-1412 - POS SKI: Loi japonaise impression facture obligatoire

> **Jira** : [PMS-1412](https://clubmed.atlassian.net/browse/PMS-1412)

## Contexte

| Element | Valeur |
|---------|--------|
| **Status Jira** | En cours |
| **Priorite** | Moderee |
| **Label** | PVE |
| **Reporter** | Davide Morandi |
| **Assignee** | Anthony Leberre |
| **Date creation** | 17/11/2025 |

## Demande

Au **Japon**, une loi oblige a conserver une copie des factures **en papier pendant 10 ans**.

Avec le projet **MRE** (ecrans tactiles), les clients peuvent :
- Envoyer la facture par **mail**
- **OU** imprimer les 2 copies

**DEMANDE** : Creer un **code projet** qui, si active, **imprime automatiquement** une copie signee de la facture meme si la facture est envoyee par mail.

---

## Analyse Technique

### Programmes concernes

| Projet | IDE | Nom | Role | Fichier XML |
|--------|-----|-----|------|-------------|
| **PVE** | **198** | Choice Re_Print Invoice | Interface selection impression/mail | Prg_191.xml |
| **PVE** | **199** | Edition ticket (Tva) LEX | Generateur facture/ticket | Prg_192.xml |
| **PVE** | **193** | Recherche Adresse Mail | Recherche email client | Prg_186.xml |
| **PVE** | **204** | Sauvegarder adresse mail | Sauvegarde email | Prg_197.xml |

### Flux actuel

```
[Client termine achat]
        |
        v
[PVE IDE 198 - Choice Re_Print Invoice]
        |
        v
[Choix: PRINT ou EMAIL?]
        |
    +---+---+
    |       |
    v       v
[EMAIL]   [PRINT]
    |       |
    v       v
[p.Mail=TRUE]  [p.Mail=FALSE]
    |       |
    v       v
[PVE IDE 199 - Edition ticket]
        |
        v
[IF p.Mail=TRUE: envoi email]
[IF p.Mail=FALSE: impression]
```

### Variable de controle identifiee

| Variable | Programme | Type | Role |
|----------|-----------|------|------|
| **p.Mail** | PVE IDE 199 (param 11) | Logical | Controle impression vs email |
| **v.Mail** | PVE IDE 198 (Column 30) | Logical | Decision utilisateur |
| **VI_MAIL** | GetParam() | Alpha | Parametre systeme |

### Tables concernees

| N° Table | Nom Logique | Nom Physique | Role |
|----------|-------------|--------------|------|
| **395** | factures | hpph_chrono_L | Liste factures |
| **396** | detail_client | (lien) | Info client |
| **400** | info_client | (lien) | Adresse email |

---

## Solution proposee

### Nouveau code projet

Creer un nouveau parametre dans la table des codes projet :

| Code | Nom | Valeur | Description |
|------|-----|--------|-------------|
| **PRINT_COPY_JAPAN** | Impression copie Japon | `O/N` | Si `O`, imprime une copie meme si envoi mail |

### Modification PVE IDE 199 - Edition ticket

#### Localisation

- **Programme** : PVE IDE 199 - Edition ticket (Tva) LEX
- **Fichier** : `D:\Data\Migration\XPA\PMS\PVE\Source\Prg_192.xml`

#### Variables a ajouter

| Variable | Type | Nom | Role |
|----------|------|-----|------|
| **v.PrintCopyJapan** | Logical | v.Print Copy Japan | Flag code projet actif |

#### Expression a ajouter

```magic
v.PrintCopyJapan = (GetParam('PRINT_COPY_JAPAN') = 'O')
```

#### Logique a modifier

**AVANT** (logique actuelle simplifiee) :

```
Task Prefix:
  IF p.Mail = TRUE
    → Generer PDF + Envoyer email
  ELSE
    → Imprimer directement
```

**APRES** (nouvelle logique) :

```
Task Prefix:
  IF p.Mail = TRUE
    → Generer PDF + Envoyer email
    IF v.PrintCopyJapan = TRUE
      → Imprimer AUSSI une copie
  ELSE
    → Imprimer directement
```

#### Sous-tache a modifier

| Tache | Nom | Modification |
|-------|-----|--------------|
| **199.3** | Print execution | Ajouter condition `OR v.PrintCopyJapan` pour forcer impression |

---

## Implementation pas a pas (IDE Magic)

### Etape 1 : Ajouter le code projet

1. Ouvrir **REF** > Tables de reference > Codes projet
2. Ajouter une nouvelle ligne :
   - Code : `PRINT_COPY_JAPAN`
   - Libelle : `Impression copie facture (loi Japon)`
   - Type : Alpha (O/N)
   - Valeur defaut : `N`

### Etape 2 : Modifier PVE IDE 199

#### 2.1 Ajouter variable

1. Ouvrir **PVE IDE 199** dans l'IDE Magic
2. Aller dans **Data View** (F4)
3. Ajouter une nouvelle variable virtuelle :
   - Nom : `v.Print Copy Japan`
   - Type : Logical
   - Init Expression : `GetParam('PRINT_COPY_JAPAN') = 'O'`

#### 2.2 Modifier la logique

1. Aller dans **Task Logic** (Ctrl+L)
2. Trouver le handler **Record Suffix** ou le bloc qui gere l'impression
3. Localiser la condition `IF p.Mail = FALSE` (impression)
4. Modifier la condition en :

```
IF p.Mail = FALSE OR v.Print Copy Japan = TRUE
```

**OU** ajouter un bloc supplementaire apres l'envoi mail :

```
Ligne X : IF p.Mail = TRUE AND v.Print Copy Japan = TRUE
Ligne X+1 :   Call Task → Sous-tache impression
Ligne X+2 : End Block
```

### Etape 3 : Test

1. Activer le code projet `PRINT_COPY_JAPAN = O` sur un village test
2. Faire une vente avec envoi facture par mail
3. Verifier que :
   - Email est bien envoye
   - **ET** une copie est imprimee

---

## Points d'attention

| Point | Description | Action |
|-------|-------------|--------|
| **MRE** | Le projet MRE utilise des ecrans tactiles | Verifier compatibilite |
| **Imprimante** | Doit etre configuree sur le poste | S'assurer que l'imprimante est definie |
| **Performance** | Double operation (mail + print) | Tester temps de reponse |
| **Signature** | La copie doit etre "signee" | Verifier que le PDF contient la signature |

---

## Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `PVE/Source/Prg_192.xml` | Modifier PVE IDE 199 |
| `REF/Source/DataSources.xml` | Ajouter code projet (si table dediee) |

---

## Estimation

| Tache | Effort |
|-------|--------|
| Creation code projet | 15 min |
| Modification PVE IDE 199 | 1h |
| Tests | 30 min |
| **TOTAL** | ~2h |

---

*Analyse: 2026-01-21*
*Status: PRET POUR IMPLEMENTATION*
