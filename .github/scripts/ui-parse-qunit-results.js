const fs = require('fs');

/**
 * Parse QUnit test results from WDIO/QUnit log output
 */
function parseQUnitResults(logContent, moduleName) {
    console.log(`[parseQUnitResults] Parsing results for module: "${moduleName}"`);
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    const lines = logContent.split('\n');
    console.log(`[parseQUnitResults]   Log has ${lines.length} lines`);
    
    // Find the module section in the log
    let inModuleSection = false;
    let moduleFound = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for test results first (has checkmark)
        // WDIO format: [chrome 147.0.7727.57 linux #0-0]    ✓ test name
        // or: [chrome 147.0.7727.57 linux #0-0]    ✖ test name
        const testMatch = line.match(/\[chrome[^\]]+\]\s+(✓|✖)\s+(.+?)$/);
        if (testMatch && inModuleSection) {
            const checkMark = testMatch[1];
            const testName = testMatch[2].trim();
            const isPassed = checkMark === '✓';
            
            console.log(`[parseQUnitResults]     Found test: "${testName}" - ${isPassed ? 'PASSED' : 'FAILED'}`);
            
            // Extract error message if failed
            let errorMessage = '';
            if (!isPassed) {
                // Look back for error details in the WDIO error logs
                // Error format: [0-0] timestamp ERROR wdio-qunit-service: QUnit Test: ModuleName.testName
                // Followed by: Expected:, Received:, Message: lines
                
                let expectedVal = '';
                let receivedVal = '';
                let errorMsg = '';
                let foundErrorBlock = false;
                
                // Search backwards for ERROR wdio-qunit-service messages containing this test
                for (let j = Math.max(0, i - 25); j < i; j++) {
                    const errorLine = lines[j];
                    
                    // Check if this is an ERROR line mentioning our test
                    // The test name appears as "ModuleName.testName" in the error
                    if (errorLine.includes('ERROR wdio-qunit-service') && 
                        (errorLine.includes(testName) || errorLine.includes(`.${testName}`))) {
                        foundErrorBlock = true;
                        
                        // Now collect Expected/Received/Message from following lines
                        for (let k = j + 1; k < Math.min(j + 6, lines.length); k++) {
                            if (lines[k].includes('ERROR wdio-qunit-service: Expected:')) {
                                expectedVal = lines[k].split('Expected:')[1].trim();
                            } else if (lines[k].includes('ERROR wdio-qunit-service: Received:')) {
                                receivedVal = lines[k].split('Received:')[1].trim();
                            } else if (lines[k].includes('ERROR wdio-qunit-service: Message:')) {
                                errorMsg = lines[k].split('Message:')[1].trim();
                            }
                        }
                        break;
                    }
                }
                
                // Build concise error message
                if (errorMsg) errorMessage += errorMsg + ' | ';
                if (expectedVal && receivedVal) {
                    errorMessage += `Expected: ${expectedVal}, Got: ${receivedVal}`;
                } else if (expectedVal) {
                    errorMessage += `Expected: ${expectedVal}`;
                } else if (receivedVal) {
                    errorMessage += `Got: ${receivedVal}`;
                }
            }
            
            results.tests.push({
                module: moduleName,
                name: testName,
                status: isPassed ? 'passed' : 'failed',
                message: errorMessage.trim()
            });
            
            if (isPassed) results.passed++;
            else results.failed++;
            continue;
        }
        
        // WDIO format module header: [chrome 147.0.7727.57 linux #0-0] Module Name
        // This line should NOT have ✓ or ✖ in it
        if (!line.includes('✓') && !line.includes('✖')) {
            const moduleHeaderMatch = line.match(/\[chrome[^\]]+\]\s+(.+?)$/);
            if (moduleHeaderMatch) {
                const lineModuleName = moduleHeaderMatch[1].trim();
                
                // Check if this is our target module
                if (lineModuleName === moduleName) {
                    console.log(`[parseQUnitResults]   ✓ Found module header at line ${i + 1}: "${lineModuleName}"`);
                    inModuleSection = true;
                    moduleFound = true;
                    continue;
                } else if (inModuleSection && lineModuleName && lineModuleName.length > 0) {
                    // We've moved to a different module section, stop parsing
                    // Check if this looks like a module name (not too long, capitalized, etc.)
                    if (lineModuleName.length < 100 && /^[A-Z]/.test(lineModuleName)) {
                        console.log(`[parseQUnitResults]   End of module section at line ${i + 1} (found: "${lineModuleName}")`);
                        break;
                    }
                }
            }
        }
    }
    
    if (!moduleFound) {
        console.log(`[parseQUnitResults]   ⚠ Warning: Module "${moduleName}" not found in log`);
    }
    
    results.total = results.passed + results.failed;
    console.log(`[parseQUnitResults]   ✓ Parsed ${results.total} tests (${results.passed} passed, ${results.failed} failed)`);
    return results;
}

