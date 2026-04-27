const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get changed test files from git diff
 */
function getChangedTestFiles(baseRef, headRef) {
    try {
        const diff = execSync(
            `git diff ${baseRef}..${headRef} --name-only`,
            { encoding: 'utf8' }
        );
        
        const files = diff.split('\n')
            .filter(f => f.trim().length > 0)
            .filter(f => f.includes('/webapp/test/unit/') && (f.endsWith('.js') || f.endsWith('.test.js')))
            .filter(f => {
                const fileName = path.basename(f);
                const excludePatterns = [
                    'unitTests.qunit.js',
                    'AllTests.js',
                    'wdioTestRunner.js',
                    'wdio.conf.js',
                    'testsuite.qunit.js'
                ];
                return !excludePatterns.includes(fileName);
            });
        
        return files;
    } catch (error) {
        console.error('Error getting changed files:', error.message);
        return [];
    }
}

/**
 * Get changed source files from git diff (for coverage filtering)
 * Includes both directly modified source files AND source files tested by changed test files
 */
function getChangedSourceFiles(baseRef, headRef, changedTestFiles) {
    try {
        const diff = execSync(
            `git diff ${baseRef}..${headRef} --name-only`,
            { encoding: 'utf8' }
        );
        
        // Get directly modified source files
        const modifiedSourceFiles = diff.split('\n')
            .filter(f => f.trim().length > 0)
            .filter(f => f.includes('/webapp/') && f.endsWith('.js'))
            .filter(f => {
                // Include controller, model, and Component.js files
                return f.includes('/controller/') || 
                       f.includes('/model/') || 
                       f.endsWith('/Component.js');
            })
            .filter(f => {
                // Exclude test files
                return !f.includes('/test/');
            });
        
        // Map changed test files to their corresponding source files
        const inferredSourceFiles = changedTestFiles.map(testFile => {
            // Convert test path to source path
            // e.g., project1/webapp/test/unit/controller/App.controller.js
            //    -> project1/webapp/controller/App.controller.js
            if (testFile.includes('/test/unit/controller/')) {
                return testFile.replace('/test/unit/controller/', '/controller/');
            } else if (testFile.includes('/test/unit/model/')) {
                return testFile.replace('/test/unit/model/', '/model/');
            } else if (testFile.includes('/test/unit/') && testFile.endsWith('Component.js')) {
                return testFile.replace('/test/unit/', '/');
            }
            return null;
        }).filter(f => f !== null);
        
        // Combine and deduplicate
        const allSourceFiles = [...new Set([...modifiedSourceFiles, ...inferredSourceFiles])];
        
        // Verify files exist and format output WITH line ranges
        const result = allSourceFiles
            .filter(f => {
                try {
                    return fs.existsSync(f);
                } catch (e) {
                    return false;
                }
            })
            .map(f => {
                // Extract project name
                const projectName = f.split('/')[0];
                // Get relative path from webapp
                const webappIndex = f.indexOf('/webapp/');
                const relativePath = webappIndex >= 0 ? f.substring(webappIndex + 8) : f;
                
                // Get changed line ranges for directly modified files
                let changedRanges = [];
                if (modifiedSourceFiles.includes(f)) {
                    changedRanges = getChangedLineRanges(f, baseRef, headRef);
                }
                
                return {
                    project: projectName,
                    file: relativePath,
                    fullPath: f,
                    changedRanges: changedRanges,
                    isDirect: modifiedSourceFiles.includes(f) // true if directly modified, false if inferred from tests
                };
            });
        
        return result;
    } catch (error) {
        console.error('Error getting changed source files:', error.message);
        return [];
    }
}

/**
 * Get changed line ranges from git diff
 */
function getChangedLineRanges(filePath, baseRef, headRef) {
    try {
        const diff = execSync(
            `git diff ${baseRef}..${headRef} --unified=0 -- "${filePath}"`,
            { encoding: 'utf8' }
        );
        
        const ranges = [];
        const lines = diff.split('\n');
        const hunkRegex = /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;
        
        lines.forEach(line => {
            const match = line.match(hunkRegex);
            if (match) {
                const start = parseInt(match[1], 10);
                const count = match[2] ? parseInt(match[2], 10) : 1;
                const end = start + count - 1;
                ranges.push({ start, end });
            }
        });
        
        return ranges;
    } catch (error) {
        return [];
    }
}

/**
 * Extract module name and changed tests from a test file
 */
