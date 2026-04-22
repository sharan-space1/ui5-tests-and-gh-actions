const fs = require('fs');
const path = require('path');

/**
 * Parse coverage data and filter by changed files
 */
function parseCoverageResults() {
    console.log('[parse-coverage] ========================================');
    console.log('[parse-coverage] Starting coverage result parsing...');
    console.log('[parse-coverage] ========================================\n');

    const modulesData = JSON.parse(fs.readFileSync('modules-to-test.json', 'utf8'));
    const changedSourceFiles = modulesData.changedSourceFiles || [];

    console.log(`[parse-coverage] Changed source files: ${changedSourceFiles.length}`);
    changedSourceFiles.forEach(f => {
        console.log(`[parse-coverage]   - ${f.project}: ${f.file}`);
    });
    console.log('');

    // Group changed files by project
    const filesByProject = {};
    changedSourceFiles.forEach(f => {
        if (!filesByProject[f.project]) {
            filesByProject[f.project] = [];
        }
        filesByProject[f.project].push(f.file);
    });

    const coverageResults = [];

    // Process each project
    Object.keys(filesByProject).forEach(project => {
        const coverageFile = path.join(project, 'tmp', 'coverage-reports', 'json', 'coverage-final.json');
        
        console.log(`[parse-coverage] Processing ${project}...`);
        console.log(`[parse-coverage] Looking for: ${coverageFile}`);

        if (!fs.existsSync(coverageFile)) {
            console.log(`[parse-coverage] ⚠ No coverage file found for ${project}`);
            return;
        }

        const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        console.log(`[parse-coverage] ✓ Coverage file loaded for ${project}`);

        // Filter coverage data for changed files
        filesByProject[project].forEach(file => {
            // Try to find the file in coverage data
            // Coverage keys might have absolute paths or relative paths
            const matchingKeys = Object.keys(coverageData).filter(key => {
                return key.includes(file) || key.endsWith(file);
            });

            if (matchingKeys.length === 0) {
                console.log(`[parse-coverage]   ⚠ No coverage data for ${file}`);
                coverageResults.push({
                    project,
                    file,
                    statements: { pct: 0 },
                    branches: { pct: 0 },
                    functions: { pct: 0 },
                    lines: { pct: 0 },
                    noCoverage: true
                });
                return;
            }

            // Use the first matching key
            const coverageKey = matchingKeys[0];
            const fileCoverage = coverageData[coverageKey];

            // Calculate coverage percentages
            const statements = calculateStatementCoverage(fileCoverage.s);
            const branches = calculateBranchCoverage(fileCoverage.b);
            const functions = calculateFunctionCoverage(fileCoverage.f);
            const lines = calculateLineCoverage(fileCoverage.s, fileCoverage.statementMap);

            console.log(`[parse-coverage]   ✓ ${file}: S:${statements.pct}% B:${branches.pct}% F:${functions.pct}% L:${lines.pct}%`);

            coverageResults.push({
                project,
                file,
                statements,
                branches,
                functions,
                lines
            });
        });

        console.log('');
    });

    return coverageResults;
}

/**
 * Calculate statement coverage
 */
function calculateStatementCoverage(statements) {
    if (!statements || Object.keys(statements).length === 0) {
        return { pct: 0, covered: 0, total: 0 };
    }
    const total = Object.keys(statements).length;
    const covered = Object.values(statements).filter(count => count > 0).length;
    const pct = total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
    return { pct, covered, total };
}

/**
 * Calculate branch coverage
 */
function calculateBranchCoverage(branches) {
    if (!branches || Object.keys(branches).length === 0) {
        return { pct: 0, covered: 0, total: 0 };
    }
    let total = 0;
    let covered = 0;
    
    // Each branch has an array of paths [path1Hits, path2Hits, ...]
    Object.values(branches).forEach(branchPaths => {
        if (Array.isArray(branchPaths)) {
            total += branchPaths.length;
            covered += branchPaths.filter(hits => hits > 0).length;
        }
    });
    
    const pct = total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
    return { pct, covered, total };
}

/**
 * Calculate function coverage
 */
function calculateFunctionCoverage(functions) {
    if (!functions || Object.keys(functions).length === 0) {
        return { pct: 0, covered: 0, total: 0 };
    }
    const total = Object.keys(functions).length;
    const covered = Object.values(functions).filter(count => count > 0).length;
    const pct = total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
    return { pct, covered, total };
}

/**
 * Calculate line coverage from statements
 */
