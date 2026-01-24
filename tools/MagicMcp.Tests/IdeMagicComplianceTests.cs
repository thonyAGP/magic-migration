using System.Text.RegularExpressions;
using MagicMcp.Services;
using Xunit;

namespace MagicMcp.Tests;

/// <summary>
/// Tests de conformite IDE Magic.
/// Verifie que toutes les sorties des outils MCP utilisent le format IDE Magic
/// et non les formats XML bruts interdits.
/// </summary>
public class IdeMagicComplianceTests : IDisposable
{
    private readonly IndexCache _indexCache;
    private readonly MagicQueryService _queryService;
    private readonly GlobalIndex _globalIndex;
    private readonly TableMappingService _tableMappingService;

    // Patterns XML INTERDITS
    private static readonly (string Pattern, string Name, string Fix)[] ForbiddenPatterns = new[]
    {
        (@"Prg_\d+", "Prg_XXX (fichier XML)", "Format: [PROJET] IDE [N] - [Nom]"),
        (@"\{[0-9]+,[0-9]+\}", "{niveau,columnID}", "Variable lettre (A-Z, AA-ZZ...)"),
        (@"ISN_2\s*[=:]\s*\d+", "ISN_2=XX", "Tache X.Y.Z (hierarchique)"),
        (@"(?<![_\w])ISN\s*[=:]\s*\d+", "ISN=XX", "Position IDE"),
        (@"FieldID\s*[=:]\s*""\d+""", "FieldID=\"XX\"", "Nom de variable"),
        (@"(?<![#])obj\s*=\s*\d+", "obj=XX (table)", "Table n°XX - [Nom]"),
        (@"ItemIsn\s*=\s*""\d+""", "ItemIsn=\"XX\"", "Position IDE"),
    };

    public IdeMagicComplianceTests()
    {
        var projectsPath = @"D:\Data\Migration\XPA\PMS";
        var projectNames = new[] { "ADH", "PBP", "REF", "VIL", "PBG", "PVE" };

        _tableMappingService = new TableMappingService(projectsPath);
        _indexCache = new IndexCache(projectsPath, projectNames, _tableMappingService);
        _indexCache.LoadAllProjects();
        var offsetCalculator = new OffsetCalculator(projectsPath, _indexCache);
        _queryService = new MagicQueryService(_indexCache, offsetCalculator);
        _globalIndex = new GlobalIndex(_indexCache);
        _globalIndex.BuildIndex();
    }

    public void Dispose()
    {
        // Cleanup if needed
    }

    /// <summary>
    /// Verifie qu'un texte ne contient pas de patterns XML interdits.
    /// </summary>
    private void AssertIdeCompliance(string content, string toolName)
    {
        var violations = new List<string>();

        foreach (var (pattern, name, fix) in ForbiddenPatterns)
        {
            var matches = Regex.Matches(content, pattern, RegexOptions.IgnoreCase);
            foreach (Match match in matches)
            {
                violations.Add($"{name}: '{match.Value}' -> {fix}");
            }
        }

        Assert.True(violations.Count == 0,
            $"[{toolName}] Violations IDE Magic detectees:\n" +
            string.Join("\n", violations.Take(10)));
    }

    // ========== TESTS magic_get_position ==========

    [Theory]
    [InlineData("ADH", 69)]
    [InlineData("ADH", 121)]
    [InlineData("PVE", 180)]
    [InlineData("PBG", 62)]
    public void GetPosition_ReturnsIdeFormat(string project, int programId)
    {
        // Act
        var result = _queryService.GetPosition(project, programId, null);

        // Assert
        Assert.NotNull(result);
        Assert.DoesNotContain("ERROR", result);
        AssertIdeCompliance(result, $"magic_get_position({project}, {programId})");
    }

    // ========== TESTS magic_find_program ==========

    [Theory]
    [InlineData("EXTRAIT")]
    [InlineData("Caisse")]
    [InlineData("Import")]
    public void FindProgram_ReturnsIdeFormat(string query)
    {
        // Act
        var results = _globalIndex.Search(query, 10);

        // Assert
        Assert.NotEmpty(results);
        foreach (var result in results)
        {
            // Format output like the tool would
            var output = $"{result.Program.Project.ToUpper()} IDE {result.Program.IdePosition} - {result.Program.Name}";
            if (!string.IsNullOrEmpty(result.Program.PublicName))
                output += $" ({result.Program.PublicName})";

            AssertIdeCompliance(output, $"magic_find_program({query})");
        }
    }

