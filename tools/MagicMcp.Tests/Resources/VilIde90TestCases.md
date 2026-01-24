# VIL IDE 90 (Prg_348) Test Cases for Variable Offset Calculation

## Screenshots Reference
Source: User-provided IDE screenshots (2026-01-24)

## Confirmed Test Cases

### Task 90.4.4 - Saisie sans PU (ISN_2=21)
- **DataView**: 5 Virtual variables
  1. param_montant
  2. param_ordre
  3. param_type
  4. param_libelle
  5. FinSansPu
- **First Variable**: EP (index 119)
- **Offset**: 119
- **MainSource**: comp=2 obj=55, **Access=R**

### Task 90.4.4.1 - Pilotage (ISN_2=22)
- **DataView**: 4 Virtual variables
  1. FinSaisieDemandee
  2. AbandonDemande
  3. EffaceToutDemande
  4. TOTAL
- **First Variable**: EU (index 124)
- **Offset**: 124
- **MainSource**: comp=2 obj=55, **Access=R**

### Task 90.4.4.1.2.3.2 - BI (ISN_2=32)
- **First Variable**: Expected at index 128
- **Offset**: 128
- **Variable at position 5**: FC (index 132)
- **MainSource**: comp=2 obj=140, **Access=R**

## Confirmed Formula (VALIDATED 2026-01-24)

```
Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING those with Access=W)
```

### Key Discovery: Access Mode Matters!

| Task | Selects | MainSource | Access | Contribution |
|------|---------|------------|--------|--------------|
| ISN_2=1 | 36 | None | - | +36 |
| ISN_2=15 | 31 | comp=2 | **R** | +31 |
| ISN_2=21 | 5 | comp=2 | **R** | +5 |
| ISN_2=22 | 4 | comp=2 | **R** | +4 |
| ISN_2=24 | 7 | comp=2 | **W** | **+0 (SKIP)** |
| ISN_2=30 | 0 | comp=2 | **W** | **+0 (SKIP)** |
| ISN_2=32 | TARGET | comp=2 | R | - |

**Total: 52 + 36 + 31 + 5 + 4 + 0 + 0 = 128** ✓

## Offset Calculation Breakdown

```
Offset(90.4.4) = 119
  = 52 (Main VG from Prg_1.xml)
  + 36 (ISN_2=1 "Saisie contenu caisse" - no MainSource)
  + 31 (ISN_2=15 "Saisie contenu caisse" - Access=R)

Offset(90.4.4.1) = 124
  = Offset(90.4.4) + Selects(90.4.4)
  = 119 + 5

Offset(BI) = 128
  = Offset(90.4.4.1) + Selects(90.4.4.1)
  = 124 + 4
  (ISN_2=24 with Access=W is SKIPPED)
```

## Variable Index to Letter Conversion

| Index Range | Formula | Example |
|-------------|---------|---------|
| 0-25 | A-Z | 0→A, 25→Z |
| 26-701 | first=index/26, second=index%26 | 119→EP, 124→EU, 128→DY, 132→FC |

### Verification

- EP: E=4, P=15 → 4*26+15 = 119 ✓
- EU: E=4, U=20 → 4*26+20 = 124 ✓
- FC: F=5, C=2 → 5*26+2 = 132 ✓

## Key Observations

1. **Access=R (Read)**: Task's Selects contribute to offset
2. **Access=W (Write)**: Task's Selects are SKIPPED (table-bound variables)
3. **No MainSource**: All Selects contribute
4. Variable names use BA-BZ after Z (not AA-AZ!)
5. Separator lines "-------- TaskName --------" mark variable boundaries

## Task Hierarchy with Access Modes

```
Saisie contenu caisse (90, ISN_2=1) [No MainSource]
├── Saisie contenu caisse (90.4, ISN_2=15) [Access=R]
│   └── Saisie sans PU (90.4.4, ISN_2=21) [Access=R]
│       └── Pilotage (90.4.4.1, ISN_2=22) [Access=R]
│           └── Saisie (90.4.4.1.2, ISN_2=24) [Access=W ⚠️ SKIP]
│               └── Zoom Mop (90.4.4.1.2.3, ISN_2=30) [Access=W ⚠️ SKIP]
│                   └── BI (90.4.4.1.2.3.2, ISN_2=32) [Access=R]
```

## Control Tests

See `VilOffsetControlTests.cs` for automated validation:
- `Task90_4_4_SaisieSansPu_Offset_ShouldBe_119` ✓
- `Task90_4_4_1_Pilotage_Offset_ShouldBe_124` ✓
- `Task90_4_4_1_2_3_2_BI_Offset_ShouldBe_128` ✓
- `Task32_Position5_Variable_ShouldBe_FC_Index132` ✓
- `TaskWithMainSourceWriteAccess_ShouldNotContributeToOffset` ✓
- `FullOffsetFormula_DetailedBreakdown` ✓

---
*Created: 2026-01-24*
*Updated: 2026-01-24 - Confirmed formula with Access=W exclusion*
