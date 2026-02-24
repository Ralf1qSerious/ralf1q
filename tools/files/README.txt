ralf1q Tools — PC Cleanup + Health Checks

How to use:
1) Right-click PC_Clean_Menu.bat
2) Run as administrator

Notes:
- Uses Microsoft Defender cmdlets via PowerShell for scans/signature updates.
- Uses Windows Update scan triggers; driver updates may appear under Optional updates.
- Some temp files may be in use and won’t delete (normal).

Verify hash:
certutil -hashfile PC_Clean_Menu.bat SHA256