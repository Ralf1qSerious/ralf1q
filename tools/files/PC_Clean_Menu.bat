@echo off
setlocal EnableExtensions EnableDelayedExpansion
title PC Cleanup + Checks (Win10/11)

:: ==========================
:: Admin check
:: ==========================
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo [!] Run as Administrator.
  echo     Right-click the .bat ^> "Run as administrator"
  echo.
  pause
  exit /b
)

:menu
cls
echo ==========================================
echo       PC Cleanup + Health Checks (BAT)
echo            Compatible: Windows 10/11
echo ==========================================
echo  CLEANUP
echo  1) Clean User TEMP   (%%TEMP%%)
echo  2) Clean Windows TEMP (C:\Windows\Temp)
echo  3) Clean Prefetch     (C:\Windows\Prefetch)
echo  4) Empty Recycle Bin
echo.
echo  MALWARE (Microsoft Defender)
echo  5) Update Defender signatures
echo  6) Defender Quick Scan
echo  7) Defender Full Scan
echo  8) Open Windows Security (Defender UI)
echo.
echo  UPDATES / DRIVERS
echo  9) Trigger Windows Update scan + open Windows Update page
echo.
echo  SYSTEM CHECKS
echo  10) Run DISK Cleanup prompt (cleanmgr)
echo  11) Run System File Check (sfc /scannow)
echo  12) Flush DNS Cache
echo.
echo  A) Run common cleanup (1-4)
echo  Q) Quit
echo ==========================================
set /p choice=Select an option: 

if /i "%choice%"=="1" goto usertemp
if /i "%choice%"=="2" goto wintemp
if /i "%choice%"=="3" goto prefetch
if /i "%choice%"=="4" goto recycle

if /i "%choice%"=="5" goto def_update
if /i "%choice%"=="6" goto def_quick
if /i "%choice%"=="7" goto def_full
if /i "%choice%"=="8" goto sec_ui

if /i "%choice%"=="9" goto winupdate

if /i "%choice%"=="10" goto cleanmgr
if /i "%choice%"=="11" goto sfc
if /i "%choice%"=="12" goto dns

if /i "%choice%"=="A" goto common
if /i "%choice%"=="Q" goto end

echo Invalid selection.
pause
goto menu

:common
call :do_usertemp
call :do_wintemp
call :do_prefetch
call :do_recycle
echo.
echo Done common cleanup.
pause
goto menu

:usertemp
call :do_usertemp
pause
goto menu

:wintemp
call :do_wintemp
pause
goto menu

:prefetch
call :do_prefetch
pause
goto menu

:recycle
call :do_recycle
pause
goto menu

:dns
echo.
echo Flushing DNS cache...
ipconfig /flushdns
echo Done.
pause
goto menu

:cleanmgr
echo.
echo Launching Disk Cleanup...
cleanmgr
echo (Close Disk Cleanup to return.)
pause
goto menu

:sfc
echo.
echo Running System File Checker. This can take a while.
sfc /scannow
echo Done.
pause
goto menu

:: ==========================
:: Microsoft Defender actions
:: ==========================
:def_update
echo.
echo Updating Defender signatures...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Update-MpSignature" 
echo Done.
pause
goto menu

:def_quick
echo.
echo Starting Defender QUICK scan...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-MpScan -ScanType QuickScan"
echo Done (scan runs in background; check Windows Security for results).
pause
goto menu

:def_full
echo.
echo Starting Defender FULL scan (can take a long time)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-MpScan -ScanType FullScan"
echo Done (scan runs in background; check Windows Security for results).
pause
goto menu

:sec_ui
echo.
echo Opening Windows Security...
start "" windowsdefender:
pause
goto menu

:: ==========================
:: Windows Update (drivers often come via here)
:: ==========================
:winupdate
echo.
echo Triggering Windows Update scan...
echo (This asks Windows to check for updates; drivers may appear under Optional updates.)
echo.

:: Try common Win10/11 methods (best-effort)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { (New-Object -ComObject Microsoft.Update.AutoUpdate).DetectNow() | Out-Null } catch {}" >nul 2>&1

:: UsoClient exists on Win10/11 (some builds restrict output; still triggers)
usoclient StartScan >nul 2>&1

echo Opening Windows Update settings page...
start "" ms-settings:windowsupdate

echo.
echo Tip: In Windows Update, also check:
echo  - Advanced options ^> Optional updates ^> Driver updates (if present)
pause
goto menu

:: ==========================
:: Cleanup routines (helpers)
:: ==========================
:do_usertemp
echo.
echo Cleaning User TEMP: %TEMP%
call :safe_del "%TEMP%"
exit /b

:do_wintemp
echo.
echo Cleaning Windows TEMP: %windir%\Temp
call :safe_del "%windir%\Temp"
exit /b

:do_prefetch
echo.
echo Cleaning Prefetch: %windir%\Prefetch
echo Note: Windows will rebuild useful prefetch data automatically.
call :safe_del "%windir%\Prefetch"
exit /b

:do_recycle
echo.
echo Emptying Recycle Bin...
powershell -NoProfile -Command "Clear-RecycleBin -Force" >nul 2>&1
echo Done.
exit /b

:safe_del
set "target=%~1"
if not exist "%target%" (
  echo Folder not found: "%target%"
  exit /b
)

echo Deleting files in: "%target%"
del /f /s /q "%target%\*" >nul 2>&1

for /d %%G in ("%target%\*") do (
  rd /s /q "%%G" >nul 2>&1
)

echo Completed: "%target%"
exit /b

:end
echo Goodbye.
endlocal
exit /b