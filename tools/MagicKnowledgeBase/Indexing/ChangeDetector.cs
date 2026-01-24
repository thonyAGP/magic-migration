using System.Diagnostics;
using System.Security.Cryptography;
using MagicKnowledgeBase.Database;
using MagicKnowledgeBase.Models;

namespace MagicKnowledgeBase.Indexing;

/// <summary>
/// Detects file changes for incremental indexing
/// </summary>
public class ChangeDetector
{
    private readonly KnowledgeDb _db;
    private readonly string _projectsBasePath;

    public ChangeDetector(KnowledgeDb db, string projectsBasePath)
    {
        _db = db;
        _projectsBasePath = projectsBasePath;
    }

    /// <summary>
    /// Detect changed files for a project using git diff (preferred) or hash comparison
    /// </summary>
    public ChangeDetectionResult DetectChanges(string projectName)
    {
        var result = new ChangeDetectionResult { ProjectName = projectName };
        var project = _db.GetProject(projectName);

        if (project == null)
        {
            // New project - all files are new
            result.IsNewProject = true;
            result.AllFilesChanged = true;
            return result;
        }

        var sourcePath = Path.Combine(_projectsBasePath, projectName, "Source");
        if (!Directory.Exists(sourcePath))
        {
            return result;
        }

        // Try git-based detection first
        var gitChanges = TryGitDetection(sourcePath, project.GitCommit);
        if (gitChanges != null)
        {
            result.Method = ChangeDetectionMethod.Git;
            result.ChangedFiles.AddRange(gitChanges.ChangedFiles);
            result.DeletedFiles.AddRange(gitChanges.DeletedFiles);
            result.NewGitCommit = gitChanges.CurrentCommit;
            return result;
        }

        // Fallback to hash-based detection
        result.Method = ChangeDetectionMethod.Hash;
        DetectByHash(project.Id, sourcePath, result);

        return result;
    }

    private GitChangeResult? TryGitDetection(string sourcePath, string? lastCommit)
    {
        try
        {
            // Check if this is a git repo
            var repoRoot = FindGitRoot(sourcePath);
            if (repoRoot == null) return null;

            // Get current HEAD commit
            var currentCommit = RunGitCommand(repoRoot, "rev-parse HEAD")?.Trim();
            if (string.IsNullOrEmpty(currentCommit)) return null;

            var result = new GitChangeResult { CurrentCommit = currentCommit };

            if (string.IsNullOrEmpty(lastCommit))
            {
                // No previous commit recorded - consider all Prg_*.xml as changed
                var allPrgFiles = Directory.GetFiles(sourcePath, "Prg_*.xml");
                result.ChangedFiles.AddRange(allPrgFiles);
                return result;
            }

            if (currentCommit == lastCommit)
            {
                // No changes
                return result;
            }

            // Get diff between commits
            var diffOutput = RunGitCommand(repoRoot, $"diff --name-status {lastCommit}..{currentCommit}");
            if (diffOutput == null) return null;

            var relativePath = Path.GetRelativePath(repoRoot, sourcePath).Replace('\\', '/');

            foreach (var line in diffOutput.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                var parts = line.Split('\t', 2);
                if (parts.Length != 2) continue;

                var status = parts[0];
                var filePath = parts[1];

                // Only care about files in our source path
                if (!filePath.StartsWith(relativePath + "/")) continue;

                // Only care about Prg_*.xml files
                var fileName = Path.GetFileName(filePath);
                if (!fileName.StartsWith("Prg_") || !fileName.EndsWith(".xml")) continue;

                var fullPath = Path.Combine(repoRoot, filePath.Replace('/', Path.DirectorySeparatorChar));

                if (status == "D")
                {
                    result.DeletedFiles.Add(fullPath);
                }
                else // A, M, R, etc.
                {
                    if (File.Exists(fullPath))
                    {
                        result.ChangedFiles.Add(fullPath);
                    }
                }
            }

            return result;
        }
        catch
        {
            return null;
        }
    }

    private void DetectByHash(long projectId, string sourcePath, ChangeDetectionResult result)
    {
        var currentFiles = Directory.GetFiles(sourcePath, "Prg_*.xml")
            .ToDictionary(f => f, StringComparer.OrdinalIgnoreCase);

        // Check each file against stored hash
        foreach (var filePath in currentFiles.Keys)
        {
            var storedHash = _db.GetFileHash(projectId, filePath);

            if (storedHash == null)
            {
                // New file
                result.ChangedFiles.Add(filePath);
            }
            else
            {
                // Check if file has changed
                var fileInfo = new FileInfo(filePath);

                // Quick check: file size and modification time
                if (fileInfo.Length != storedHash.FileSize ||
                    fileInfo.LastWriteTimeUtc > storedHash.IndexedAt)
                {
                    // Compute actual hash to confirm
                    var currentHash = ComputeFileHash(filePath);
                    if (currentHash != storedHash.FileHash)
                    {
                        result.ChangedFiles.Add(filePath);
                    }
                }
            }
        }

        // Check for deleted files (in DB but not on disk)
        // This would require querying all file_hashes for the project
        // For simplicity, we'll handle this in the incremental indexer
    }

    private static string? FindGitRoot(string startPath)
    {
        var current = startPath;
        while (!string.IsNullOrEmpty(current))
        {
            if (Directory.Exists(Path.Combine(current, ".git")))
            {
                return current;
            }
            var parent = Directory.GetParent(current);
            if (parent == null) break;
            current = parent.FullName;
        }
        return null;
    }

    private static string? RunGitCommand(string workingDir, string arguments)
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = arguments,
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null) return null;

            var output = process.StandardOutput.ReadToEnd();
            process.WaitForExit(5000);

            return process.ExitCode == 0 ? output : null;
        }
        catch
        {
            return null;
        }
    }

    private static string ComputeFileHash(string filePath)
    {
        using var sha256 = SHA256.Create();
        using var stream = File.OpenRead(filePath);
        var hash = sha256.ComputeHash(stream);
        return Convert.ToHexString(hash);
    }

    private class GitChangeResult
    {
        public string CurrentCommit { get; set; } = "";
        public List<string> ChangedFiles { get; } = new();
        public List<string> DeletedFiles { get; } = new();
    }
}

/// <summary>
/// Result of change detection
/// </summary>
public class ChangeDetectionResult
{
    public string ProjectName { get; set; } = "";
    public bool IsNewProject { get; set; }
    public bool AllFilesChanged { get; set; }
    public ChangeDetectionMethod Method { get; set; }
    public List<string> ChangedFiles { get; } = new();
    public List<string> DeletedFiles { get; } = new();
    public string? NewGitCommit { get; set; }

    public bool HasChanges => ChangedFiles.Count > 0 || DeletedFiles.Count > 0 || AllFilesChanged;
}

public enum ChangeDetectionMethod
{
    None,
    Git,
    Hash
}
