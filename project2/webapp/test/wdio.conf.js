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
    reporters: ['spec']
};
