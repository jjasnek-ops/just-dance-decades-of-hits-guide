param([ValidateSet('State','MigrateNameservers','BindPages')][string]$Phase='State')
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$VerbosePreference='SilentlyContinue'
$DebugPreference='SilentlyContinue'
$domain='justdancedecadesofhitsguide.wiki'
$project='just-dance-decades-of-hits-guide'
$accountId='e26c192b02bb6ba662ec2e8a64a2c3a7'
$logPath='reports/domain-connect-operations.json'
New-Item -ItemType Directory -Force reports | Out-Null
$operations=[Collections.Generic.List[object]]::new()
if (Test-Path $logPath) { foreach ($item in @(Get-Content $logPath -Raw | ConvertFrom-Json)) { $operations.Add($item) } }
function Credential([string]$Name) {
  $value=[Environment]::GetEnvironmentVariable($Name,'Process')
  if (-not $value) { $value=[Environment]::GetEnvironmentVariable($Name,'User') }
  if (-not $value) { throw "$Name MISSING" }
  return $value
}
$cfHeaders=@{Authorization=('Bearer '+(Credential 'CLOUDFLARE_API_TOKEN'))}
$shipHeaders=@{'X-API-Key'=(Credential 'SPACESHIP_API_KEY');'X-API-Secret'=(Credential 'SPACESHIP_API_SECRET')}
function Api([string]$Service,[string]$Method,[string]$Path,$Body=$null) {
  $base='https://api.cloudflare.com/client/v4'; $headers=$cfHeaders
  if ($Service -eq 'Spaceship') { $base='https://spaceship.dev/api/v1'; $headers=$shipHeaders }
  $http=0; $success=$false
  try {
    $params=@{Uri=($base+$Path);Method=$Method;Headers=$headers;UseBasicParsing=$true;TimeoutSec=30}
    if ($null -ne $Body) { $params.ContentType='application/json'; $params.Body=($Body | ConvertTo-Json -Depth 12 -Compress) }
    $response=Invoke-WebRequest @params
    $http=[int]$response.StatusCode
    $data=$null
    if ($response.Content) { $data=$response.Content | ConvertFrom-Json }
    if ($Service -eq 'Cloudflare' -and -not $data.success) { throw 'API_FAILURE' }
    $success=$true
    if ($Service -eq 'Cloudflare') { return $data.result }
    return $data
  } catch {
    if ($_.Exception.Response) { $http=[int]$_.Exception.Response.StatusCode }
    throw "BLOCKED: $Service $Method $Path HTTP $http. Corresponding operation stopped."
  } finally {
    $operations.Add(@{at=[DateTimeOffset]::UtcNow.ToString('o');service=$Service;method=$Method;path=$Path;http=$http;success=$success;changed=($success -and $Method -ne 'GET')})
    ConvertTo-Json -InputObject @($operations.ToArray()) -Depth 12 | Set-Content $logPath -Encoding utf8
  }
}
$zones=@(Api 'Cloudflare' 'GET' "/zones?name=$domain")
if ($zones.Count -ne 1) { throw 'BLOCKED: exact target zone missing or ambiguous' }
$zone=$zones[0]
if ($zone.name -ne $domain -or $zone.account.id -ne $accountId) { throw 'BLOCKED: target zone identity mismatch' }
$pages=Api 'Cloudflare' 'GET' "/accounts/$accountId/pages/projects/$project"
if ($pages.name -ne $project) { throw 'BLOCKED: target Pages identity mismatch' }
$registrar=Api 'Spaceship' 'GET' "/domains/$domain"
if ($registrar.name -ne $domain) { throw 'BLOCKED: registrar domain identity mismatch' }
$dns=@(Api 'Cloudflare' 'GET' "/zones/$($zone.id)/dns_records?per_page=500")
$bindings=@(Api 'Cloudflare' 'GET' "/accounts/$accountId/pages/projects/$project/domains")
$stamp=[DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ')
$snapshot=@{at=[DateTimeOffset]::UtcNow.ToString('o');domain=$domain;zone_id=$zone.id;zone_status=$zone.status;cloudflare_nameservers=$zone.name_servers;registrar_nameservers=$registrar.nameservers;pages_project=$pages.name;pages_host=$pages.subdomain;dns_records=@($dns | Select-Object id,type,name,content,ttl,proxied);bindings=@($bindings | Select-Object name,status,verification_data,validation_data)}
$snapshot | ConvertTo-Json -Depth 12 | Set-Content "reports/domain-connect-state-$stamp.json" -Encoding utf8
if ($Phase -eq 'MigrateNameservers') {
  $actual=@($zone.name_servers | ForEach-Object { $_.ToLowerInvariant().TrimEnd('.') } | Sort-Object)
  $current=@($registrar.nameservers.hosts | ForEach-Object { $_.ToLowerInvariant().TrimEnd('.') } | Sort-Object)
  if ($actual.Count -ne 2 -or @($actual | Where-Object { $_ -notmatch '\.ns\.cloudflare\.com$' }).Count) { throw 'BLOCKED: unexpected assigned NS' }
  if (($current -join ',') -eq ($actual -join ',')) { Write-Output 'COMPLETED: assigned NS already present; update skipped'; exit 0 }
  if (($current -join ',') -ne 'launch1.spaceship.net,launch2.spaceship.net') { throw 'BLOCKED: current NS changed unexpectedly; no overwrite' }
  $sourceDns=Api 'Spaceship' 'GET' "/dns/records/${domain}?take=500&skip=0"
  $sourceDns | Select-Object total,items | ConvertTo-Json -Depth 12 | Set-Content "reports/spaceship-dns-before-migration-$stamp.json" -Encoding utf8
  if ($sourceDns.total -ne 0 -or $dns.Count -ne 0) { throw 'BLOCKED: existing records need migration review; nothing overwritten' }
  # This gate is evidence generated from fresh direct .wiki and resolver queries.
  # It never changes DNSSEC, and applies only to this already-observed old DS.
  if (-not (Test-Path 'reports/ds-transition-safe.json')) { throw 'BLOCKED: safe DS cache gate not yet present' }
  $gate=Get-Content reports/ds-transition-safe.json -Raw | ConvertFrom-Json
  if ($gate.domain -ne $domain -or -not $gate.safe -or $gate.old_ds_ttl -ne 3600 -or $gate.elapsed_seconds -lt 5400) { throw 'BLOCKED: invalid DS transition gate' }
  # ConvertFrom-Json may produce a UTC DateTime. Casting preserves its Kind;
  # parsing its localized string would silently reinterpret UTC as local time.
  $evidenceAge=([DateTimeOffset]::UtcNow-[DateTimeOffset]$gate.checked_at).TotalSeconds
  if ($evidenceAge -lt 0 -or $evidenceAge -gt 300) { throw 'BLOCKED: DS transition evidence is outside the five-minute window' }
  if (@($gate.authorities).Count -ne 6 -or @($gate.authorities | Where-Object { -not $_.authoritative -or $_.rcode -ne 0 -or $_.ds_count -ne 0 }).Count) { throw 'BLOCKED: authority DS check failed' }
  if (@($gate.resolvers).Count -lt 2 -or @($gate.resolvers | Where-Object { $_.http -ne 200 -or $_.status -ne 0 -or $_.ds_count -ne 0 }).Count) { throw 'BLOCKED: recursive DS check failed' }
  $updated=Api 'Spaceship' 'PUT' "/domains/$domain/nameservers" @{provider='custom';hosts=$actual}
  if ((@($updated.hosts | Sort-Object) -join ',') -ne ($actual -join ',')) { throw 'BLOCKED: NS write returned an unexpected result; verify read-only before retry' }
  Write-Output ('COMPLETED: Spaceship NS updated to '+($actual -join ', '))
}
if ($Phase -eq 'BindPages') {
  if ($zone.status -ne 'active') { throw 'BLOCKED: target zone is not active; no domain or DNS writes' }
  foreach ($hostname in @($domain,"www.$domain")) {
    $existing=@($bindings | Where-Object { $_.name -eq $hostname })
    if ($existing.Count -eq 0) { $null=Api 'Cloudflare' 'POST' "/accounts/$accountId/pages/projects/$project/domains" @{name=$hostname} }
    $records=@(Api 'Cloudflare' 'GET' "/zones/$($zone.id)/dns_records?name=$hostname")
    $routing=@($records | Where-Object { $_.type -in @('A','AAAA','CNAME','NS') })
    if ($routing.Count -gt 0) {
      if ($routing.Count -ne 1 -or $routing[0].type -ne 'CNAME' -or $routing[0].content.TrimEnd('.') -ne $pages.subdomain.TrimEnd('.')) { throw "BLOCKED: conflicting routing record at $hostname; nothing overwritten" }
    } else {
      $null=Api 'Cloudflare' 'POST' "/zones/$($zone.id)/dns_records" @{type='CNAME';name=$hostname;content=$pages.subdomain;ttl=1;proxied=$true;comment='Pages binding for this guide'}
    }
    Write-Output "COMPLETED: Pages binding and DNS present for $hostname"
  }
}
$snapshot | ConvertTo-Json -Depth 12