    // ========== TESTS magic_get_tree ==========

    [Theory]
    [InlineData("ADH", 69)]
    [InlineData("PVE", 180)]
    public void GetTree_ReturnsIdeFormat(string project, int programId)
    {
        // Act
        var program = _indexCache.GetProgram(project, programId);
        Assert.NotNull(program);

        var tree = _queryService.GetTree(project, programId);

        // Assert
        Assert.NotNull(tree);
        Assert.DoesNotContain("ERROR", tree);
        AssertIdeCompliance(tree, $"magic_get_tree({project}, {programId})");
    }

    // ========== TESTS magic_get_dataview ==========

    [Theory]
    [InlineData("ADH", 69, null)]
    [InlineData("ADH", 121, 1)]
    public void GetDataView_ReturnsIdeFormat(string project, int programId, int? isn2)
    {
        // Act
        var dataview = _queryService.GetDataView(project, programId, isn2);

        // Assert - DataView can be empty for some programs
        if (!string.IsNullOrEmpty(dataview) && !dataview.Contains("no DataView"))
        {
            AssertIdeCompliance(dataview, $"magic_get_dataview({project}, {programId}, {isn2})");
        }
    }

    // ========== TESTS magic_get_logic ==========

    [Theory]
    [InlineData("ADH", 69, 1)]
    [InlineData("PVE", 180, 1)]
    public void GetLogic_ReturnsIdeFormat(string project, int programId, int isn2)
    {
        // Act
        var logic = _queryService.GetLogic(project, programId, isn2, null);

        // Assert
        if (!string.IsNullOrEmpty(logic) && !logic.Contains("ERROR"))
        {
            AssertIdeCompliance(logic, $"magic_get_logic({project}, {programId}, {isn2})");
        }
    }

    // ========== TESTS magic_get_table ==========

    [Theory]
    [InlineData("operations")]
    [InlineData("caisse_session")]
    [InlineData("user_dat")]
    public void GetTable_ReturnsIdeFormat(string query)
    {
        // Act
        var results = _tableMappingService.SearchTables(query).ToList();

        // Assert
        if (results.Count > 0)
        {
            foreach (var result in results)
            {
                var output = $"Table n°{result.IdePosition} - {result.PublicName} ({result.PhysicalName})";
                AssertIdeCompliance(output, $"magic_get_table({query})");
            }
        }
    }

    // ========== TESTS magic_list_programs ==========

    [Theory]
    [InlineData("ADH")]
    [InlineData("PVE")]
    [InlineData("PBG")]
    public void ListPrograms_ReturnsIdeFormat(string project)
    {
        // Act
        var programs = _globalIndex.ListPrograms(project, 0, 10);

        // Assert
        Assert.NotEmpty(programs);
        foreach (var prg in programs)
        {
            var output = $"{project.ToUpper()} IDE {prg.IdePosition} - {prg.Name}";
            if (!string.IsNullOrEmpty(prg.PublicName))
                output += $" ({prg.PublicName})";

            AssertIdeCompliance(output, $"magic_list_programs({project})");
        }
    }

    // ========== TESTS magic_get_line ==========

    [Theory]
    [InlineData("ADH", "69", 1)]
    [InlineData("ADH", "121", 1)]
    public void GetLine_ReturnsIdeFormat(string project, string taskPosition, int lineNumber)
    {
        // Act - offset is now calculated automatically
        var line = _queryService.GetLine(project, taskPosition, lineNumber);

        // Assert
        if (!string.IsNullOrEmpty(line) && !line.Contains("ERROR"))
        {
            AssertIdeCompliance(line, $"magic_get_line({project}, {taskPosition}, {lineNumber})");
        }
    }

    // ========== TESTS magic_get_expression ==========

    [Theory]
    [InlineData("ADH", 69, 1)]
    [InlineData("ADH", 192, 1)]
    public void GetExpression_ReturnsIdeFormat(string project, int programId, int expressionId)
    {
        // Act
        var expr = _queryService.GetExpression(project, programId, expressionId);

        // Assert
        if (!string.IsNullOrEmpty(expr) && !expr.Contains("ERROR"))
        {
            AssertIdeCompliance(expr, $"magic_get_expression({project}, {programId}, {expressionId})");
        }
    }

    // ========== FORMAT VALIDATION TESTS ==========

