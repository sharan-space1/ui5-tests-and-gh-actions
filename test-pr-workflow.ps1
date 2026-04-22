# Local Test Workflow Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PR Test Workflow - Local Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Set git refs
Write-Host "Step 1: Setting git refs..." -ForegroundColor Yellow
$env:GIT_BASE_REF = "HEAD~1"
$env:GIT_HEAD_REF = "HEAD"
Write-Host "  Comparing HEAD~1..HEAD" -ForegroundColor Gray
Write-Host ""

# 2. Extract modules from git diff
Write-Host "Step 2: Extracting modules from git diff..." -ForegroundColor Yellow
node .github/scripts/extract-modules-from-diff.js
Write-Host ""

# 3. Check if modules were found
if (!(Test-Path "modules-to-test.json")) {
    Write-Host "No test file changes detected" -ForegroundColor Red
    exit 0
}

$modulesContent = Get-Content "modules-to-test.json" -Raw
$modules = $modulesContent | ConvertFrom-Json

if ($modules.PSObject.Properties.Count -eq 0) {
    Write-Host "No test file changes detected" -ForegroundColor Red
    Remove-Item "modules-to-test.json" -Force
    exit 0
}

Write-Host "Step 3: Displaying detected modules..." -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Modules to Test" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$modules.PSObject.Properties | ForEach-Object {
    $project = $_.Name
    Write-Host "Project: $project" -ForegroundColor Yellow
    
    $_.Value | ForEach-Object {
        Write-Host "  Module: $($_.module)" -ForegroundColor White
        Write-Host "     Changed tests: $($_.changedTests.Count)" -ForegroundColor Gray
        Write-Host "     Total tests: $($_.allTests.Count)" -ForegroundColor Gray
        if ($_.changedTests.Count -gt 0) {
            Write-Host "     Changed:" -ForegroundColor Gray
            $_.changedTests | ForEach-Object {
                Write-Host "       - $_" -ForegroundColor DarkGray
            }
        }
    }
    Write-Host ""
}

# 4. Run tests for each project
Write-Host ""
Write-Host "Step 4: Running tests..." -ForegroundColor Yellow
Write-Host ""

$modules.PSObject.Properties | ForEach-Object {
    $project = $_.Name
    $moduleList = ($_.Value | ForEach-Object { $_.module }) -join ","
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Testing: $project" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Modules: $moduleList" -ForegroundColor Gray
    Write-Host ""
    
    Push-Location $project
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm ci | Out-Null
    
    # Set environment variable
    $env:TEST_MODULES_LIST = $moduleList
    
    # Run tests
    Write-Host "Running tests..." -ForegroundColor Gray
    Write-Host ""
    npm run unit-test-headless 2>&1 | Tee-Object -FilePath "..\$project-test-output.log"
    
    Pop-Location
    Write-Host ""
}

# 5. Parse results
Write-Host ""
Write-Host "Step 5: Parsing test results..." -ForegroundColor Yellow
node .github/scripts/parse-qunit-results.js
Write-Host ""

# 6. Show PR comment
if (Test-Path "pr-comment.md") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "Generated PR Comment" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    
    Get-Content "pr-comment.md"
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Local Test Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Cleanup prompt
Write-Host ""
Write-Host "Clean up generated files? (y/N): " -ForegroundColor Yellow -NoNewline
$cleanup = Read-Host

if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Remove-Item modules-to-test.json, *-test-output.log, pr-comment.md -Force -ErrorAction SilentlyContinue
    Write-Host "Cleaned up test files" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Generated files kept:" -ForegroundColor Gray
    Write-Host "  - modules-to-test.json" -ForegroundColor Gray
    Write-Host "  - *-test-output.log" -ForegroundColor Gray
    Write-Host "  - pr-comment.md" -ForegroundColor Gray
    Write-Host ""
}
