const fs = require('fs');

/**
 * Parse QUnit test results from WDIO/QUnit log output
 */
function parseQUnitResults(logContent, moduleName) {
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    const lines = logContent.split('\n');
    
    // Look for QUnit test results
    // Common patterns: "✓ test name" or "✗ test name" or lines with "passed" / "failed"
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Pattern 1: Look for test execution results
        // Example: "    ✓ Test at line 17: "add should return sum of two numbers" (CHANGED)"
        const changedTestMatch = line.match(/[✓✗×]\s+Test at line \d+:\s+"([^"]+)"\s+\(CHANGED\)/);
        if (changedTestMatch) {
            const testName = changedTestMatch[1];
            const isPassed = line.includes('✓');
            
            results.tests.push({
                module: moduleName,
                name: testName,
                status: isPassed ? 'passed' : 'failed',
                message: ''
            });
            
            if (isPassed) results.passed++;
            else results.failed++;
            continue;
        }
        
        // Pattern 2: Standard QUnit output
        // Look for patterns like "✓ testname" or "× testname"
        if (line.trim().match(/^[✓✗×]/)) {
            const testMatch = line.match(/^[\s]*[✓✗×]\s+(.+?)(\s+\(|$)/);
            if (testMatch) {
                const testName = testMatch[1].trim();
                const isPassed = line.includes('✓');
                
                // Extract error message if failed
                let errorMessage = '';
                if (!isPassed) {
                    // Look ahead for error details
                    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                        if (lines[j].includes('Expected') || lines[j].includes('Actual') || lines[j].includes('Error:')) {
                            errorMessage += lines[j].trim() + ' ';
                        }
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
            }
        }
    }
    
    results.total = results.passed + results.failed;
    return results;
}

/**
 * Generate markdown table for PR comment
 */
function generateMarkdownTable(projectModules, allTestResults) {
    let markdown = '## 🧪 Test Results\n\n';
    
    // Calculate summary statistics
    const totalChanged = Object.values(projectModules)
        .flatMap(modules => modules.flatMap(m => m.changedTests)).length;
    
    const changedTests = allTestResults.filter(t => t.changed);
    const changedPassed = changedTests.filter(t => t.status === 'passed').length;
    const changedFailed = changedTests.filter(t => t.status === 'failed').length;
    
    const regressions = allTestResults.filter(t => !t.changed && t.status === 'failed');
    
    markdown += '### Summary\n\n';
    markdown += `- **Changed tests**: ${totalChanged} (✅ ${changedPassed} passed, ❌ ${changedFailed} failed)\n`;
    if (regressions.length > 0) {
        markdown += `- **Regressions**: ${regressions.length} test(s) failed that weren't changed\n`;
    }
    markdown += '\n';
    
    if (changedFailed === 0 && regressions.length === 0) {
        markdown += '✅ **All tests passed!**\n\n';
    } else {
        markdown += '❌ **Some tests failed**\n\n';
    }
    
    // Show only changed tests + failed tests
    const testsToShow = allTestResults.filter(t => t.changed || t.status === 'failed');
    
    if (testsToShow.length > 0) {
        markdown += '### Detailed Results\n\n';
        markdown += '| Project | Module | Test | Status | Type | Details |\n';
        markdown += '|---------|--------|------|--------|------|---------||\n';
        
        testsToShow.forEach(test => {
            const statusIcon = test.status === 'passed' ? '✅' : '❌';
            const type = test.changed ? '🔄 Changed' : '⚠️ Regression';
            const details = test.message ? test.message.substring(0, 100) : '';
            
            markdown += `| ${test.project} | ${test.module} | ${test.name} | ${statusIcon} | ${type} | ${details} |\n`;
        });
        
        markdown += '\n';
    }
    
    // Add collapsible section for modules tested
    markdown += '<details>\n';
    markdown += '<summary>📋 Modules Tested</summary>\n\n';
    
    Object.entries(projectModules).forEach(([project, modules]) => {
        markdown += `**${project}:**\n`;
        modules.forEach(m => {
            markdown += `- ${m.module} (${m.allTests.length} tests total, ${m.changedTests.length} changed)\n`;
        });
        markdown += '\n';
    });
    
    markdown += '</details>\n\n';
    
    markdown += '---\n';
    markdown += `*Updated: ${new Date().toUTCString()}*\n`;
    
    return markdown;
}

/**
 * Main function
 */
function main() {
    // Read modules-to-test.json
    if (!fs.existsSync('modules-to-test.json')) {
        console.error('modules-to-test.json not found');
        process.exit(1);
    }
    
    const projectModules = JSON.parse(fs.readFileSync('modules-to-test.json', 'utf8'));
    
    if (Object.keys(projectModules).length === 0) {
        console.log('No modules to test');
        process.exit(0);
    }
    
    // Read test results from all projects
    const allResults = [];
    
    Object.entries(projectModules).forEach(([project, modules]) => {
        const logFile = `${project}-test-output.log`;
        
        if (fs.existsSync(logFile)) {
            console.log(`Parsing results for ${project}...`);
            const logContent = fs.readFileSync(logFile, 'utf8');
            
            modules.forEach(moduleInfo => {
                console.log(`  Module: ${moduleInfo.module}`);
                
                // Parse results for this module
                const results = parseQUnitResults(logContent, moduleInfo.module);
                
                // Mark which tests were changed
                results.tests.forEach(test => {
                    test.project = project;
                    test.changed = moduleInfo.changedTests.includes(test.name);
                });
                
                console.log(`    Found ${results.tests.length} test results (${results.passed} passed, ${results.failed} failed)`);
                
                allResults.push(...results.tests);
            });
        } else {
            console.warn(`Warning: Log file not found: ${logFile}`);
        }
    });
    
    // Generate markdown
    const markdown = generateMarkdownTable(projectModules, allResults);
    
    // Write to file
    fs.writeFileSync('pr-comment.md', markdown);
    
    console.log('\n✓ Generated PR comment markdown');
    console.log(`✓ Total test results: ${allResults.length}`);
    console.log(`✓ Changed tests: ${allResults.filter(t => t.changed).length}`);
    console.log(`✓ Failed tests: ${allResults.filter(t => t.status === 'failed').length}`);
}

main();
