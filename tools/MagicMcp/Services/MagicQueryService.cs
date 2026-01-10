using MagicMcp.Models;

namespace MagicMcp.Services;

/// <summary>
/// Query service for Magic index
/// </summary>
public class MagicQueryService
{
    private readonly IndexCache _cache;

    public MagicQueryService(IndexCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    /// Get IDE position for a program/task
    /// Example: "ADH 121.6 Nom: Pilotage"
    /// </summary>
    public string GetPosition(string projectName, int programId, int? isn2 = null)
    {
        var program = _cache.GetProgram(projectName, programId);
        if (program == null)
            return $"ERROR: Program {programId} not found in project {projectName}";

        if (isn2.HasValue)
        {
            var task = _cache.GetTask(projectName, programId, isn2.Value);
            if (task == null)
                return $"ERROR: Task ISN_2={isn2.Value} not found in program {programId}";

            return $"**{projectName.ToUpper()} {task.IdePosition}** Nom : **{task.Description}**";
        }

        return $"**{projectName.ToUpper()} {program.IdePosition}** Nom : **{program.Name}**" +
               (program.PublicName != null ? $" (Public: {program.PublicName})" : "");
    }

    /// <summary>
    /// Get full task tree for a program
    /// </summary>
    public string GetTree(string projectName, int programId)
    {
        var program = _cache.GetProgram(projectName, programId);
        if (program == null)
            return $"ERROR: Program {programId} not found in project {projectName}";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**{projectName.ToUpper()} {program.IdePosition}** - {program.Name}");
        sb.AppendLine();
        sb.AppendLine("| IDE | ISN_2 | Nom | Niveau |");
        sb.AppendLine("|-----|-------|-----|--------|");

        foreach (var task in program.Tasks.Values.OrderBy(t => t.IdePosition))
        {
            sb.AppendLine($"| {task.IdePosition} | {task.Isn2} | {task.Description} | {task.Level} |");
        }

        return sb.ToString();
    }

    /// <summary>
    /// Get DataView details for a task
    /// </summary>
    public string GetDataView(string projectName, int programId, int? isn2 = null)
    {
        var program = _cache.GetProgram(projectName, programId);
        if (program == null)
            return $"ERROR: Program {programId} not found in project {projectName}";

        // Default to root task (ISN_2=1)
        var taskIsn2 = isn2 ?? 1;
        var task = _cache.GetTask(projectName, programId, taskIsn2);
        if (task == null)
            return $"ERROR: Task ISN_2={taskIsn2} not found";

        if (task.DataView == null)
            return $"Task {task.IdePosition} has no DataView";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**DataView pour {projectName.ToUpper()} {task.IdePosition}** - {task.Description}");
        sb.AppendLine();

        // Main Source
        if (task.DataView.MainSource != null)
        {
            var main = task.DataView.MainSource;
            sb.AppendLine("**Main Source:**");
            sb.AppendLine($"- Table: {main.TableName} (#{main.TableId})");
            sb.AppendLine($"- Access: {main.AccessMode}");
            if (main.IndexId.HasValue)
                sb.AppendLine($"- Index: #{main.IndexId}");
            sb.AppendLine();
        }

        // Links
        if (task.DataView.Links.Count > 0)
        {
            sb.AppendLine("**Links:**");
            sb.AppendLine("| # | Table | Type |");
            sb.AppendLine("|---|-------|------|");
            foreach (var link in task.DataView.Links)
            {
                sb.AppendLine($"| {link.Id} | {link.TableName} (#{link.TableId}) | {link.LinkType} |");
            }
            sb.AppendLine();
        }

        // Range
        if (task.DataView.Range != null)
        {
            sb.AppendLine($"**Range:** Direction={task.DataView.Range.Direction}");
            if (task.DataView.Range.Segments.Count > 0)
            {
                sb.AppendLine("| # | Mode | Min | Max |");
                sb.AppendLine("|---|------|-----|-----|");
                foreach (var seg in task.DataView.Range.Segments)
                {
                    sb.AppendLine($"| {seg.Id} | {seg.Mode} | {seg.MinExpression} | {seg.MaxExpression} |");
                }
            }
        }

        return sb.ToString();
    }

    /// <summary>
    /// Get expression content by ID
    /// </summary>
    public string GetExpression(string projectName, int programId, int expressionId)
    {
        var expression = _cache.GetExpression(projectName, programId, expressionId);
        if (expression == null)
            return $"ERROR: Expression #{expressionId} not found in program {programId}";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**Expression #{expression.Id}** (IDE #{expression.IdePosition})");
        if (expression.Comment != null)
            sb.AppendLine($"// {expression.Comment}");
        sb.AppendLine("```");
        sb.AppendLine(expression.Content);
        sb.AppendLine("```");

        return sb.ToString();
    }

    /// <summary>
    /// Get logic line details
    /// </summary>
    public string GetLogic(string projectName, int programId, int isn2, int? lineNumber = null)
    {
        var task = _cache.GetTask(projectName, programId, isn2);
        if (task == null)
            return $"ERROR: Task ISN_2={isn2} not found";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"**Logic pour {projectName.ToUpper()} {task.IdePosition}** - {task.Description}");
        sb.AppendLine();

        var lines = task.LogicLines;
        if (lineNumber.HasValue)
        {
            var line = lines.FirstOrDefault(l => l.LineNumber == lineNumber.Value);
            if (line == null)
                return $"ERROR: Line {lineNumber.Value} not found";
            lines = new List<MagicLogicLine> { line };
        }

        sb.AppendLine("| # | Operation | Condition | Disabled |");
        sb.AppendLine("|---|-----------|-----------|----------|");

        foreach (var line in lines)
        {
            var disabled = line.IsDisabled ? "Yes" : "";
            var condition = line.Condition ?? "";
            sb.AppendLine($"| {line.LineNumber} | {line.Operation} | {condition} | {disabled} |");
        }

        if (lineNumber.HasValue && lines.Count == 1)
        {
            var line = lines[0];
            if (line.Parameters.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("**Parameters:**");
                foreach (var param in line.Parameters)
                {
                    sb.AppendLine($"- {param.Key}: {param.Value}");
                }
            }
        }

        return sb.ToString();
    }

