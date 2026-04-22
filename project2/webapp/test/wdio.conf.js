exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    // ==================
    // Specify Test Files
    // ==================
    specs: [],
    
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome',
        browserVersion: 'stable',
        'goog:chromeOptions': {
            args: [
                'headless',
                'disable-gpu',
                'window-size=1920,1080',
                'no-sandbox',
                'disable-dev-shm-usage',
                'log-level=3'
            ]
        }
    }],
    
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'error',
    bail: 0,
    baseUrl: 'http://localhost:8080',
    waitforTimeout: 90000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // ========
    // Services
    // ========
    services: [
        ['qunit', {
            paths: [
                'test/unit/unitTests.qunit.html'
            ]
        }]
    ],
    
    // Framework - required even when using qunit service
    framework: 'mocha',
    
    // Mocha options
    mochaOpts: {
        ui: 'bdd',
        timeout: 90000
    },
    
    // Test reporter for stdout.
    reporters: ['spec'],
    
    // =======================
    // Hooks
    // =======================
    before: function () {
        // Inject CHANGED_TESTS from environment variable into browser context
        const changedTests = process.env.PROJECT_CHANGED_TESTS;
        
        if (changedTests) {
            console.log('Injecting CHANGED_TESTS into browser context...');
            try {
                const parsedTests = JSON.parse(changedTests);
                console.log(`Found ${parsedTests.length} changed test(s) to run`);
                
                // Inject into browser's window object
                browser.execute((tests) => {
                    window.CHANGED_TESTS = tests;
                }, parsedTests);
                
                console.log('✓ CHANGED_TESTS injected successfully');
            } catch (error) {
                console.error('Error parsing CHANGED_TESTS:', error.message);
                console.log('Tests will run with default filter');
            }
        } else {
            console.log('No PROJECT_CHANGED_TESTS env variable found. Tests will run with default filter.');
        }
    }
};
