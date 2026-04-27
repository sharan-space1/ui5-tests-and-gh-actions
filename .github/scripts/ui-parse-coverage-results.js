const fs = require('fs');
const path = require('path');

/**
 * Parse coverage data and filter by changed files
 */
function parseCoverageResults() {
    console.log('Parsing coverage results...');
    
    const modulesData = JSON.parse(fs.readFileSync('ui-modules-to-test.json', 'utf8'));
    const changedSourceFiles = modulesData.changedSourceFiles || [];

    changedSourceFiles.forEach(f => {
    });

    const coverageResults = [];

    // Group changed files by project
    const filesByProject = {};
    changedSourceFiles.forEach(f => {
        if (!filesByProject[f.project]) {
            filesByProject[f.project] = [];
        }
        filesByProject[f.project].push(f);
    });

    // Process each project
    Object.keys(filesByProject).forEach(project => {
        const coverageFile = path.join(project, 'tmp', 'coverage-reports', 'json', 'coverage-final.json');
        

        if (!fs.existsSync(coverageFile)) {
            return;
        }

        const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

        // Filter coverage data for changed files
        filesByProject[project].forEach(sourceFile => {
            const file = sourceFile.file;
            
            // Try to find the file in coverage data
            // Coverage keys might have absolute paths or relative paths
            const matchingKeys = Object.keys(coverageData).filter(key => {
                return key.includes(file) || key.endsWith(file);
            });

            if (matchingKeys.length === 0) {
                coverageResults.push({
                    project,
                    file,
                    statements: { pct: 0, covered: 0, total: 0 },
                    branches: { pct: 0, covered: 0, total: 0 },
                    functions: { pct: 0, covered: 0, total: 0 },
                    lines: { pct: 0, covered: 0, total: 0 },
                    noCoverage: true
                });
                return;
            }

            // Use the first matching key
            const coverageKey = matchingKeys[0];
            const fileCoverage = coverageData[coverageKey];

            // Calculate diff coverage - only for changed lines
            const coverage = calculateDiffCoverage(fileCoverage, sourceFile.changedRanges || []);
            
            const statements = coverage.statements;
            const branches = coverage.branches;
            const functions = coverage.functions;
            const lines = coverage.lines;

            const rangeInfo = sourceFile.changedRanges && sourceFile.changedRanges.length > 0 
                ? ` [diff coverage]` 
                : ` [full file]`;
            
            console.log(`  ${file}${rangeInfo} - S:${statements.pct}% B:${branches.pct}% F:${functions.pct}% L:${lines.pct}%`);

            coverageResults.push({
                project,
                file,
                statements,
                branches,
                functions,
                lines
            });
        });

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
 * Check if a line is within any of the changed ranges
 */
function isLineInChangedRanges(line, ranges) {
    if (!ranges || ranges.length === 0) {
        return true; // If no ranges (inferred file), include all
    }
    return ranges.some(range => line >= range.start && line <= range.end);
}

/**
 * Calculate diff coverage - only for changed lines
 */
function calculateDiffCoverage(fileCoverage, changedRanges) {
    if (!changedRanges || changedRanges.length === 0) {
        // No specific ranges - calculate full file coverage
        return {
            statements: calculateStatementCoverage(fileCoverage.s),
            branches: calculateBranchCoverage(fileCoverage.b),
            functions: calculateFunctionCoverage(fileCoverage.f),
            lines: calculateLineCoverage(fileCoverage.s, fileCoverage.statementMap)
        };
    }
    
    // Filter statements to only changed lines
    const filteredStatements = {};
    Object.keys(fileCoverage.s).forEach(stmtId => {
        const stmt = fileCoverage.statementMap[stmtId];
        if (stmt && stmt.start && isLineInChangedRanges(stmt.start.line, changedRanges)) {
            filteredStatements[stmtId] = fileCoverage.s[stmtId];
        }
    });
    
    // Filter branches to only changed lines
    const filteredBranches = {};
    Object.keys(fileCoverage.b).forEach(branchId => {
        const branch = fileCoverage.branchMap[branchId];
        if (branch && branch.loc && isLineInChangedRanges(branch.loc.start.line, changedRanges)) {
            filteredBranches[branchId] = fileCoverage.b[branchId];
        }
    });
    
    // Filter functions to only changed lines
    const filteredFunctions = {};
    Object.keys(fileCoverage.f).forEach(fnId => {
        const fn = fileCoverage.fnMap[fnId];
        if (fn && fn.loc && isLineInChangedRanges(fn.loc.start.line, changedRanges)) {
            filteredFunctions[fnId] = fileCoverage.f[fnId];
        }
    });
    
    return {
        statements: calculateStatementCoverage(filteredStatements),
        branches: calculateBranchCoverage(filteredBranches),
        functions: calculateFunctionCoverage(filteredFunctions),
        lines: calculateLineCoverage(filteredStatements, fileCoverage.statementMap)
    };
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
    lines.push('_Coverage for changed lines only (diff coverage) - Statements / Branches / Functions / Lines_');
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
    // Check if ui-modules-to-test.json exists
    if (!fs.existsSync('ui-modules-to-test.json')) {
        addSkipMessage('No test changes detected');
        return;
    }

    const modulesData = JSON.parse(fs.readFileSync('ui-modules-to-test.json', 'utf8'));
    const changedSourceFiles = modulesData.changedSourceFiles || [];

    if (changedSourceFiles.length === 0) {
        addSkipMessage('No source files changed (only test files modified)');
        return;
    }

    const coverageResults = parseCoverageResults();

    if (!coverageResults || coverageResults.length === 0) {
        addSkipMessage('Coverage data not available');
        return;
    }

    const markdownTable = generateMarkdownTable(coverageResults);

    if (!markdownTable) {
        return;
    }

    // Append to ui-pr-comment.md if it exists, otherwise create new
    let existingComment = '';
    if (fs.existsSync('ui-pr-comment.md')) {
        existingComment = fs.readFileSync('ui-pr-comment.md', 'utf8');
    } else {
    }

    const updatedComment = existingComment + '\n\n' + markdownTable;
    fs.writeFileSync('ui-pr-comment.md', updatedComment);

}

/**
 * Add skip message to ui-pr-comment.md
 */
function addSkipMessage(reason) {
    const skipMessage = [
        '### 📊 Code Coverage',
        '',
        `_Coverage report skipped: ${reason}_`,
        ''
    ].join('\n');

    let existingComment = '';
    if (fs.existsSync('ui-pr-comment.md')) {
        existingComment = fs.readFileSync('ui-pr-comment.md', 'utf8');
    }

    const updatedComment = existingComment + '\n\n' + skipMessage;
    fs.writeFileSync('ui-pr-comment.md', updatedComment);

}

main();
