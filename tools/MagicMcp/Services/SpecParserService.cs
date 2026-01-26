using System.Text.Json;
using System.Text.RegularExpressions;

namespace MagicMcp.Services;

/// <summary>
/// Service to parse program specification Markdown files
/// </summary>
public class SpecParserService
{
    private readonly string _openspecPath;

    public SpecParserService()
    {
        // Default to current directory's .openspec folder
        _openspecPath = Path.Combine(Environment.CurrentDirectory, ".openspec");
    }

    public SpecParserService(string openspecPath)
    {
        _openspecPath = openspecPath;
    }

    /// <summary>
    /// Get spec file path for a program
    /// </summary>
    public string GetSpecPath(string project, int idePosition)
    {
        return Path.Combine(_openspecPath, "specs", $"{project.ToUpper()}-IDE-{idePosition}.md");
    }

    /// <summary>
    /// Check if spec exists for a program
    /// </summary>
    public bool SpecExists(string project, int idePosition)
    {
        return File.Exists(GetSpecPath(project, idePosition));
    }

    /// <summary>
    /// Parse a spec file and return structured data
    /// </summary>
    public SpecData? ParseSpec(string project, int idePosition)
    {
        var path = GetSpecPath(project, idePosition);
        if (!File.Exists(path))
            return null;

        var content = File.ReadAllText(path);
        return ParseSpecContent(content, project, idePosition);
    }

    /// <summary>
    /// Parse spec content from markdown string
    /// </summary>
    public SpecData ParseSpecContent(string content, string project, int idePosition)
    {
        var spec = new SpecData
        {
            Project = project.ToUpper(),
            IdePosition = idePosition
        };

        // Parse title (first H1)
        var titleMatch = Regex.Match(content, @"^# (.+)$", RegexOptions.Multiline);
        if (titleMatch.Success)
        {
            spec.Title = titleMatch.Groups[1].Value.Trim();
            // Extract just the description part after the IDE info
            var descMatch = Regex.Match(spec.Title, @"IDE \d+ - (.+)$");
            if (descMatch.Success)
                spec.Description = descMatch.Groups[1].Value.Trim();
        }

        // Parse version
        var versionMatch = Regex.Match(content, @"\*\*Version spec\*\* : ([\d.]+)");
        if (versionMatch.Success)
            spec.SpecVersion = versionMatch.Groups[1].Value;

        // Parse source file
        var sourceMatch = Regex.Match(content, @"\*\*Source\*\* : `([^`]+)`");
        if (sourceMatch.Success)
            spec.XmlFile = Path.GetFileName(sourceMatch.Groups[1].Value);

        // Parse type
        var typeMatch = Regex.Match(content, @"\| \*\*Type\*\* \| ([OB]) ");
        if (typeMatch.Success)
            spec.Type = typeMatch.Groups[1].Value == "O" ? "Online" : "Batch";

        // Parse tables section
        spec.Tables = ParseTables(content);

        // Parse parameters
        spec.Parameters = ParseParameters(content);

        // Parse variables
        spec.Variables = ParseVariables(content);

        // Parse expressions count
        var exprMatch = Regex.Match(content, @"## 5\. EXPRESSIONS \((\d+) total");
        if (exprMatch.Success)
            spec.ExpressionCount = int.Parse(exprMatch.Groups[1].Value);

        // Calculate statistics
        spec.WriteTableCount = spec.Tables.Count(t => t.Access == "W");
        spec.ReadTableCount = spec.Tables.Count(t => t.Access == "R");

        return spec;
    }

    /// <summary>
    /// Parse tables from markdown content
    /// </summary>
    private List<TableRef> ParseTables(string content)
    {
        var tables = new List<TableRef>();

        // Find tables section
        var tablesSection = ExtractSection(content, "## 2. TABLES");
        if (string.IsNullOrEmpty(tablesSection))
            return tables;

        // Parse table rows: | #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
        var tablePattern = @"\| #(\d+) \| `([^`]+)` \| ([^|]+) \| \*?\*?([WR])\*?\*? \| (\d+)x \|";
        var matches = Regex.Matches(tablesSection, tablePattern);

        foreach (Match match in matches)
        {
            tables.Add(new TableRef
            {
                Id = int.Parse(match.Groups[1].Value),
                PhysicalName = match.Groups[2].Value.Trim(),
                LogicalName = match.Groups[3].Value.Trim(),
                Access = match.Groups[4].Value,
                UsageCount = int.Parse(match.Groups[5].Value)
            });
        }

        return tables;
    }

