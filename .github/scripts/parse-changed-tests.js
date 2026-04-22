const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get the git diff for a specific file to find changed line ranges
 * @param {string} filePath - Path to the file
 * @param {string} baseRef - Base ref (e.g., PR base sha)
 * @param {string} headRef - Head ref (e.g., PR head sha)
 * @returns {Array} Array of changed line ranges {start, end}
 */
function getChangedLineRanges(filePath, baseRef, headRef) {
    try {
        // Get unified diff with line numbers
        // -U0 shows only changed lines (no context)
        let diff;
        
        // For local testing: if comparing HEAD to working directory
        if (headRef === 'WORKING_DIR') {
            diff = execSync(
                `git diff ${baseRef} -- "${filePath}"`,
                { encoding: 'utf8' }
            );
        } else {
            diff = execSync(
                `git diff ${baseRef}..${headRef} --unified=0 -- "${filePath}"`,
                { encoding: 'utf8' }
            );
        }
        
        const ranges = [];
        const lines = diff.split('\n');
        
        // Parse diff hunks to find changed line numbers
        // Format: @@ -old_start,old_count +new_start,new_count @@
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
        console.warn(`Warning: Could not get diff for ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Check if a line number falls within any changed range
 * @param {number} lineNum - Line number to check
 * @param {Array} ranges - Array of {start, end} ranges
 * @returns {boolean} True if line is in a changed range
 */
function isLineChanged(lineNum, ranges) {
    return ranges.some(range => lineNum >= range.start && lineNum <= range.end);
}

/**
 * Parse a QUnit test file to extract module and test names (only changed tests)
 * @param {string} filePath - Path to the test file
 * @param {Array} changedRanges - Array of changed line ranges
 * @returns {Array} Array of {module, test} objects for changed tests only
 */
function parseTestFile(filePath, changedRanges) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const tests = [];
        
        // Extract module name
        const moduleMatch = content.match(/QUnit\.module\s*\(\s*["']([^"']+)["']/);
        if (!moduleMatch) {
            console.warn(`Warning: No QUnit.module found in ${filePath}`);
            return tests;
        }
        
        const moduleName = moduleMatch[1];
        
        // Extract all test names with their line numbers
        // Pattern matches: QUnit.test("test name", function...
        const testRegex = /QUnit\.test\s*\(\s*["']([^"']+)["']\s*,\s*function/g;
        let testMatch;
        
        while ((testMatch = testRegex.exec(content)) !== null) {
            const testName = testMatch[1];
            
            // Find which line this test is on
            const beforeMatch = content.substring(0, testMatch.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            // Only include if this test declaration is in a changed line range
            if (changedRanges.length === 0 || isLineChanged(lineNumber, changedRanges)) {
                tests.push({
                    module: moduleName,
                    test: testName
                });
                console.log(`    ✓ Test at line ${lineNumber}: "${testName}" (CHANGED)`);
            } else {
                console.log(`    ○ Test at line ${lineNumber}: "${testName}" (unchanged, skipped)`);
            }
        }
        
        if (tests.length === 0 && changedRanges.length > 0) {
            console.warn(`Warning: No tests found in changed lines of ${filePath}`);
        }
        
        return tests;
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Extract project/folder name from a file path
 * @param {string} filePath - Path to the file
 * @returns {string|null} Project name or null if not found
 */
function extractProjectName(filePath) {
    // Extract the root folder name (first segment of the path)
    // Examples:
    //   "myapp/webapp/test/unit/controller/App.js" -> "myapp"
    //   "frontend/webapp/test/unit/App.js" -> "frontend"
    //   "project1/webapp/test/unit/controller/View.js" -> "project1"
    const parts = filePath.split('/');
    return parts.length > 0 ? parts[0] : null;
}

/**
 * Check if a file is a valid unit test file
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if it's a valid test file
 */
function isValidTestFile(filePath) {
    // Must be a JavaScript file in webapp/test/unit path
    if (!filePath.includes('/webapp/test/unit/') || !filePath.endsWith('.js')) {
        return false;
    }
    
    // Exclude bootstrap/config files
    const excludePatterns = [
        'unitTests.qunit.js',
        'AllTests.js',
        'wdioTestRunner.js',
        'wdio.conf.js',
        'testsuite.qunit.js'
    ];
    
    const fileName = path.basename(filePath);
    return !excludePatterns.includes(fileName);
}

/**
 * Main function to parse changed test files and generate project-specific test lists
 */
function main() {
    const changedFilesPath = 'changed-test-files.json';
    
    // Get git refs from environment variables (set by workflow)
    // For local testing: set GIT_HEAD_REF=WORKING_DIR to compare against unstaged changes
    const baseRef = process.env.GIT_BASE_REF || 'HEAD~1';
    const headRef = process.env.GIT_HEAD_REF || 'HEAD';
    
    if (headRef === 'WORKING_DIR') {
        console.log(`Comparing ${baseRef} vs working directory changes\n`);
    } else {
        console.log(`Comparing ${baseRef}..${headRef}\n`);
    }
    
    if (!fs.existsSync(changedFilesPath)) {
        console.log('No changed test files found.');
        process.exit(0);
    }
    
    let changedFiles;
    try {
        let fileContent = fs.readFileSync(changedFilesPath, 'utf8');
        
        // Remove BOM (Byte Order Mark) if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1);
        }
        
        changedFiles = JSON.parse(fileContent);
        
        if (!Array.isArray(changedFiles)) {
            console.error('Error: changed-test-files.json is not an array');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error reading or parsing changed-test-files.json:', error.message);
        process.exit(1);
    }
    
    if (changedFiles.length === 0) {
        console.log('No changed test files to parse.');
        process.exit(0);
    }
    
    console.log(`Parsing ${changedFiles.length} changed file(s)...`);
    
    // Filter for valid test files
    const validTestFiles = changedFiles.filter(file => {
        const isValid = isValidTestFile(file);
        if (!isValid) {
            console.log(`Skipping non-test file: ${file}`);
        }
        return isValid;
    });
    
    if (validTestFiles.length === 0) {
        console.log('No valid unit test files found after filtering.');
        process.exit(0);
    }
    
    console.log(`Found ${validTestFiles.length} valid test file(s) to parse...`);
    
    // Dynamically discover projects from changed files
    const projectTests = {};
    
    validTestFiles.forEach(file => {
        // Extract project name from path (first folder segment)
        const projectName = extractProjectName(file);
        
        if (!projectName) {
            console.warn(`Warning: Could not determine project for file ${file}`);
            return;
        }
        
        // Initialize project array if not exists
        if (!projectTests[projectName]) {
            projectTests[projectName] = [];
            console.log(`\nDiscovered project/folder: ${projectName}`);
        }
        
        console.log(`\nParsing ${file}...`);
        
        // Get changed line ranges for this file
        const changedRanges = getChangedLineRanges(file, baseRef, headRef);
        if (changedRanges.length > 0) {
            console.log(`  Changed line ranges: ${JSON.stringify(changedRanges)}`);
        } else {
            console.log(`  No diff information available, including all tests`);
        }
        
        // Parse only tests in changed ranges
        const tests = parseTestFile(file, changedRanges);
        
        if (tests.length > 0) {
            console.log(`\n  ✓ Found ${tests.length} CHANGED test(s) in module "${tests[0].module}"`);
            projectTests[projectName].push(...tests);
        } else {
            console.log(`\n  ⚠ No changed tests found in this file`);
        }
    });
    
    // Write project-specific test files
    Object.keys(projectTests).forEach(projectName => {
        const tests = projectTests[projectName];
        const outputFile = `${projectName}-tests.json`;
        
        fs.writeFileSync(outputFile, JSON.stringify(tests, null, 2));
        
        if (tests.length > 0) {
            console.log(`\n✓ Created ${outputFile} with ${tests.length} test(s)`);
        } else {
            console.log(`\n✓ Created ${outputFile} (empty - no changes in this project)`);
        }
    });
    
    // Write list of projects with changes (for workflow iteration)
    const projectsWithChanges = Object.keys(projectTests).filter(
        projectName => projectTests[projectName].length > 0
    );
    fs.writeFileSync('projects-with-changes.txt', projectsWithChanges.join('\n'));
    console.log(`\n✓ Projects with test changes: ${projectsWithChanges.join(', ') || 'none'}`);
    
    // Summary
    const totalTests = Object.values(projectTests).reduce((sum, tests) => sum + tests.length, 0);
    console.log(`✓ Total tests to run: ${totalTests}`);
    
    if (totalTests === 0) {
        console.log('⚠ Warning: No tests were extracted. Tests may still run with default filter.');
    }
}

// Run the script
main();
