# Gera o APK do OrganizaFacil.

$ErrorActionPreference = 'Stop'
$origem = $PSScriptRoot
$curto = 'C:\ofa'
$destinoApk = Join-Path (Split-Path $origem -Parent) 'OrganizaFacil.apk'

# JDK: o Gradle do projeto precisa do Java 17 ou 21.
$jdk = Get-ChildItem 'C:\Program Files\Amazon Corretto', 'C:\Program Files\Java', 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Microsoft' -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^jdk-?(17|21)' } | Select-Object -First 1
if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
if (-not $env:JAVA_HOME) { throw 'JDK 17 ou 21 nao encontrado. Instale um e tente de novo.' }

if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not (Test-Path $env:ANDROID_HOME)) { throw "Android SDK nao encontrado em $env:ANDROID_HOME." }

Write-Host "Copiando o projeto para $curto ..."
robocopy $origem $curto /MIR /XD node_modules .expo build .cxx .gradle /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Falha ao copiar o projeto (robocopy $LASTEXITCODE)." }

Set-Location $curto
# Sempre, para pegar dependencias novas; quando nada mudou e rapido.
Write-Host 'Sincronizando dependencias ...'
cmd /c 'npm install --no-audit --no-fund 2>&1'
if ($LASTEXITCODE -ne 0) { throw 'npm install falhou.' }

# Mesmo em C:\ofa alguns caminhos do C++ passam de 260 caracteres. O ninja do
# CMake 3.22.1 (padrao do Android) nao aceita isso; o do CMake 3.31.6 aceita.
$cmakeVersao = '3.31.6'
$cmakeDir = Join-Path $env:ANDROID_HOME "cmake\$cmakeVersao"
if (-not (Test-Path $cmakeDir)) {
  Write-Host "Instalando o CMake $cmakeVersao no Android SDK ..."
  $sdkmanager = Join-Path $env:ANDROID_HOME 'cmdline-tools\latest\bin\sdkmanager.bat'
  if (-not (Test-Path $sdkmanager)) { throw 'sdkmanager nao encontrado. Instale o "Android SDK Command-line Tools" pelo Android Studio.' }
  cmd /c "echo y| `"$sdkmanager`" `"cmake;$cmakeVersao`" 2>&1"
  if (-not (Test-Path $cmakeDir)) { throw "Falha ao instalar o CMake $cmakeVersao." }
}

$sdk = $env:ANDROID_HOME -replace '\\', '/'
$cmake = $cmakeDir -replace '\\', '/'
Set-Content -Path 'android\local.properties' -Value "sdk.dir=$sdk`ncmake.dir=$cmake" -Encoding ascii

Write-Host 'Compilando o APK (a primeira vez demora varios minutos) ...'
$env:NODE_ENV = 'production'
Set-Location 'android'
# Pelo cmd, para que os avisos que o Gradle escreve na saida de erro nao parem o script.
# ".\" e necessario: com NoDefaultCurrentDirectoryInExePath ativo o cmd nao procura na pasta atual.
# x86_64 entra para o APK rodar tambem no emulador.
cmd /c '.\gradlew.bat assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64 --console=plain 2>&1'
if ($LASTEXITCODE -ne 0) { throw 'A compilacao falhou. Veja as mensagens acima.' }

Copy-Item 'app\build\outputs\apk\release\app-release.apk' $destinoApk -Force
Set-Location $origem
Write-Host "APK pronto: $destinoApk"