function extractModuleAndTests(filePath, baseRef, headRef) {
    try {
        console.log(`[extract-modules] Reading file: ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`[extract-modules] File size: ${content.length} bytes`);
        
        // Extract module name
        const moduleMatch = content.match(/QUnit\.module\s*\(\s*["']([^"']+)["']/);
        if (!moduleMatch) {
            console.warn(`[extract-modules] ⚠ Warning: No QUnit.module found in ${filePath}`);
            return null;
        }
        
        const moduleName = moduleMatch[1];
        console.log(`[extract-modules] ✓ Found module: "${moduleName}"`);
        
        // Get changed line ranges
        const changedRanges = getChangedLineRanges(filePath, baseRef, headRef);
        console.log(`[extract-modules] Changed line ranges:`, changedRanges);
        
        // Extract all tests with their line numbers
        const tests = [];
        const testRegex = /QUnit\.test\s*\(\s*["']([^"']+)["']\s*,\s*function/g;
        let testMatch;
        
        while ((testMatch = testRegex.exec(content)) !== null) {
            const testName = testMatch[1];
            const beforeMatch = content.substring(0, testMatch.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            // Check if this test is affected by changes
            // Handle both additions (start <= end) and deletions (start > end)
            // Also check within a 5-line buffer around changes
            const isChanged = changedRanges.length === 0 || 
                            changedRanges.some(range => {
                                // For deletions (start > end), check if test is near the deletion point
                                if (range.start > range.end) {
                                    return Math.abs(lineNumber - range.start) <= 5;
                                }
                                // For additions/modifications, check if line is within or near the range
                                return (lineNumber >= range.start - 5 && lineNumber <= range.end + 5);
                            });
            
            console.log(`[extract-modules]   Test: "${testName}" at line ${lineNumber} - ${isChanged ? 'CHANGED' : 'unchanged'}`);
            
            tests.push({
                name: testName,
                line: lineNumber,
                changed: isChanged
            });
        }
        
        console.log(`[extract-modules] ✓ Found ${tests.length} tests total, ${tests.filter(t => t.changed).length} changed`);
        
        return {
            module: moduleName,
            tests: tests,
            changedTests: tests.filter(t => t.changed).map(t => t.name)
        };
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Main function
 */
function main() {
    const baseRef = process.env.GIT_BASE_REF || 'HEAD~1';
    const headRef = process.env.GIT_HEAD_REF || 'HEAD';
    
    console.log('[extract-modules] ========================================');
    console.log('[extract-modules] Starting module extraction...');
    console.log(`[extract-modules] Extracting modules from ${baseRef}..${headRef}`);
    console.log('[extract-modules] ========================================\n');
    
    const changedFiles = getChangedTestFiles(baseRef, headRef);
    const changedSourceFiles = getChangedSourceFiles(baseRef, headRef, changedFiles);
    
    console.log(`[extract-modules] Changed test files detected: ${changedFiles.length}`);
    console.log(`[extract-modules] Changed/inferred source files detected: ${changedSourceFiles.length}\n`);
    
    if (changedFiles.length === 0 && changedSourceFiles.length === 0) {
        console.log('[extract-modules] No test or source files changed.');
        fs.writeFileSync('ui-modules-to-test.json', JSON.stringify({ changedSourceFiles: [] }, null, 2));
        console.log('[extract-modules] ✓ Created empty ui-modules-to-test.json');
        process.exit(0);
    }
    
    console.log(`[extract-modules] Found ${changedFiles.length} changed test file(s):\n`);
    
    const projectModules = {};
    
    changedFiles.forEach(file => {
        console.log(`[extract-modules] ========================================`);
        console.log(`[extract-modules] Processing: ${file}`);
        
        // Extract project name (first folder segment)
        const projectName = file.split('/')[0];
        console.log(`[extract-modules] Project: ${projectName}`);
        
        const moduleInfo = extractModuleAndTests(file, baseRef, headRef);
        
        if (moduleInfo) {
            if (!projectModules[projectName]) {
                projectModules[projectName] = [];
                console.log(`[extract-modules] Created new project entry: ${projectName}`);
            }
            
            projectModules[projectName].push({
                file: file,
                module: moduleInfo.module,
                changedTests: moduleInfo.changedTests,
                allTests: moduleInfo.tests.map(t => t.name)
            });
            
            console.log(`[extract-modules] ✓ Module: "${moduleInfo.module}"`);
            console.log(`[extract-modules] ✓ Changed tests: ${moduleInfo.changedTests.length}`);
            console.log(`[extract-modules] ✓ Total tests: ${moduleInfo.tests.length}`);
        } else {
            console.log(`[extract-modules] ✗ Failed to extract module info`);
        }
        console.log('');
    });
    
    // Add changed source files to output
    projectModules.changedSourceFiles = changedSourceFiles;
    
    // Write output
    console.log('[extract-modules] ========================================');
    console.log('[extract-modules] Writing output...');
    const outputJson = JSON.stringify(projectModules, null, 2);
    console.log('[extract-modules] Output JSON:');
    console.log(outputJson);
    fs.writeFileSync('ui-modules-to-test.json', outputJson);
    
    console.log('[extract-modules] ✓ Created ui-modules-to-test.json');
    console.log(`[extract-modules] ✓ Projects with changes: ${Object.keys(projectModules).filter(k => k !== 'changedSourceFiles').join(', ')}`);
    console.log(`[extract-modules] ✓ Changed source files: ${changedSourceFiles.length}`);
    console.log('[extract-modules] ========================================');
}

main();
