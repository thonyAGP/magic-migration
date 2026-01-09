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
    /// Convert 0-based index to Magic variable letter(s)
    /// Pattern: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), DA-DZ (78-103), etc.
    /// </summary>
    public static string IndexToVariable(int index)
    {
        if (index < 0) return "?";
        if (index < 26)
            return ((char)('A' + index)).ToString();

        // After Z: BA, BB... BZ, CA, CB... CZ, DA...
        int first = index / 26;    // 1=B, 2=C, 3=D, 4=E...
        int second = index % 26;   // 0=A, 1=B... 25=Z
        return $"{(char)('A' + first)}{(char)('A' + second)}";
    }

    /// <summary>
    /// Convert variable letter(s) to 0-based index.
    /// Pattern: A-Z (0-25), BA-BZ (26-51), CA-CZ (52-77), DA-DZ (78-103), etc.
    /// </summary>
    public static int VariableToIndex(string variable)
    {
        if (string.IsNullOrEmpty(variable)) return -1;
        variable = variable.ToUpperInvariant();

        if (variable.Length == 1)
        {
            return variable[0] - 'A';
        }
        else if (variable.Length == 2)
        {
            int first = variable[0] - 'A';  // B=1, C=2, D=3...
            int second = variable[1] - 'A'; // A=0, B=1...
            return first * 26 + second;
        }

        return -1;
    }
}
