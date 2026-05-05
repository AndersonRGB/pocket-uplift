param(
  [int]$Port = 4173
)

node (Join-Path $PSScriptRoot "dev-server.js") $Port