    /// <summary>
    /// Parse parameters from markdown content
    /// </summary>
    private List<ParameterRef> ParseParameters(string content)
    {
        var parameters = new List<ParameterRef>();

        var paramsSection = ExtractSection(content, "## 3. PARAMETRES");
        if (string.IsNullOrEmpty(paramsSection))
            return parameters;

        // Parse parameter rows: | P1 | P0 societe | ALPHA | - |
        var paramPattern = @"\| P(\d+) \| ([^|]+) \| ([^|]+) \| ([^|]*) \|";
        var matches = Regex.Matches(paramsSection, paramPattern);

        foreach (Match match in matches)
        {
            parameters.Add(new ParameterRef
            {
                Index = int.Parse(match.Groups[1].Value),
                Name = match.Groups[2].Value.Trim(),
                Type = match.Groups[3].Value.Trim(),
                Description = match.Groups[4].Value.Trim()
            });
        }

        return parameters;
    }

    /// <summary>
    /// Parse variables from markdown content
    /// </summary>
    private List<VariableRef> ParseVariables(string content)
    {
        var variables = new List<VariableRef>();

        var varsSection = ExtractSection(content, "## 4. VARIABLES");
        if (string.IsNullOrEmpty(varsSection))
            return variables;

        // Parse work variables: | `{0,-37}` | W0 FIN SAISIE OD | LOGICAL | - |
        var varPattern = @"\| `\{([^}]+)\}` \| ([^|]+) \| ([^|]+) \| ([^|]*) \|";
        var matches = Regex.Matches(varsSection, varPattern);

        foreach (Match match in matches)
        {
            variables.Add(new VariableRef
            {
                Reference = $"{{{match.Groups[1].Value}}}",
                Name = match.Groups[2].Value.Trim(),
                Type = match.Groups[3].Value.Trim(),
                Role = match.Groups[4].Value.Trim()
            });
        }

        // Parse global variables: | `{32768,0}` | VG.LOGIN | - |
        var vgPattern = @"\| `\{(32768,[^}]+)\}` \| ([^|]+) \| ([^|]*) \|";
        var vgMatches = Regex.Matches(varsSection, vgPattern);

        foreach (Match match in vgMatches)
        {
            variables.Add(new VariableRef
            {
                Reference = $"{{{match.Groups[1].Value}}}",
                Name = match.Groups[2].Value.Trim(),
                Type = "GLOBAL",
                Role = match.Groups[3].Value.Trim()
            });
        }

        return variables;
    }

    /// <summary>
    /// Extract a section from markdown content
    /// </summary>
    private string ExtractSection(string content, string sectionHeader)
    {
        var startIndex = content.IndexOf(sectionHeader);
        if (startIndex < 0)
            return string.Empty;

        // Find next section (## or end of file)
        var endPattern = @"\n## \d+\.";
        var endMatch = Regex.Match(content.Substring(startIndex + sectionHeader.Length), endPattern);

        if (endMatch.Success)
            return content.Substring(startIndex, sectionHeader.Length + endMatch.Index);

        return content.Substring(startIndex);
    }

