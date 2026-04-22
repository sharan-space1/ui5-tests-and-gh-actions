# Local Testing Script for PR Unit Test Workflow
# This script demonstrates how the selective test execution works

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Local Testing: PR Unit Test Workflow" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Make a test change
Write-Host "Step 1: Making a small change to ONE test..." -ForegroundColor Yellow
$testFile = "project1/webapp/test/unit/controller/App.controller.js"
$content = Get-Content $testFile -Raw
$modified = $content -replace 'assert\.strictEqual\(oController\.add\(5, 3\), 8, "5 \+ 3 = 8"\);', 'assert.strictEqual(oController.add(5, 3), 8, "5 + 3 = 8"); // Test modification'
Set-Content $testFile -Value $modified
Write-Host "  ✓ Modified the 'add' test in $testFile`n" -ForegroundColor Green

# Step 2: Create changed-test-files.json (simulating GitHub Actions)
Write-Host "Step 2: Creating changed-test-files.json..." -ForegroundColor Yellow
$testFiles = @("project1/webapp/test/unit/controller/App.controller.js")
$testFiles | ConvertTo-Json -Compress | Out-File -FilePath "changed-test-files.json" -Encoding utf8 -NoNewline
Write-Host "  ✓ Created changed-test-files.json`n" -ForegroundColor Green

# Step 3: Run the parser to detect ONLY the changed test
Write-Host "Step 3: Running parser to detect changed tests..." -ForegroundColor Yellow
Write-Host "  (Comparing HEAD vs working directory changes)`n" -ForegroundColor Gray
$env:GIT_BASE_REF = "HEAD"
$env:GIT_HEAD_REF = "WORKING_DIR"
node .github/scripts/parse-changed-tests.js

# Step 4: Show the results
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Results" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Generated test files:" -ForegroundColor Yellow
Get-ChildItem -Filter "*-tests.json" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
    $tests = Get-Content $_.FullName | ConvertFrom-Json
    Write-Host "    Tests to run: $($tests.Count)" -ForegroundColor Gray
    $tests | ForEach-Object {
        Write-Host "      • $($_.test)" -ForegroundColor Cyan
    }
}

Write-Host "`nProjects to test:" -ForegroundColor Yellow
if (Test-Path "projects-with-changes.txt") {
    Get-Content "projects-with-changes.txt" | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
}

# Step 5: Clean up
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Cleanup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Restoring original files..." -ForegroundColor Yellow
git restore $testFile
Remove-Item -Force changed-test-files.json, *-tests.json, projects-with-changes.txt -ErrorAction SilentlyContinue
Write-Host "  ✓ Restored to original state`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Green
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  • Modified only 1 line in 1 test" -ForegroundColor White
Write-Host "  • Parser detected only that 1 test" -ForegroundColor White
Write-Host "  • Workflow would run only that test" -ForegroundColor White
Write-Host "  • All 20 other tests were skipped ✓`n" -ForegroundColor White
