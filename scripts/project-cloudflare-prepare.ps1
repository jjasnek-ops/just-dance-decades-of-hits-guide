$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$domain='justdancedecadesofhitsguide.wiki'
$project='just-dance-decades-of-hits-guide'
$token=[Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN','Process')
if (-not $token) { $token=[Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN','User') }
if (-not $token) { throw 'CLOUDFLARE_API_TOKEN MISSING' }
$headers=@{Authorization="Bearer $token"}
$operations=[Collections.Generic.List[object]]::new()
function Call-Cf([string]$Method,[string]$Path,$Body=$null) {
  try {
    $params=@{Uri="https://api.cloudflare.com/client/v4$Path";Method=$Method;Headers=$headers;UseBasicParsing=$true;TimeoutSec=30}
    if ($null -ne $Body) { $params.ContentType='application/json'; $params.Body=($Body | ConvertTo-Json -Depth 10 -Compress) }
    $response=Invoke-WebRequest @params
    $data=$response.Content | ConvertFrom-Json
    $operations.Add(@{time=[DateTimeOffset]::UtcNow.ToString('o');method=$Method;path=$Path;http=[int]$response.StatusCode;success=$data.success;changed=($Method -ne 'GET')})
    if (-not $data.success) { throw 'API reported failure' }
    return $data.result
  } catch {
    $code=0; if ($_.Exception.Response) { $code=[int]$_.Exception.Response.StatusCode }
    $operations.Add(@{time=[DateTimeOffset]::UtcNow.ToString('o');method=$Method;path=$Path;http=$code;success=$false;changed=$false})
    $operations | ConvertTo-Json -Depth 8 | Set-Content reports/cloudflare-operations.json -Encoding utf8
    throw "BLOCKED: $Method $Path HTTP $code. No further action on this operation."
  }
}
$accounts=@(Call-Cf 'GET' '/accounts')
$accountId='e26c192b02bb6ba662ec2e8a64a2c3a7'
if (-not ($accounts | Where-Object {$_.id -eq $accountId})) { throw 'Target account not accessible' }
$zones=@(Call-Cf 'GET' "/zones?name=$domain")
if ($zones.Count -gt 1) { throw 'Ambiguous target zone' }
if ($zones.Count -eq 0) {
  $zone=Call-Cf 'POST' '/zones' @{name=$domain;account=@{id=$accountId};type='full'}
} else { $zone=$zones[0] }
if ($zone.name -ne $domain -or $zone.account.id -ne $accountId) { throw 'Target zone identity mismatch' }
$projects=@(Call-Cf 'GET' "/accounts/$accountId/pages/projects")
$match=@($projects | Where-Object {$_.name -eq $project})
if ($match.Count -gt 1) { throw 'Ambiguous Pages project' }
if ($match.Count -eq 0) {
  $pages=Call-Cf 'POST' "/accounts/$accountId/pages/projects" @{name=$project;production_branch='main';build_config=@{build_command='pnpm build';destination_dir='dist';root_dir=''}}
} else { $pages=$match[0] }
$dns=@(Call-Cf 'GET' "/zones/$($zone.id)/dns_records?per_page=100")
$state=@{checked_at=[DateTimeOffset]::UtcNow.ToString('o');account_id=$accountId;domain=$domain;zone_id=$zone.id;zone_status=$zone.status;name_servers=$zone.name_servers;project=$pages.name;pages_url="https://$($pages.subdomain)";production_branch=$pages.production_branch;dns_records=@($dns | ForEach-Object { @{id=$_.id;type=$_.type;name=$_.name;content=$_.content;ttl=$_.ttl;proxied=$_.proxied} })}
$state | ConvertTo-Json -Depth 10 | Set-Content reports/cloudflare-target-state.json -Encoding utf8
$operations | ConvertTo-Json -Depth 8 | Set-Content reports/cloudflare-operations.json -Encoding utf8
$state | ConvertTo-Json -Depth 10
