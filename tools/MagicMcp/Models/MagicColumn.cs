namespace MagicMcp.Models;

/// <summary>
/// Represents a column in Magic DataView (variables A, B, C, etc.)
/// </summary>
public class MagicColumn
{
    /// <summary>Line number in IDE (1-based)</summary>
    public required int LineNumber { get; init; }

    /// <summary>Internal XML id</summary>
    public required int XmlId { get; init; }

    /// <summary>Variable letter (A, B, ..., Z, AA, AB, etc.)</summary>
    public required string Variable { get; init; }

    /// <summary>Column name from XML</summary>
    public required string Name { get; init; }

    /// <summary>Data type (ALPHA, NUMERIC, DATE, TIME, LOGICAL, BLOB)</summary>
    public required string DataType { get; init; }

    /// <summary>Picture format</summary>
    public string? Picture { get; init; }

    /// <summary>Column definition: Real (R), Virtual (V), Parameter (P)</summary>
    public string Definition { get; init; } = "V";

    /// <summary>Source: MainSource (M) or Link number (L1, L2, etc.)</summary>
    public string? Source { get; init; }

    /// <summary>Column number in source table (if Real)</summary>
    public int? SourceColumnNumber { get; init; }

    /// <summary>Locate expression ID (if any)</summary>
    public int? LocateExpressionId { get; init; }

    /// <summary>
    /// Convert 0-based index to Magic variable letter(s).
    /// Pattern: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), DA-DZ (78-103), EA-EZ (104-129), FA-FZ (130-155), etc.
    /// Note: After Z comes BA (not AA) - this is the Magic IDE convention.
    /// </summary>
    public static string IndexToVariable(int index)
    {
        if (index < 0) return "?";

        if (index < 26)
        {
            // A-Z: indices 0-25
            return ((char)('A' + index)).ToString();
        }
        else if (index < 702)
        {
            // BA-ZZ: indices 26-701
            // BA=26, BB=27... BZ=51, CA=52, CB=53... CZ=77, DA=78...
            // Formula: first letter = (index / 26), second = (index % 26)
            // For index=26: first=1=B, second=0=A → BA ✓
            // For index=51: first=1=B, second=25=Z → BZ ✓
            // For index=52: first=2=C, second=0=A → CA ✓
            int first = index / 26;    // 1=B, 2=C, 3=D, 4=E, 5=F...
            int second = index % 26;   // 0=A, 1=B, 2=C...
            return $"{(char)('A' + first)}{(char)('A' + second)}";
        }
        else
        {
            // BAA-ZZZ: indices 702+
            // BAA=702, BAB=703...
            int adjusted = index - 702;
            int first = adjusted / 676 + 1;  // Start at B
            int remainder = adjusted % 676;
            int second = remainder / 26;
            int third = remainder % 26;
            return $"{(char)('A' + first)}{(char)('A' + second)}{(char)('A' + third)}";
        }
    }

    /// <summary>
    /// Convert variable letter(s) to 0-based index.
    /// Pattern: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), DA-DZ (78-103), EA-EZ (104-129), FA-FZ (130-155), etc.
    /// Note: After Z comes BA (not AA) - this is the Magic IDE convention.
    /// </summary>
    public static int VariableToIndex(string variable)
    {
        if (string.IsNullOrEmpty(variable)) return -1;
        variable = variable.ToUpperInvariant();

        if (variable.Length == 1)
        {
            // A-Z: return 0-25
            return variable[0] - 'A';
        }
        else if (variable.Length == 2)
        {
            // BA-ZZ: BA=26, BB=27... BZ=51, CA=52...
            // Formula: first * 26 + second
            // For BA: 1*26 + 0 = 26 ✓
            // For FC: 5*26 + 2 = 132 ✓
            int first = variable[0] - 'A';  // B=1, C=2, D=3, E=4, F=5...
            int second = variable[1] - 'A'; // A=0, B=1, C=2...
            return first * 26 + second;
        }
        else if (variable.Length == 3)
        {
            // BAA-ZZZ: BAA=702
            int first = variable[0] - 'A';  // B=1
            int second = variable[1] - 'A';
            int third = variable[2] - 'A';
            return 702 + (first - 1) * 676 + second * 26 + third;
        }

        return -1;
    }
}
