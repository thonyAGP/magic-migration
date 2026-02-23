using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;
using Xunit.Abstractions;

namespace MagicMcp.Tests;

/// <summary>
/// Control tests based on IDE screenshots (2026-01-24).
/// These tests validate the offset calculation formula:
/// Offset = Main_VG + Σ(Selects from ancestors WITHOUT MainSource)
/// </summary>
public class VilOffsetControlTests
{
    private readonly ITestOutputHelper _output;
    private const string VilSourcePath = @"D:\Data\Migration\XPA\PMS\VIL\Source\Prg_348.xml";
    private const int VilMainOffset = 52;

    public VilOffsetControlTests(ITestOutputHelper output)
    {
        _output = output;
    }

    /// <summary>
    /// Test case from IDE screenshot: Task 90.4.4 "Saisie sans PU" (ISN_2=21)
    /// First variable: EP (index 119)
    /// Variables: param_montant, param_ordre, param_type, param_libelle, FinSansPu
    /// </summary>
    [Fact]
    public void Task90_4_4_SaisieSansPu_Offset_ShouldBe_119()
    {
        // Arrange
        var (doc, chain) = LoadTaskChain(21);

        // Act
        int offset = CalculateOffset(chain, hasMainSource: false);

        // Assert
        _output.WriteLine($"Calculated offset for ISN_2=21: {offset}");
        _output.WriteLine($"Expected: 119 (EP)");
        _output.WriteLine($"EP verification: E=4, P=15 → 4*26+15 = {4 * 26 + 15}");

        Assert.Equal(119, offset);
    }

    /// <summary>
    /// Test case from IDE screenshot: Task 90.4.4.1 "Pilotage" (ISN_2=22)
    /// First variable: EU (index 124)
    /// Variables: FinSaisieDemandee, AbandonDemande, EffaceToutDemande, TOTAL
    /// </summary>
    [Fact]
    public void Task90_4_4_1_Pilotage_Offset_ShouldBe_124()
    {
        // Arrange
        var (doc, chain) = LoadTaskChain(22);

        // Act
        int offset = CalculateOffset(chain, hasMainSource: false);

        // Assert
        _output.WriteLine($"Calculated offset for ISN_2=22: {offset}");
        _output.WriteLine($"Expected: 124 (EU)");
        _output.WriteLine($"EU verification: E=4, U=20 → 4*26+20 = {4 * 26 + 20}");

        Assert.Equal(124, offset);
    }

    /// <summary>
    /// Test case from IDE screenshot: Task 90.4.4.1.2.3.2 "BI" (ISN_2=32)
    /// First variable: Expected at index 128
    /// Variable at position 5: FC (index 132)
    /// </summary>
    [Fact]
    public void Task90_4_4_1_2_3_2_BI_Offset_ShouldBe_128()
    {
        // Arrange
        var (doc, chain) = LoadTaskChain(32);

        // Act
        int offset = CalculateOffset(chain, hasMainSource: false);

        // Assert
        _output.WriteLine($"Calculated offset for ISN_2=32: {offset}");
        _output.WriteLine($"Expected: 128");
        _output.WriteLine($"FC at position 5: 128 + 4 = 132");
        _output.WriteLine($"FC verification: F=5, C=2 → 5*26+2 = {5 * 26 + 2}");

        Assert.Equal(128, offset);
    }

    /// <summary>
    /// Verifies that FC at local position 5 in task 32 maps to global index 132.
    /// </summary>
    [Fact]
    public void Task32_Position5_Variable_ShouldBe_FC_Index132()
    {
        // Arrange
        var (doc, chain) = LoadTaskChain(32);
        int offset = CalculateOffset(chain, hasMainSource: false);
        int localPosition = 5; // 1-based position in DataView

        // Act
        int globalIndex = offset + (localPosition - 1); // Position 5 → index offset+4

        // Assert
        Assert.Equal(132, globalIndex);

        // Convert to variable name
        string varName = IndexToVariable(globalIndex);
        _output.WriteLine($"Local position {localPosition} → global index {globalIndex} → variable {varName}");

        Assert.Equal("FC", varName);
    }