function calculateLineCoverage(statements, statementMap) {
    if (!statements || !statementMap || Object.keys(statements).length === 0) {
        return { pct: 0, covered: 0, total: 0 };
    }
    
    const lineHits = {};
    
    // Map statements to lines
    Object.keys(statements).forEach(stmtId => {
        const stmt = statementMap[stmtId];
        if (stmt && stmt.start && stmt.start.line) {
            const line = stmt.start.line;
            if (!lineHits[line]) {
                lineHits[line] = 0;
            }
            lineHits[line] += statements[stmtId];
        }
    });
    
    const total = Object.keys(lineHits).length;
    const covered = Object.values(lineHits).filter(hits => hits > 0).length;
    const pct = total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0;
    
    return { pct, covered, total };
}

/**
 * Generate markdown table
 */
function generateMarkdownTable(coverageResults) {
    if (!coverageResults || coverageResults.length === 0) {
        return null;
    }

    const lines = [
        '### 📊 Code Coverage',
        '',
        '| Project | File | Statements | Branches | Functions | Lines |',
        '|---------|------|------------|----------|-----------|-------|'
    ];

    coverageResults.forEach(result => {
        const stmtBadge = formatBadge(result.statements);
        const branchBadge = formatBadge(result.branches);
        const fnBadge = formatBadge(result.functions);
        const lineBadge = formatBadge(result.lines);

        const fileName = result.file.length > 40 
            ? '...' + result.file.substring(result.file.length - 37) 
            : result.file;

        lines.push(
            `| ${result.project} | \`${fileName}\` | ${stmtBadge} | ${branchBadge} | ${fnBadge} | ${lineBadge} |`
        );
    });

    lines.push('');
    lines.push('_Coverage for changed files only (Statements / Branches / Functions / Lines)_');
    lines.push('');

    return lines.join('\n');
}

/**
 * Format coverage percentage with badge/color and counts
 */
function formatBadge(coverage) {
    const pct = coverage.pct;
    const counts = `(${coverage.covered}/${coverage.total})`;
    
    if (pct >= 80) {
        return `<nobr>🟢 ${pct}%${counts}</nobr>`;
    } else if (pct >= 50) {
        return `<nobr>🟡 ${pct}%${counts}</nobr>`;
    } else {
        return `<nobr>🔴 ${pct}%${counts}</nobr>`;
    }
}

/**
 * Main function
 */
function main() {
    // Check if modules-to-test.json exists
    if (!fs.existsSync('modules-to-test.json')) {
        console.log('[parse-coverage] No modules-to-test.json found - skipping coverage report');
        addSkipMessage('No test changes detected');
        return;
    }

    const modulesData = JSON.parse(fs.readFileSync('modules-to-test.json', 'utf8'));
    const changedSourceFiles = modulesData.changedSourceFiles || [];

    if (changedSourceFiles.length === 0) {
        console.log('[parse-coverage] No changed source files - skipping coverage report');
        addSkipMessage('No source files changed (only test files modified)');
        return;
    }

    const coverageResults = parseCoverageResults();

    if (!coverageResults || coverageResults.length === 0) {
        console.log('[parse-coverage] No coverage results to report');
        addSkipMessage('Coverage data not available');
        return;
    }

    const markdownTable = generateMarkdownTable(coverageResults);

    if (!markdownTable) {
        console.log('[parse-coverage] Failed to generate markdown table');
        return;
    }

    // Append to pr-comment.md if it exists, otherwise create new
    let existingComment = '';
    if (fs.existsSync('pr-comment.md')) {
        existingComment = fs.readFileSync('pr-comment.md', 'utf8');
        console.log('[parse-coverage] ✓ Appending to existing pr-comment.md');
    } else {
        console.log('[parse-coverage] ✓ Creating new pr-comment.md');
    }

    const updatedComment = existingComment + '\n\n' + markdownTable;
    fs.writeFileSync('pr-comment.md', updatedComment);

    console.log('[parse-coverage] ========================================');
    console.log('[parse-coverage] ✓ Coverage report added to pr-comment.md');
    console.log('[parse-coverage] ========================================');
}

/**
 * Add skip message to pr-comment.md
 */
function addSkipMessage(reason) {
    const skipMessage = [
        '### 📊 Code Coverage',
        '',
        `_Coverage report skipped: ${reason}_`,
        ''
    ].join('\n');

    let existingComment = '';
    if (fs.existsSync('pr-comment.md')) {
        existingComment = fs.readFileSync('pr-comment.md', 'utf8');
    }

    const updatedComment = existingComment + '\n\n' + skipMessage;
    fs.writeFileSync('pr-comment.md', updatedComment);

    console.log('[parse-coverage] ✓ Skip message added to pr-comment.md');
}

main();
