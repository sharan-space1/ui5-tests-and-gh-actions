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
                'test/unit/unitTests.qunit.html?coverage'
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
        console.log('[wdio.conf.js] ======================================');
        console.log('[wdio.conf.js] Before hook executing...');
        console.log('[wdio.conf.js] ======================================');
        
        // Inject TEST_MODULES from environment variable into browser context
        const modulesString = process.env.TEST_MODULES_LIST;
        console.log('[wdio.conf.js] process.env.TEST_MODULES_LIST:', modulesString);
        
        if (modulesString) {
            console.log('[wdio.conf.js] ✓ Found TEST_MODULES_LIST environment variable');
            const modules = modulesString.split(',').map(m => m.trim());
            console.log('[wdio.conf.js] Parsed modules array:', modules);
            console.log('[wdio.conf.js] Module count:', modules.length);
            
            // Inject into browser's window object
            console.log('[wdio.conf.js] Injecting into browser context as window.TEST_MODULES...');
            browser.execute((mods) => {
                console.log('[Browser Context] Received modules:', mods);
                window.TEST_MODULES = mods;
                console.log('[Browser Context] window.TEST_MODULES set to:', window.TEST_MODULES);
            }, modules);
            
            console.log('[wdio.conf.js] ✓ TEST_MODULES injected successfully');
            console.log('[wdio.conf.js] Modules to test:', modules.join(', '));
        } else {
            console.log('[wdio.conf.js] ⚠ No TEST_MODULES_LIST env variable found');
            console.log('[wdio.conf.js] Browser will use fallback modules from unitTests.qunit.js');
        }
        
        console.log('[wdio.conf.js] ======================================');
    }
};