    /// <summary>
    /// Validates that tasks WITH MainSource Access=W (Write) don't contribute to offset.
    /// ISN_2=24 "Saisie" has MainSource with Access=W and should be skipped.
    /// ISN_2=15 "Saisie contenu caisse" has MainSource with Access=R and SHOULD contribute.
    /// </summary>
    [Fact]
    public void TaskWithMainSourceWriteAccess_ShouldNotContributeToOffset()
    {
        // Load document
        var content = File.ReadAllText(VilSourcePath, Encoding.UTF8);
        content = Regex.Replace(content, @"&#x[0-9A-Fa-f]+;", "");
        content = Regex.Replace(content, @"&#\d+;", "");
        var doc = XDocument.Parse(content);

        // Test ISN_2=24 (Write access - should NOT contribute)
        var task24 = doc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == "24")?
            .Parent;

        Assert.NotNull(task24);

        var resource24 = task24.Element("Resource");
        var db24 = resource24?.Element("DB");
        var dataObj24 = db24?.Element("DataObject");
        var comp24 = dataObj24?.Attribute("comp")?.Value;
        var access24 = db24?.Element("Access")?.Attribute("val")?.Value;

        _output.WriteLine($"Task 24 'Saisie': comp={comp24}, Access={access24}");
        Assert.Equal("2", comp24); // comp=2 means MainSource
        Assert.Equal("W", access24); // Write access - should NOT contribute