    /// <summary>
    /// Get both DataView column AND Logic operation for a specific line number.
    /// Line numbers are independent in each tab.
    /// </summary>
    public string GetLine(string projectName, string taskPosition, int lineNumber, int mainOffset = 0)
    {
        // Parse task position (e.g., "69.3" -> program 69, task with IdePosition "69.3")
        var parts = taskPosition.Split('.');
        if (parts.Length == 0 || !int.TryParse(parts[0], out int prgIdePosition))
            return $"ERROR: Invalid task position format '{taskPosition}'. Expected format: 69 or 69.3";

        // Find program by IDE position
        var project = _cache.GetProject(projectName);
        if (project == null)
            return $"ERROR: Project {projectName} not found";

        var program = project.Programs.Values.FirstOrDefault(p => p.IdePosition == prgIdePosition);
        if (program == null)
            return $"ERROR: No program found at IDE position {prgIdePosition} in project {projectName}";

        // Find task by IDE position
        MagicTask? task;
        if (parts.Length == 1)
        {
            // Root task (ISN_2 = 1)
            task = program.Tasks.Values.FirstOrDefault(t => t.IdePosition == taskPosition);
            if (task == null)
                task = program.Tasks.GetValueOrDefault(1);
        }
        else
        {
            // Subtask
            task = program.Tasks.Values.FirstOrDefault(t => t.IdePosition == taskPosition);
        }

        if (task == null)
            return $"ERROR: Task {taskPosition} not found in program {program.Id}";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"## Tâche {projectName.ToUpper()} IDE {taskPosition} - Ligne {lineNumber}");
        sb.AppendLine();

        // DATA VIEW (Columns)
        sb.AppendLine("### DATA VIEW (Colonnes)");
        sb.AppendLine();

