@echo off
REM ============================================================
REM  Build green portable version (no NSIS, no installer)
REM  Output: dist\win-unpacked  and  dist\<name>-win.zip
REM ============================================================
cd /d "%~dp0"

echo [1/2] Building frontend (Vite)...
call npm run build
if errorlevel 1 (
  echo FAILED: vite build
  pause
  exit /b 1
)

echo [2/2] Packaging...
set "TEMP=%~dp0.builder-cache\temp"
set "TMP=%~dp0.builder-cache\temp"
set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
set "ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/"
set "ELECTRON_BUILDER_CACHE=%~dp0.builder-cache"

if not exist "%~dp0.builder-cache\temp" mkdir "%~dp0.builder-cache\temp"

call npx electron-builder --win --x64
if errorlevel 1 (
  echo FAILED: electron-builder
  pause
  exit /b 1
)

echo.
echo DONE.
echo   Green folder : dist\win-unpacked
echo   Zip archive  : dist\*-win.zip
echo.
pause
