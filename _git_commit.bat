@echo off
cd /d "E:\ShineAutowerkz\Software\Alpha_Soft\AlphaWash"

rem Remove stale lock file if exists
if exist ".git\index.lock" del /f ".git\index.lock"

rem Set git identity
git config user.email "mquan129dalat@gmail.com"
git config user.name "Manh Quan"

rem Stage and commit
git add -A
git commit -m "[Quan] Update function CRUD for customer"

rem Save output to log
git log -1 --format="Hash: %%H%%nFiles: " > _git_result.txt
git diff-tree --no-commit-id -r --name-only HEAD >> _git_result.txt

echo.
echo Done! Press any key to close.
pause