        if (task.DataView?.Columns != null && task.DataView.Columns.Count > 0)
        {
            var column = task.DataView.Columns.FirstOrDefault(c => c.LineNumber == lineNumber);
            if (column != null)
            {
                sb.AppendLine("| Ligne | Variable | Nom | Type | Définition | Locate |");
                sb.AppendLine("|-------|----------|-----|------|------------|--------|");

                var locateInfo = column.LocateExpressionId.HasValue
                    ? $"Expr {column.LocateExpressionId}"
                    : "-";
                var defType = column.Definition switch
                {
                    "R" => "Real",
                    "V" => "Virtual",
                    "P" => "Parameter",
                    _ => column.Definition
                };

                // Apply mainOffset to variable if provided
                var displayVar = column.Variable;
                if (mainOffset > 0 && !string.IsNullOrEmpty(column.Variable))
                {
                    var localIndex = MagicColumn.VariableToIndex(column.Variable);
                    if (localIndex >= 0)
                    {
                        displayVar = MagicColumn.IndexToVariable(localIndex + mainOffset);
                    }
                }
                sb.AppendLine($"| {column.LineNumber} | **{displayVar}** | {column.Name} | {column.DataType} | {defType} | {locateInfo} |");

                // Show expression content if available
                if (column.LocateExpressionId.HasValue)
                {
                    var expr = _cache.GetExpression(projectName, program.Id, column.LocateExpressionId.Value);
                    if (expr != null)
                    {
                        sb.AppendLine();
                        sb.AppendLine($"**Expression {expr.Id}:** `{expr.Content}`");
                    }
                }
            }
            else
            {
                sb.AppendLine($"*Ligne {lineNumber} non trouvée dans Data View (max: {task.DataView.Columns.Count})*");
            }
        }
        else
        {
            sb.AppendLine("*Aucune colonne Data View*");
        }

        sb.AppendLine();

        // LOGIC (Operations)
        sb.AppendLine("### LOGIC (Opérations)");
        sb.AppendLine();

        if (task.LogicLines.Count > 0)
        {
            var logicLine = task.LogicLines.FirstOrDefault(l => l.LineNumber == lineNumber);
            if (logicLine != null)
            {
                sb.AppendLine("| Ligne | Opération | Handler | Détails |");
                sb.AppendLine("|-------|-----------|---------|---------|");

                var handler = logicLine.Parameters.GetValueOrDefault("Handler", "-");
                var details = FormatLogicDetails(logicLine, projectName, program.Id);

                sb.AppendLine($"| {logicLine.LineNumber} | **{logicLine.Operation}** | {handler} | {details} |");

                // Show all parameters
                if (logicLine.Parameters.Count > 1)
                {
                    sb.AppendLine();
                    sb.AppendLine("**Paramètres:**");
                    foreach (var param in logicLine.Parameters.Where(p => p.Key != "Handler"))
                    {
                        sb.AppendLine($"- {param.Key}: {param.Value}");
                    }
                }
            }
            else
            {
                sb.AppendLine($"*Ligne {lineNumber} non trouvée dans Logic (max: {task.LogicLines.Count})*");
            }
        }
        else
        {
            sb.AppendLine("*Aucune ligne Logic*");
        }

        return sb.ToString();
    }

    private string FormatLogicDetails(MagicLogicLine line, string projectName, int programId)
    {
        switch (line.Operation)
        {
            case "Call Task":
                var targetPrg = line.Parameters.GetValueOrDefault("TargetPrg", "?");
                var targetComp = line.Parameters.GetValueOrDefault("TargetComp", "");
                // Try to get program name
                if (int.TryParse(targetPrg, out int prgId))
                {
                    var target = _cache.GetProgram(projectName, prgId);
                    if (target != null)
                        return $"{projectName.ToUpper()} IDE {target.IdePosition} - {target.Name}";
                }
                return $"Comp {targetComp} Prg {targetPrg}";

            case "Link":
                var tableId = line.Parameters.GetValueOrDefault("TableId", "?");
                return $"Table n°{tableId}";

            case "Verify":
                var msgExpr = line.Parameters.GetValueOrDefault("MessageExpr", "");
                var returnVar = line.Parameters.GetValueOrDefault("ReturnVar", "");
                if (!string.IsNullOrEmpty(returnVar))
                {
                    return $"Retour → Variable index {returnVar}";
                }
                return msgExpr;

            case "Select":
            case "Update":
                var fieldId = line.Parameters.GetValueOrDefault("FieldID", "?");
                return $"Variable index {fieldId}";

            default:
                return line.Condition ?? "-";
        }
    }
}
