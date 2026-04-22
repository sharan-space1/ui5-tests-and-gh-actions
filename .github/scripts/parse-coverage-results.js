const fs = require('fs');
const path = require('path');

/**
 * Parse coverage data and filter by changed files
 */
function parseCoverageResults() {
    console.log('[parse-coverage] ========================================');
    console.log('[parse-coverage] Starting coverage result parsing...');
    console.log('[parse-coverage] ========================================\n');

    // Read modules-to-test.json to get changed source files
    if (!fs.existsSync('modules-to-test.json')) {
        console.log('[parse-coverage] ⚠ No modules-to-test.json found');
        return null;
    }

    const modulesData = JSON.parse(fs.readFileSync('modules-to-test.json', 'utf8'));
    const changedSourceFiles = modulesData.changedSourceFiles || [];

    if (changedSourceFiles.length === 0) {
        console.log('[parse-coverage] ⚠ No changed source files to filter coverage');
        return null;
    }

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
        const coverageFile = path.join(project, 'tmp', 'coverage-reports', 'coverage-final.json');
        
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
            const statements = calculateCoverage(fileCoverage.s, fileCoverage.statementMap);
            const branches = calculateCoverage(fileCoverage.b, fileCoverage.branchMap);
            const functions = calculateCoverage(fileCoverage.f, fileCoverage.fnMap);
            const lines = calculateCoverage(fileCoverage.l || {}, {});

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
 * Calculate coverage percentage
 */
function calculateCoverage(hits, map) {
    if (!hits || Object.keys(hits).length === 0) {
        return { pct: 0, covered: 0, total: 0 };
    }

    const total = Object.keys(hits).length;
    const covered = Object.values(hits).filter(count => count > 0).length;
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
        '## 📊 Code Coverage Report',
        '',
        '**Coverage for Changed Files Only**',
        '',
        '| Project | File | Statements | Branches | Functions | Lines |',
        '|---------|------|------------|----------|-----------|-------|'
    ];

    coverageResults.forEach(result => {
        const stmtBadge = formatBadge(result.statements.pct);
        const branchBadge = formatBadge(result.branches.pct);
        const fnBadge = formatBadge(result.functions.pct);
        const lineBadge = formatBadge(result.lines.pct);

        const fileName = result.file.length > 40 
            ? '...' + result.file.substring(result.file.length - 37) 
            : result.file;

        lines.push(
            `| ${result.project} | \`${fileName}\` | ${stmtBadge} | ${branchBadge} | ${fnBadge} | ${lineBadge} |`
        );
    });

    lines.push('');
    lines.push('_Coverage percentages: Statements / Branches / Functions / Lines_');
    lines.push('');

    return lines.join('\n');
}

/**
 * Format coverage percentage with badge/color
 */
function formatBadge(pct) {
    if (pct >= 80) {
        return `🟢 ${pct}%`;
    } else if (pct >= 50) {
        return `🟡 ${pct}%`;
    } else {
        return `🔴 ${pct}%`;
    }
}

/**
 * Main function
 */
function main() {
    const coverageResults = parseCoverageResults();

    if (!coverageResults || coverageResults.length === 0) {
        console.log('[parse-coverage] No coverage results to report');
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

main();
