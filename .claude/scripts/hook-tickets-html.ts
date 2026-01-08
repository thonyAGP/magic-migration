#!/usr/bin/env bun

/**
 * Hook PostToolUse pour régénérer tickets.html
 * quand un fichier dans .openspec/tickets/ est modifié
 */

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: {
    file_path: string;
    content?: string;
  };
  tool_response: {
    filePath: string;
    success: boolean;
  };
}

async function main() {
  // Lire l'input JSON depuis stdin
  const input = await Bun.stdin.text();

  let hookData: HookInput;
  try {
    hookData = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = hookData.tool_input?.file_path;
  if (!filePath) {
    process.exit(0);
  }

  // Normaliser le chemin (Windows/Unix)
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();

  // Vérifier si c'est un fichier dans .openspec/tickets/
  if (!normalizedPath.includes(".openspec/tickets/")) {
    process.exit(0);
  }

  // Déterminer le répertoire racine du projet
  const projectRoot = hookData.cwd;
  const scriptPath = `${projectRoot}\\.claude\\scripts\\generate-tickets-html.ps1`;

  // Exécuter le script PowerShell
  const proc = Bun.spawn([
    "powershell",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    scriptPath,
    "-ProjectRoot",
    projectRoot,
  ], {
    stdout: "pipe",
    stderr: "pipe",
  });

  await proc.exited;

  // Notifier que tickets.html a été régénéré
  console.error(`[tickets-hook] tickets.html regenerated`);
}

main().catch(() => process.exit(0));
