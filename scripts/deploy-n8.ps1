param(
    [string]$ApiUrl = 'https://n8n.srv1423627.hstgr.cloud',
    [string]$WorkflowPath = 'n8n/workflows/taskforge-agent-pipeline.json'
)

function Prompt-ForSecret($prompt) {
    Write-Host $prompt -NoNewline
    $sec = Read-Host -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

if (-not (Test-Path $WorkflowPath)) {
    Write-Error "Arquivo de workflow não encontrado: $WorkflowPath"
    exit 1
}

$apiKey = $env:N8N_API_KEY
if (-not $apiKey) {
    $apiKey = Prompt-ForSecret "Cole sua N8N API Key (entrada oculta): "
}

try {
    $body = Get-Content -Raw -Path $WorkflowPath
    $candidates = @(
        "$ApiUrl/workflows",
        "$ApiUrl/rest/workflows",
        "$ApiUrl/api/v1/workflows",
        "$ApiUrl/v1/workflows"
    )

    $headerVariants = @(
        @{ Authorization = "Bearer $apiKey"; 'Content-Type' = 'application/json' },
        @{ 'X-N8N-API-KEY' = $apiKey; 'Content-Type' = 'application/json' }
    )

    $success = $false
    foreach ($uri in $candidates) {
        foreach ($hdr in $headerVariants) {
            try {
                Write-Host "Tentando enviar workflow para $uri com cabeçalho: $((($hdr.Keys) -join ',')) ..."
                $resp = Invoke-RestMethod -Uri $uri -Method Post -Headers $hdr -Body $body -ErrorAction Stop
                if ($resp) {
                    if ($resp.id) { Write-Host "Deploy realizado com sucesso. Workflow ID: $($resp.id)" }
                    else { Write-Host "Resposta do servidor:"; $resp | ConvertTo-Json -Depth 5 }
                } else {
                    Write-Host "Sem corpo de resposta, status assumido como sucesso para $uri"
                }
                $success = $true
                break
            } catch {
                $err = $_
                $status = $null
                try { $status = $_.Exception.StatusCode } catch { }
                if ($status -eq 404) {
                    Write-Host "Endpoint $uri não encontrado (404). Tentando próximo..."
                    break # sair do loop de headers e tentar próximo uri
                } elseif ($status -eq 401 -or $status -eq 403) {
                    Write-Host "Resposta do servidor: HTTP $status (não autorizado). Verifique a API key e o tipo de cabeçalho usado."
                    # não interrompe imediatamente: tenta próxima combinação
                    continue
                } else {
                    throw $_
                }
            }
        }
        if ($success) { break }
    }
    if (-not $success) { throw "Nenhum endpoint/cabeçalho aceitou o workflow (todas as tentativas falharam)." }
} catch {
    Write-Error "Falha no deploy: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        try {
            $resp = $_.Exception.Response
            # resposta pode ser System.Net.Http.HttpResponseMessage ou WebResponse
            if ($resp -is [System.Net.Http.HttpResponseMessage]) {
                try {
                    $status = $resp.StatusCode
                    Write-Host "HTTP Status: $status"
                    $responseBody = $resp.Content.ReadAsStringAsync().Result
                    if ($responseBody) { Write-Host "Response body:"; Write-Host $responseBody }
                } catch {
                    Write-Host "Erro lendo HttpResponseMessage: $($_.Exception.Message)"
                }
            } else {
                $status = $null
                try { $status = $resp.StatusCode } catch { $status = $null }
                $stream = $resp.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                if ($status) { Write-Host "HTTP Status: $status" }
                if ($responseBody) { Write-Host "Response body:"; Write-Host $responseBody }
            }
        } catch {
            Write-Host "Não foi possível ler o corpo da resposta de erro: $($_.Exception.Message)"
        }
    }
    exit 2
}
