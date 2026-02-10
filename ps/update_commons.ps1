param (
    [string]$common,
    [string]$version = "latest"
)
npm cache clean --force
if ($common) {
    Write-Output "------------------- update $common commons from version $version -------------------"
    npm i "akeyless-$common-commons@$version"  
    [System.Console]::Beep(1000, 500)
    [System.Console]::Beep(1000, 500)
    exit 1
}
# update all commons if no common is specified
# server
Write-Output "------------------- update server commons... -------------------"
npm i akeyless-server-commons
Write-Output "------------------- server commons have been updatede successfully! -------------------"
# client
Write-Output "------------------- update client commons... -------------------"
npm i akeyless-client-commons
Write-Output "------------------- client commons have been updatede successfully! -------------------"
# types
Write-Output "------------------- update types commons... -------------------"
npm i akeyless-types-commons 
Write-Output "------------------- types commons have been updatede successfully! -------------------"
# assets
Write-Output "------------------- update assets commons... -------------------"
npm i akeyless-assets-commons 
Write-Output "------------------- assets commons have been updatede successfully! -------------------"
[System.Console]::Beep(1000, 500)
[System.Console]::Beep(1000, 500)
# --legacy-peer-deps
