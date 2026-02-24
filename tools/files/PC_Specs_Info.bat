@echo off
title Gaming PC Specs
color 3

echo.
echo ==================================================
echo                   PC SPECS
echo ==================================================
echo.

:: ---------------- OS ----------------
echo [OS]
wmic os get Caption,Version
echo.

:: ---------------- SYSTEM ----------------
echo [System]
wmic computersystem get Manufacturer,Model
wmic bios get SMBIOSBIOSVersion
echo.

:: ---------------- CPU ----------------
echo [CPU]
wmic cpu get Name
wmic cpu get NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed
echo.

:: ---------------- GPU ----------------
echo [GPU]
wmic path win32_videocontroller get Name
echo.
echo [GPU Driver]
wmic path win32_videocontroller get DriverVersion
echo.

:: ---------------- RAM ----------------
echo [Total RAM]
wmic computersystem get TotalPhysicalMemory
echo.
echo [RAM Sticks]
wmic memorychip get Capacity,Speed
echo.

:: ---------------- STORAGE ----------------
echo [Storage]
wmic diskdrive get Model,MediaType,Size
echo.

:: ---------------- NVIDIA ----------------
echo [NVIDIA Details]
where nvidia-smi >nul 2>&1
if %errorlevel%==0 (
    nvidia-smi
) else (
    echo NVIDIA tools not found.
)
echo.

echo ==================================================
echo Finished. Press any key to close.
echo ==================================================
echo.

pause >nul
cmd /k
