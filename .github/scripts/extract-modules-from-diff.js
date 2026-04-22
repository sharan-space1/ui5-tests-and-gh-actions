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
            .filter(f => f.includes('/webapp/test/unit/') && f.endsWith('.js'))
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
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract module name
        const moduleMatch = content.match(/QUnit\.module\s*\(\s*["']([^"']+)["']/);
        if (!moduleMatch) {
            console.warn(`Warning: No QUnit.module found in ${filePath}`);
            return null;
        }
        
        const moduleName = moduleMatch[1];
        
        // Get changed line ranges
        const changedRanges = getChangedLineRanges(filePath, baseRef, headRef);
        
        // Extract all tests with their line numbers
        const tests = [];
        const testRegex = /QUnit\.test\s*\(\s*["']([^"']+)["']\s*,\s*function/g;
        let testMatch;
        
        while ((testMatch = testRegex.exec(content)) !== null) {
            const testName = testMatch[1];
            const beforeMatch = content.substring(0, testMatch.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            const isChanged = changedRanges.length === 0 || 
                            changedRanges.some(range => lineNumber >= range.start && lineNumber <= range.end);
            
            tests.push({
                name: testName,
                line: lineNumber,
                changed: isChanged
            });
        }
        
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
    
    console.log(`Extracting modules from ${baseRef}..${headRef}\n`);
    
    const changedFiles = getChangedTestFiles(baseRef, headRef);
    
    if (changedFiles.length === 0) {
        console.log('No test files changed.');
        fs.writeFileSync('modules-to-test.json', JSON.stringify({}, null, 2));
        process.exit(0);
    }
    
    console.log(`Found ${changedFiles.length} changed test file(s):\n`);
    
    const projectModules = {};
    
    changedFiles.forEach(file => {
        console.log(`Processing: ${file}`);
        
        // Extract project name (first folder segment)
        const projectName = file.split('/')[0];
        
        const moduleInfo = extractModuleAndTests(file, baseRef, headRef);
        
        if (moduleInfo) {
            if (!projectModules[projectName]) {
                projectModules[projectName] = [];
            }
            
            projectModules[projectName].push({
                file: file,
                module: moduleInfo.module,
                changedTests: moduleInfo.changedTests,
                allTests: moduleInfo.tests.map(t => t.name)
            });
            
            console.log(`  Module: "${moduleInfo.module}"`);
            console.log(`  Changed tests: ${moduleInfo.changedTests.length}`);
            console.log(`  Total tests: ${moduleInfo.tests.length}\n`);
        }
    });
    
    // Write output
    fs.writeFileSync('modules-to-test.json', JSON.stringify(projectModules, null, 2));
    
    console.log('✓ Created modules-to-test.json');
    console.log(`✓ Projects with changes: ${Object.keys(projectModules).join(', ')}`);
}

main();
