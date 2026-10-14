$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
function Read-Credential([string]$Name) {
  $value = [Environment]::GetEnvironmentVariable($Name, 'Process')
  if (-not $value) { $value = [Environment]::GetEnvironmentVariable($Name, 'User') }
  return $value
}
function Read-Api([string]$Url, [hashtable]$Headers) {
  try {
    $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 30
    return @{status=[int]$response.StatusCode; data=($response.Content | ConvertFrom-Json)}
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{status=$code; data=$null}
  }
}
$domain = 'justdancedecadesofhitsguide.wiki'
$token = Read-Credential 'CLOUDFLARE_API_TOKEN'
$key = Read-Credential 'SPACESHIP_API_KEY'
$secret = Read-Credential 'SPACESHIP_API_SECRET'
$record = [ordered]@{checked_at=[DateTimeOffset]::UtcNow.ToString('o'); domain=$domain; credentials=@{}; write_permissions='WRITE_PERMISSION_UNVERIFIED'; remote_mutations=0}
foreach ($name in @('CLOUDFLARE_API_TOKEN','SPACESHIP_API_KEY','SPACESHIP_API_SECRET')) {
  if (Read-Credential $name) { $record.credentials[$name]='AVAILABLE' } else { $record.credentials[$name]='MISSING' }
}
if ($token) {
  $headers = @{Authorization="Bearer $token"}
  $verify = Read-Api 'https://api.cloudflare.com/client/v4/user/tokens/verify' $headers
  $record.cloudflare_token = @{http=$verify.status; status=$verify.data.result.status}
  $accounts = Read-Api 'https://api.cloudflare.com/client/v4/accounts' $headers
  $record.cloudflare_accounts = @{http=$accounts.status; accounts=@($accounts.data.result | ForEach-Object { @{id=$_.id; name=$_.name} })}
  $zones = Read-Api "https://api.cloudflare.com/client/v4/zones?name=$domain" $headers
  $record.cloudflare_zones = @{http=$zones.status; zones=@($zones.data.result | ForEach-Object { @{id=$_.id; name=$_.name; status=$_.status; account_id=$_.account.id; name_servers=$_.name_servers} })}
  if ($verify.data.result.id) {
    $policy = Read-Api "https://api.cloudflare.com/client/v4/user/tokens/$($verify.data.result.id)" $headers
    $record.cloudflare_permissions = @{http=$policy.status; policies=@($policy.data.result.policies | ForEach-Object { @{effect=$_.effect; permission_groups=@($_.permission_groups | ForEach-Object { $_.name }); resources=$_.resources} })}
  }
  foreach ($zone in $record.cloudflare_zones.zones) {
    $dns = Read-Api "https://api.cloudflare.com/client/v4/zones/$($zone.id)/dns_records?per_page=100" $headers
    $record.dns_records = @{http=$dns.status; records=@($dns.data.result | ForEach-Object { @{id=$_.id; type=$_.type; name=$_.name; content=$_.content; proxied=$_.proxied; ttl=$_.ttl} })}
    $dnssec = Read-Api "https://api.cloudflare.com/client/v4/zones/$($zone.id)/dnssec" $headers
    $record.cloudflare_dnssec = @{http=$dnssec.status; status=$dnssec.data.result.status}
  }
  foreach ($account in $record.cloudflare_accounts.accounts) {
    $pages = Read-Api "https://api.cloudflare.com/client/v4/accounts/$($account.id)/pages/projects" $headers
    $record.pages_projects = @{http=$pages.status; projects=@($pages.data.result | ForEach-Object { @{name=$_.name; subdomain=$_.subdomain; production_branch=$_.production_branch; source_type=$_.source.type} })}
  }
}
if ($key -and $secret) {
  $shipHeaders = @{'X-API-Key'=$key; 'X-API-Secret'=$secret}
  # Current official docs provide GET domain info (includes nameservers), not GET /nameservers.
  $info = Read-Api "https://spaceship.dev/api/v1/domains/$domain" $shipHeaders
  $record.spaceship = @{http=$info.status; name=$info.data.name; nameservers=$info.data.nameservers; lifecycle=$info.data.lifecycleStatus}
}
$publicDns = Read-Api "https://dns.google/resolve?name=$domain&type=DS" @{}
$record.public_ds = @{http=$publicDns.status; dns_status=$publicDns.data.Status; answers=$publicDns.data.Answer}
New-Item -ItemType Directory -Force reports | Out-Null
$record | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath reports/domain-api-preflight.json -Encoding utf8
$record | ConvertTo-Json -Depth 12
