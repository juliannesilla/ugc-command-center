# register-refresh-task.ps1 - ONE-TIME: registers the local 15-min SideShift refresh.
# Run once (normal PowerShell, no admin needed for a user task):
#   powershell -ExecutionPolicy Bypass -File scripts\register-refresh-task.ps1
$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\Users\julia\OneDrive\Desktop\ugc-command-center\scripts\refresh-local.ps1"'
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'UGC-Dashboard-Refresh' -Action $action -Trigger $trigger -Settings $settings -Description 'Polls SideShift + refreshes UGC dashboard data every 15 min while PC is on' -Force
Write-Output "Registered task 'UGC-Dashboard-Refresh' (every 15 min)."