    /// <summary>
    /// Search all specs for a pattern
    /// </summary>
    public List<SpecSearchResult> SearchSpecs(string query)
    {
        var results = new List<SpecSearchResult>();
        var specsDir = Path.Combine(_openspecPath, "specs");

        if (!Directory.Exists(specsDir))
            return results;

        // Parse query for special filters
        var tableFilter = ExtractFilter(query, "table:");
        var accessFilter = ExtractFilter(query, "access:");
        var typeFilter = ExtractFilter(query, "type:");
        var textQuery = RemoveFilters(query);

        foreach (var file in Directory.GetFiles(specsDir, "*.md"))
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            var match = Regex.Match(fileName, @"^([A-Z]+)-IDE-(\d+)$");
            if (!match.Success)
                continue;

            var project = match.Groups[1].Value;
            var idePos = int.Parse(match.Groups[2].Value);

            var spec = ParseSpec(project, idePos);
            if (spec == null)
                continue;

            // Apply filters
            if (!string.IsNullOrEmpty(tableFilter))
            {
                if (int.TryParse(tableFilter, out var tableId))
                {
                    if (!spec.Tables.Any(t => t.Id == tableId))
                        continue;
                }
                else
                {
                    if (!spec.Tables.Any(t =>
                        t.PhysicalName.Contains(tableFilter, StringComparison.OrdinalIgnoreCase) ||
                        t.LogicalName.Contains(tableFilter, StringComparison.OrdinalIgnoreCase)))
                        continue;
                }
            }

            if (!string.IsNullOrEmpty(accessFilter))
            {
                var access = accessFilter.ToUpper();
                if (!spec.Tables.Any(t => t.Access == access))
                    continue;
            }

            if (!string.IsNullOrEmpty(typeFilter))
            {
                if (!spec.Type.Equals(typeFilter, StringComparison.OrdinalIgnoreCase))
                    continue;
            }

            // Text search in title/description
            if (!string.IsNullOrEmpty(textQuery))
            {
                var searchable = $"{spec.Title} {spec.Description}".ToLower();
                if (!searchable.Contains(textQuery.ToLower()))
                    continue;
            }

            results.Add(new SpecSearchResult
            {
                Project = spec.Project,
                IdePosition = spec.IdePosition,
                Title = spec.Title ?? $"{spec.Project} IDE {spec.IdePosition}",
                Type = spec.Type,
                TableCount = spec.Tables.Count,
                WriteTableCount = spec.WriteTableCount,
                ExpressionCount = spec.ExpressionCount,
                MatchReason = BuildMatchReason(spec, tableFilter, accessFilter)
            });
        }

        return results.OrderBy(r => r.Project).ThenBy(r => r.IdePosition).ToList();
    }

    private string? ExtractFilter(string query, string prefix)
    {
        var match = Regex.Match(query, $@"{prefix}(\S+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : null;
    }

    private string RemoveFilters(string query)
    {
        var result = Regex.Replace(query, @"(table:|access:|type:)\S+", "", RegexOptions.IgnoreCase);
        return result.Trim();
    }

    private string BuildMatchReason(SpecData spec, string? tableFilter, string? accessFilter)
    {
        var reasons = new List<string>();

        if (!string.IsNullOrEmpty(tableFilter))
        {
            var matchingTables = spec.Tables
                .Where(t => t.Id.ToString() == tableFilter ||
                           t.PhysicalName.Contains(tableFilter, StringComparison.OrdinalIgnoreCase))
                .Select(t => $"#{t.Id} ({t.Access})")
                .ToList();
            if (matchingTables.Any())
                reasons.Add($"Tables: {string.Join(", ", matchingTables)}");
        }

        if (!string.IsNullOrEmpty(accessFilter) && accessFilter.ToUpper() == "W")
        {
            var writeTables = spec.Tables.Where(t => t.Access == "W").Select(t => $"#{t.Id}").ToList();
            if (writeTables.Any())
                reasons.Add($"Write: {string.Join(", ", writeTables)}");
        }

        return string.Join("; ", reasons);
    }
}

/// <summary>
/// Structured spec data
/// </summary>
public class SpecData
{
    public string Project { get; set; } = "";
    public int IdePosition { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? SpecVersion { get; set; }
    public string? XmlFile { get; set; }
    public string? Type { get; set; }
    public List<TableRef> Tables { get; set; } = new();
    public List<ParameterRef> Parameters { get; set; } = new();
    public List<VariableRef> Variables { get; set; } = new();
    public int ExpressionCount { get; set; }
    public int WriteTableCount { get; set; }
    public int ReadTableCount { get; set; }
}

public class TableRef
{
    public int Id { get; set; }
    public string PhysicalName { get; set; } = "";
    public string LogicalName { get; set; } = "";
    public string Access { get; set; } = "R";
    public int UsageCount { get; set; }
}

public class ParameterRef
{
    public int Index { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string? Description { get; set; }
}

public class VariableRef
{
    public string Reference { get; set; } = "";
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string? Role { get; set; }
}

public class SpecSearchResult
{
    public string Project { get; set; } = "";
    public int IdePosition { get; set; }
    public string Title { get; set; } = "";
    public string? Type { get; set; }
    public int TableCount { get; set; }
    public int WriteTableCount { get; set; }
    public int ExpressionCount { get; set; }
    public string? MatchReason { get; set; }
}