        // Test ISN_2=15 (Read access - should contribute)
        var task15 = doc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == "15")?
            .Parent;

        Assert.NotNull(task15);

        var resource15 = task15.Element("Resource");
        var db15 = resource15?.Element("DB");
        var dataObj15 = db15?.Element("DataObject");
        var comp15 = dataObj15?.Attribute("comp")?.Value;
        var access15 = db15?.Element("Access")?.Attribute("val")?.Value;

        _output.WriteLine($"Task 15 'Saisie contenu caisse': comp={comp15}, Access={access15}");
        Assert.Equal("2", comp15); // comp=2 means MainSource
        Assert.Equal("R", access15); // Read access - SHOULD contribute

        // Count Task 24's Selects (should be 7 but not contribute due to Access=W)
        var taskLogic24 = task24.Element("TaskLogic");
        int selectCount24 = 0;
        if (taskLogic24 != null)
        {
            foreach (var lu in taskLogic24.Elements("LogicUnit"))
            {
                var ll = lu.Element("LogicLines");
                if (ll != null)
                    selectCount24 += ll.Elements("LogicLine").Count(l => l.Element("Select") != null);
            }
        }

        _output.WriteLine($"Task 24 has {selectCount24} Selects but contributes 0 (Access=W)");
        Assert.True(selectCount24 > 0, "Task 24 should have Select operations");

        // Count Task 15's Selects (should be 31 and contribute)
        var taskLogic15 = task15.Element("TaskLogic");
        int selectCount15 = 0;
        if (taskLogic15 != null)
        {
            foreach (var lu in taskLogic15.Elements("LogicUnit"))
            {
                var ll = lu.Element("LogicLines");
                if (ll != null)
                    selectCount15 += ll.Elements("LogicLine").Count(l => l.Element("Select") != null);
            }
        }

        _output.WriteLine($"Task 15 has {selectCount15} Selects and contributes all (Access=R)");
        Assert.Equal(31, selectCount15);
    }

    /// <summary>
    /// Full offset formula verification with detailed breakdown.
    /// Formula: Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING those with MainSource Access=W)
    /// </summary>
    [Fact]
    public void FullOffsetFormula_DetailedBreakdown()
    {
        _output.WriteLine("=== OFFSET FORMULA VERIFICATION ===\n");
        _output.WriteLine("Formula: Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING Access=W)\n");

        var (doc, chain) = LoadTaskChain(32);

        _output.WriteLine("Ancestor chain to task 32 (BI):\n");

        int runningOffset = VilMainOffset;
        _output.WriteLine($"Main_VG (from Prg_1.xml): {VilMainOffset}");

        foreach (var (isn2, desc, selectCount, hasWriteAccess) in chain)
        {
            string contribution = hasWriteAccess ? "SKIP (Access=W)" : $"+{selectCount}";
            var isTarget = isn2 == 32 ? " <-- TARGET" : "";
            _output.WriteLine($"  ISN_2={isn2} '{desc}'{isTarget}: {selectCount} Selects, WriteAccess={hasWriteAccess} → {contribution}");

            if (!hasWriteAccess && isn2 != 32)
            {
                runningOffset += selectCount;
            }
        }

        _output.WriteLine($"\nFinal offset: {runningOffset}");
        _output.WriteLine("Expected: 128");

        Assert.Equal(128, runningOffset);
    }

    private (XDocument doc, List<(int isn2, string desc, int selectCount, bool hasWriteAccess)> chain) LoadTaskChain(int targetIsn2)
    {
        var content = File.ReadAllText(VilSourcePath, Encoding.UTF8);
        content = Regex.Replace(content, @"&#x[0-9A-Fa-f]+;", "");
        content = Regex.Replace(content, @"&#\d+;", "");
        var doc = XDocument.Parse(content);

        var chain = new List<(int isn2, string desc, int selectCount, bool hasWriteAccess)>();

        var targetTask = doc.Descendants("Header")
            .FirstOrDefault(h => h.Attribute("ISN_2")?.Value == targetIsn2.ToString())?
            .Parent;

        if (targetTask == null)
            throw new Exception($"Task {targetIsn2} not found");

        var current = targetTask;
        while (current != null && current.Name == "Task")
        {
            var header = current.Element("Header");
            if (header == null) break;

            var isn2Str = header.Attribute("ISN_2")?.Value;
            if (!int.TryParse(isn2Str, out int isn2)) break;

            var desc = header.Attribute("Description")?.Value ?? "";

            // Count Selects
            int selectCount = 0;
            var taskLogic = current.Element("TaskLogic");
            if (taskLogic != null)
            {
                foreach (var lu in taskLogic.Elements("LogicUnit"))
                {
                    var ll = lu.Element("LogicLines");
                    if (ll != null)
                        selectCount += ll.Elements("LogicLine").Count(l => l.Element("Select") != null);
                }
            }

            // Check for MainSource with Write access (Access=W)
            // Tasks with Access=W don't contribute to offset
            var resource = current.Element("Resource");
            var db = resource?.Element("DB");
            var dataObj = db?.Element("DataObject");
            var comp = dataObj?.Attribute("comp")?.Value;
            var access = db?.Element("Access")?.Attribute("val")?.Value;
            bool hasWriteAccess = comp == "2" && access == "W";

            chain.Add((isn2, desc, selectCount, hasWriteAccess));

            // Move to parent
            var parent = current.Parent;
            while (parent != null && parent.Name != "Task")
                parent = parent.Parent;
            current = parent;
        }

        chain.Reverse();
        return (doc, chain);
    }

    private int CalculateOffset(List<(int isn2, string desc, int selectCount, bool hasWriteAccess)> chain, bool hasMainSource)
    {
        int offset = VilMainOffset;

        foreach (var (isn2, desc, selectCount, hasWriteAccess) in chain)
        {
            // Skip target task (last in chain)
            if (chain.Last().isn2 == isn2)
                continue;

            // Skip tasks with MainSource Write access
            if (hasWriteAccess)
                continue;

            offset += selectCount;
        }

        return offset;
    }

    private static string IndexToVariable(int index)
    {
        if (index < 26)
            return ((char)('A' + index)).ToString();

        int first = index / 26;
        int second = index % 26;
        return $"{(char)('A' + first)}{(char)('A' + second)}";
    }
}
