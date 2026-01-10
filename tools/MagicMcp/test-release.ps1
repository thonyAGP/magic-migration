$env:MAGIC_PROJECTS_PATH = "D:\Data\Migration\XPA\PMS"
$input = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"magic_index_stats","arguments":{}}}'
$input | & "D:\Projects\Lecteur Magic\tools\MagicMcp\bin\Release\net8.0\MagicMcp.exe"
