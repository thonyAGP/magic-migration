using MagicMcp.Services;
using Xunit;
using Xunit.Abstractions;

namespace MagicMcp.Tests;

/// <summary>
/// Tests for the OffsetCalculator service using validated formula.
/// Formula: Offset = Main_VG + Σ(Selects from ancestors, EXCLUDING Access=W)
/// </summary>
public class OffsetCalculatorTests
{
    private readonly ITestOutputHelper _output;
    private readonly OffsetCalculator _calculator;
    private const string ProjectsBasePath = @"D:\Data\Migration\XPA\PMS";

    public OffsetCalculatorTests(ITestOutputHelper output)
    {
        _output = output;

        // Create dependencies
        var tableMappingService = new TableMappingService(ProjectsBasePath);
        var indexCache = new IndexCache(ProjectsBasePath, new[] { "VIL" }, tableMappingService);
        indexCache.LoadAllProjects();

        _calculator = new OffsetCalculator(ProjectsBasePath, indexCache);
    }

    /// <summary>
    /// VIL Prg_348 Task ISN_2=21 (Saisie sans PU) should have offset 119.
    /// </summary>
    [Fact]
    public void VilTask21_SaisieSansPu_Offset_ShouldBe_119()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 21);

        // Assert
        _output.WriteLine(result.ToString());

        Assert.True(result.Success, result.Error);
        Assert.Equal(52, result.MainVG);
        Assert.Equal(119, result.Offset);
    }

    /// <summary>
    /// VIL Prg_348 Task ISN_2=22 (Pilotage) should have offset 124.
    /// </summary>
    [Fact]
    public void VilTask22_Pilotage_Offset_ShouldBe_124()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 22);

        // Assert
        _output.WriteLine(result.ToString());

        Assert.True(result.Success, result.Error);
        Assert.Equal(52, result.MainVG);
        Assert.Equal(124, result.Offset);
    }

    /// <summary>
    /// VIL Prg_348 Task ISN_2=32 (BI) should have offset 128.
    /// </summary>
    [Fact]
    public void VilTask32_BI_Offset_ShouldBe_128()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 32);

        // Assert
        _output.WriteLine(result.ToString());

        Assert.True(result.Success, result.Error);
        Assert.Equal(52, result.MainVG);
        Assert.Equal(128, result.Offset);
    }

    /// <summary>
    /// Verify that Access=W tasks are skipped.
    /// ISN_2=24 (Saisie) has 7 Selects but Access=W, should contribute 0.
    /// </summary>
    [Fact]
    public void VilTask24_WriteAccess_ShouldBeSkipped()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 32);

        // Assert
        Assert.True(result.Success);

        // Find task 24 in the chain
        var task24 = result.AncestorChain.FirstOrDefault(t => t.Isn2 == 24);
        Assert.NotNull(task24);

        _output.WriteLine($"Task 24: {task24.SelectCount} Selects, WriteAccess={task24.HasWriteAccess}, Contribution={task24.Contribution}");

        Assert.True(task24.HasWriteAccess, "Task 24 should have Write access");
        Assert.Equal(0, task24.Contribution);
    }

    /// <summary>
    /// Verify that Access=R tasks contribute their Selects.
    /// ISN_2=15 (Saisie contenu caisse) has Access=R and should contribute 31.
    /// </summary>
    [Fact]
    public void VilTask15_ReadAccess_ShouldContribute()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 32);

        // Assert
        Assert.True(result.Success);

        // Find task 15 in the chain
        var task15 = result.AncestorChain.FirstOrDefault(t => t.Isn2 == 15);
        Assert.NotNull(task15);

        _output.WriteLine($"Task 15: {task15.SelectCount} Selects, WriteAccess={task15.HasWriteAccess}, Contribution={task15.Contribution}");

        Assert.False(task15.HasWriteAccess, "Task 15 should NOT have Write access");
        Assert.Equal(31, task15.SelectCount);
        Assert.Equal(31, task15.Contribution);
    }

    /// <summary>
    /// Full chain verification: all contributions should sum to offset - MainVG.
    /// </summary>
    [Fact]
    public void FullChain_ContributionsSum_ShouldMatchOffset()
    {
        // Act
        var result = _calculator.CalculateOffset("VIL", 348, 32);

        // Assert
        Assert.True(result.Success);

        _output.WriteLine(result.ToString());

        int contributionsSum = result.AncestorChain.Sum(t => t.Contribution);
        int expectedFromAncestors = result.Offset - result.MainVG;

        _output.WriteLine($"Sum of contributions: {contributionsSum}");
        _output.WriteLine($"Expected (Offset - MainVG): {expectedFromAncestors}");

        Assert.Equal(expectedFromAncestors, contributionsSum);
    }
}