    [Fact]
    public void Correct_IdeMagicFormat_PassesValidation()
    {
        // These are CORRECT formats that should pass
        var correctOutputs = new[]
        {
            "ADH IDE 69 - EXTRAIT_COMPTE",
            "Variable D (prix)",
            "Tache 69.3 ligne 21",
            "Table n°40 - operations",
            "Expression 30",
            "PVE IDE 186.1.5.4 - Sous-tache Sales",
        };

        foreach (var output in correctOutputs)
        {
            AssertIdeCompliance(output, "correct_format_test");
        }
    }

    [Fact]
    public void Incorrect_XmlFormat_FailsValidation()
    {
        // These are INCORRECT formats that should fail
        var incorrectOutputs = new Dictionary<string, string>
        {
            ["Prg_69"] = "Prg_XXX",
            ["{0,3}"] = "{niveau,columnID}",
            ["ISN_2=5"] = "ISN_2=XX",
            ["FieldID=\"25\""] = "FieldID",
        };

        foreach (var (badOutput, expectedPattern) in incorrectOutputs)
        {
            var violations = new List<string>();
            foreach (var (pattern, name, _) in ForbiddenPatterns)
            {
                if (Regex.IsMatch(badOutput, pattern, RegexOptions.IgnoreCase))
                {
                    violations.Add(name);
                }
            }

            Assert.True(violations.Count > 0,
                $"Expected '{badOutput}' to be detected as violation");
        }
    }

    // ========== COMPREHENSIVE OUTPUT TEST ==========

    [Fact]
    public void AllTools_OutputSummary()
    {
        var results = new List<(string Tool, bool Pass, string Details)>();

        // Test each tool type
        results.Add(TestToolOutput("magic_get_position",
            () => _queryService.GetPosition("ADH", 69, null)));

        results.Add(TestToolOutput("magic_get_tree",
            () => _queryService.GetTree("ADH", 69)));

        results.Add(TestToolOutput("magic_get_dataview",
            () => _queryService.GetDataView("ADH", 69, null)));

        results.Add(TestToolOutput("magic_get_logic",
            () => _queryService.GetLogic("ADH", 69, 1, null)));

        results.Add(TestToolOutput("magic_get_expression",
            () => _queryService.GetExpression("ADH", 69, 1)));

        results.Add(TestToolOutput("magic_get_line",
            () => _queryService.GetLine("ADH", "69", 1)));

        results.Add(TestToolOutput("magic_find_program",
            () => string.Join("\n", _globalIndex.Search("EXTRAIT", 5)
                .Select(r => $"{r.Program.Project} IDE {r.Program.IdePosition} - {r.Program.Name}"))));

        results.Add(TestToolOutput("magic_list_programs",
            () => string.Join("\n", _globalIndex.ListPrograms("ADH", 0, 5)
                .Select(p => $"ADH IDE {p.IdePosition} - {p.Name}"))));

        results.Add(TestToolOutput("magic_get_table",
            () => string.Join("\n", _tableMappingService.SearchTables("operations")
                .Select(t => $"Table n°{t.IdePosition} - {t.PublicName}"))));

        // Summary
        var passed = results.Count(r => r.Pass);
        var failed = results.Count(r => !r.Pass);

        // All should pass
        Assert.True(failed == 0,
            $"IDE Magic Compliance: {passed}/{results.Count} passed\n" +
            string.Join("\n", results.Where(r => !r.Pass).Select(r => $"  FAIL: {r.Tool} - {r.Details}")));
    }

    private (string Tool, bool Pass, string Details) TestToolOutput(string toolName, Func<string> getOutput)
    {
        try
        {
            var output = getOutput();
            if (string.IsNullOrEmpty(output) || output.Contains("ERROR"))
            {
                return (toolName, true, "No output or error (acceptable)");
            }

            var violations = new List<string>();
            foreach (var (pattern, name, _) in ForbiddenPatterns)
            {
                var matches = Regex.Matches(output, pattern, RegexOptions.IgnoreCase);
                foreach (Match match in matches)
                {
                    violations.Add($"{name}: '{match.Value}'");
                }
            }

            if (violations.Count > 0)
            {
                return (toolName, false, string.Join(", ", violations.Take(3)));
            }

            return (toolName, true, "IDE compliant");
        }
        catch (Exception ex)
        {
            return (toolName, false, $"Exception: {ex.Message}");
        }
    }
}
