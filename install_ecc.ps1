$ProgressPreference = 'SilentlyContinue'
Remove-Item -Recurse -Force _temp_ecc -ErrorAction SilentlyContinue
Invoke-WebRequest -Uri "https://github.com/affaan-m/everything-claude-code/archive/refs/heads/main.zip" -OutFile "ecc.zip" -UseBasicParsing
Expand-Archive -Path "ecc.zip" -DestinationPath "_temp_ecc" -Force

$geminiPath = "d:\web6-9\physigame\.gemini"
New-Item -ItemType Directory -Path "$geminiPath/rules/common" -Force
New-Item -ItemType Directory -Path "$geminiPath/rules/typescript" -Force
New-Item -ItemType Directory -Path "$geminiPath/skills" -Force
New-Item -ItemType Directory -Path "$geminiPath/agents" -Force

$src = "d:\web6-9\physigame\_temp_ecc\everything-claude-code-main"

Copy-Item -Path "$src\agents\*" -Destination "$geminiPath\agents\" -Recurse -Force
Copy-Item -Path "$src\rules\common\*" -Destination "$geminiPath\rules\common\" -Recurse -Force
Copy-Item -Path "$src\rules\typescript\*" -Destination "$geminiPath\rules\typescript\" -Recurse -Force
Copy-Item -Path "$src\skills\*" -Destination "$geminiPath\skills\" -Recurse -Force

Copy-Item -Path "$src\INSTALL.md" -Destination "$geminiPath\" -ErrorAction SilentlyContinue
Copy-Item -Path "$src\CLAUDE.md" -Destination "$geminiPath\GEMINI.md" -ErrorAction SilentlyContinue

Remove-Item -Recurse -Force "_temp_ecc"
Remove-Item -Force "ecc.zip"