/**
 * Generate markdown table for PR comment
 */
function generateMarkdownTable(projectModules, allTestResults) {
    let markdown = '# 🧪 UI Test Check\n\n';
    
    // Calculate summary statistics
    const totalChanged = Object.entries(projectModules)
        .filter(([key]) => key !== 'changedSourceFiles')
        .flatMap(([, modules]) => modules.flatMap(m => m.changedTests)).length;
    
    const changedTests = allTestResults.filter(t => t.changed);
    const changedPassed = changedTests.filter(t => t.status === 'passed').length;
    const changedFailed = changedTests.filter(t => t.status === 'failed').length;
    
    const regressions = allTestResults.filter(t => !t.changed && t.status === 'failed');
    
    const totalTests = allTestResults.length;
    const totalPassed = allTestResults.filter(t => t.status === 'passed').length;
    const totalFailed = allTestResults.filter(t => t.status === 'failed').length;
    
    // Summary status
    if (changedFailed === 0 && regressions.length === 0) {
        markdown += '## ✅ All Tests Passed\n\n';
    } else {
        markdown += '## ❌ Tests Failed\n\n';
    }
    
    // Total changed summary
    markdown += `### 📊 Summary\n\n`;
    markdown += `- **Total Tests:** ${totalPassed}/${totalTests} passed`;
    if (regressions.length > 0) {
        markdown += ` • ⚠️ ${regressions.length} regression(s)`;
    }
    markdown += `\n- **Changed Tests:** ${changedPassed}/${totalChanged} passed\n\n`;
    
    // Collapsible: Changed Files
    const changedSourceFiles = projectModules.changedSourceFiles || [];
    if (changedSourceFiles.length > 0) {
        markdown += '<details>\n';
        markdown += '<summary>📁 Changed Files (' + changedSourceFiles.length + ')</summary>\n\n';
        changedSourceFiles.forEach(file => {
            markdown += `- \`${file.project}/${file.file}\`\n`;
        });
        markdown += '\n</details>\n\n';
    }
    
    // Collapsible: QUnit Modules
    const modulesList = Object.entries(projectModules)
        .filter(([key]) => key !== 'changedSourceFiles')
        .flatMap(([project, modules]) => 
            modules.map(m => ({ project, ...m }))
        );
    
    if (modulesList.length > 0) {
        markdown += '<details>\n';
        markdown += '<summary>📦 QUnit Modules Tested (' + modulesList.length + ')</summary>\n\n';
        markdown += '| Project | Module | Total Tests | Changed Tests |\n';
        markdown += '|---------|--------|------------:|--------------:|\n';
        modulesList.forEach(mod => {
            markdown += `| ${mod.project} | ${mod.module} | ${mod.allTests.length} | ${mod.changedTests.length} |\n`;
        });
        markdown += '\n</details>\n\n';
    }
    
    // Test Results Table (only changed + failed)
    const testsToShow = allTestResults.filter(t => t.changed || t.status === 'failed');
    
    if (testsToShow.length > 0) {
        markdown += '### 🧪 Test Results\n\n';
        markdown += '| Project | Module | Test | Status | Type |\n';
        markdown += '|---------|--------|------|:------:|------|\n';
        
        testsToShow.forEach(test => {
            const statusIcon = test.status === 'passed' ? '✅' : '❌';
            const type = test.changed ? 'Changed' : 'Regression';
            
            markdown += `| ${test.project} | ${test.module} | ${test.name} | ${statusIcon} | ${type} |\n`;
        });
        
        markdown += '\n';
    }
    
    return markdown;
}

