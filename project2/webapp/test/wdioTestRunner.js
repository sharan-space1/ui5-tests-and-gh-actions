const { spawn } = require('child_process');
const http = require('http');
const kill = require('tree-kill');

let serverProcess;
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Check if server is running
function isServerRunning() {
    return new Promise((resolve) => {
        http.get('http://localhost:8080', (res) => {
            resolve(true);
        }).on('error', () => {
            resolve(false);
        });
    });
}

// Wait for server to be ready
async function waitForServer() {
    console.log('Waiting for server to be ready...');
    for (let i = 0; i < 60; i++) {  // Increased timeout for CI
        if (await isServerRunning()) {
            console.log('✓ Server is ready\n');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
}

// Start server
async function startServer() {
    console.log('Starting server on port 8080...');
    
    serverProcess = spawn('npx', ['fiori', 'run', '--port', '8080'], {
        shell: true,
        stdio: 'ignore',
        detached: false
    });

    return waitForServer();
}

// Run tests
function runTests() {
    return new Promise((resolve, reject) => {
        console.log('Running tests...\n');
        
        const wdio = spawn('npx', ['wdio', 'run', './wdio.conf.js'], {
            shell: true,
            stdio: 'inherit',
            cwd: __dirname
        });

        wdio.on('close', (code) => {
            resolve(code === 0);
        });
    });
}

// Cleanup
async function cleanup() {
    if (serverProcess) {
        console.log('\nStopping server...');
        await new Promise((resolve) => {
            kill(serverProcess.pid, () => {
                console.log('✓ Server stopped');
                resolve();
            });
        });
    }
}

// Main
async function main() {
    try {
        // In CI, always start fresh. Locally, check if already running
        if (!isCI && await isServerRunning()) {
            console.log('✓ Server already running (local mode)\n');
        } else {
            if (!(await startServer())) {
                throw new Error('Server failed to start');
            }
        }
        
        const success = await runTests();
        await cleanup();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('Error:', error.message);
        await cleanup();
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    await cleanup();
    process.exit(130);
});

main();
