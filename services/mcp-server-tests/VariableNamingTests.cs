using MagicMcp.Models;
using Xunit;

namespace MagicMcp.Tests;

/// <summary>
/// Tests for Magic variable naming convention: A-Z (0-25), BA-ZZ (26+)
/// After Z comes BA (not AA) - this is the Magic IDE convention.
/// </summary>
public class VariableNamingTests
{
    [Theory]
    [InlineData(0, "A")]
    [InlineData(1, "B")]
    [InlineData(25, "Z")]
    [InlineData(26, "BA")]  // After Z comes BA, not AA!
    [InlineData(27, "BB")]
    [InlineData(51, "BZ")]
    [InlineData(52, "CA")]
    [InlineData(77, "CZ")]
    [InlineData(78, "DA")]
    [InlineData(103, "DZ")]
    [InlineData(104, "EA")]
    [InlineData(129, "EZ")]
    [InlineData(130, "FA")]
    [InlineData(131, "FB")]
    [InlineData(132, "FC")]  // The variable from the test case!
    [InlineData(155, "FZ")]
    [InlineData(156, "GA")]
    public void IndexToVariable_ReturnsCorrectLetter(int index, string expected)
    {
        var result = MagicColumn.IndexToVariable(index);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("A", 0)]
    [InlineData("B", 1)]
    [InlineData("Z", 25)]
    [InlineData("BA", 26)]
    [InlineData("BB", 27)]
    [InlineData("BZ", 51)]
    [InlineData("CA", 52)]
    [InlineData("CZ", 77)]
    [InlineData("DA", 78)]
    [InlineData("DZ", 103)]
    [InlineData("EA", 104)]
    [InlineData("EZ", 129)]
    [InlineData("FA", 130)]
    [InlineData("FB", 131)]
    [InlineData("FC", 132)]  // The variable from the test case!
    [InlineData("FZ", 155)]
    [InlineData("GA", 156)]
    public void VariableToIndex_ReturnsCorrectIndex(string variable, int expected)
    {
        var result = MagicColumn.VariableToIndex(variable);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("a", 0)]
    [InlineData("fc", 132)]
    [InlineData("FC", 132)]
    public void VariableToIndex_IsCaseInsensitive(string variable, int expected)
    {
        var result = MagicColumn.VariableToIndex(variable);
        Assert.Equal(expected, result);
    }

    [Fact]
    public void RoundTrip_AllValuesUnder200()
    {
        for (int i = 0; i < 200; i++)
        {
            var variable = MagicColumn.IndexToVariable(i);
            var backToIndex = MagicColumn.VariableToIndex(variable);
            Assert.Equal(i, backToIndex);
        }
    }

    [Fact]
    public void FC_IsIndex132_ForVariablePosition5InNestedTask()
    {
        // VIL IDE 90.4.4.1.2.3.2 - Task BI
        // Variable position 5 (local index 4, 0-based)
        // Expected: FC (global index 132)
        // This means offset should be 128 (132 - 4 = 128)

        int localIndex = 4;  // 5th variable, 0-based
        int expectedOffset = 128;
        int globalIndex = expectedOffset + localIndex;

        var variable = MagicColumn.IndexToVariable(globalIndex);
        Assert.Equal("FC", variable);
    }
}