/**
 * Main function
 */
function main() {
    console.log('[parse-qunit-results] ========================================');
    console.log('[parse-qunit-results] Starting results parsing...');
    console.log('[parse-qunit-results] ========================================\n');
    
    // Read ui-modules-to-test.json
    if (!fs.existsSync('ui-modules-to-test.json')) {
        console.error('[parse-qunit-results] ✗ ui-modules-to-test.json not found');
        process.exit(1);
    }
    
    console.log('[parse-qunit-results] Reading ui-modules-to-test.json...');
    const projectModules = JSON.parse(fs.readFileSync('ui-modules-to-test.json', 'utf8'));
    console.log('[parse-qunit-results] Project modules:', JSON.stringify(projectModules, null, 2));
    
    const projectKeys = Object.keys(projectModules).filter(k => k !== 'changedSourceFiles');
    if (projectKeys.length === 0) {
        console.log('[parse-qunit-results] No modules to test');
        process.exit(0);
    }
    
    // Read test results from all projects
    const allResults = [];
    
    console.log('[parse-qunit-results] ========================================');
    console.log('[parse-qunit-results] Processing test results...\n');
    
    Object.entries(projectModules)
        .filter(([key]) => key !== 'changedSourceFiles') // Skip non-project keys
        .forEach(([project, modules]) => {
        const logFile = `${project}-ui-test-output.log`;
        
        console.log(`[parse-qunit-results] Project: ${project}`);
        console.log(`[parse-qunit-results]   Looking for log file: ${logFile}`);
        
        if (fs.existsSync(logFile)) {
            console.log(`[parse-qunit-results]   ✓ Found log file`);
            const logContent = fs.readFileSync(logFile, 'utf8');
            console.log(`[parse-qunit-results]   Log file size: ${logContent.length} bytes`);
            
            modules.forEach(moduleInfo => {
                console.log(`[parse-qunit-results]   Module: ${moduleInfo.module}`);
                console.log(`[parse-qunit-results]     Changed tests: ${moduleInfo.changedTests.join(', ')}`);
                console.log(`[parse-qunit-results]     All tests: ${moduleInfo.allTests.join(', ')}`);
                
                // Parse results for this module
                const results = parseQUnitResults(logContent, moduleInfo.module);
                
                // Mark which tests were changed
                results.tests.forEach(test => {
                    test.project = project;
                    test.changed = moduleInfo.changedTests.includes(test.name);
                    console.log(`[parse-qunit-results]       Test: "${test.name}" - ${test.status} - ${test.changed ? 'CHANGED' : 'unchanged'}`);
                });
                
                console.log(`[parse-qunit-results]     ✓ Found ${results.tests.length} test results (${results.passed} passed, ${results.failed} failed)`);
                
                allResults.push(...results.tests);
            });
        } else {
            console.warn(`[parse-qunit-results]   ⚠ Warning: Log file not found: ${logFile}`);
        }
        console.log('');
    });
    
    // Generate markdown
    console.log('[parse-qunit-results] ========================================');
    console.log('[parse-qunit-results] Generating markdown...');
    const markdown = generateMarkdownTable(projectModules, allResults);
    
    // Write to file
    fs.writeFileSync('ui-pr-comment.md', markdown);
    
    console.log('[parse-qunit-results] ========================================');
    console.log('[parse-qunit-results] Summary:');
    console.log(`[parse-qunit-results]   ✓ Total test results: ${allResults.length}`);
    console.log(`[parse-qunit-results]   ✓ Changed tests: ${allResults.filter(t => t.changed).length}`);
    console.log(`[parse-qunit-results]   ✓ Failed tests: ${allResults.filter(t => t.status === 'failed').length}`);
    console.log('[parse-qunit-results]   ✓ Generated PR comment markdown');
    console.log('[parse-qunit-results] ========================================');
}

main();
