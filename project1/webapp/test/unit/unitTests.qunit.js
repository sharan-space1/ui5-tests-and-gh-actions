/* global QUnit */
QUnit.config.autostart = false;
// Took from Qunit 2.3.2
// Based on Java's String.hashCode, a simple but not rigorously collision resistant hashing function
function generateHash(module, testName) {
    var str = module + "\x1C" + testName;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    // Convert the possibly negative integer hash code into an 8 character hex string, which isn't
    // strictly necessary but increases user understanding that the id is a SHA-like hash
    var hex = (0x100000000 + hash).toString(16);
    if (hex.length < 8) {
        hex = "0000000" + hex;
    }
    return hex.slice(-8);
}
const internalModuleIds = [];
// Function to get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
// Read module names from:
// 1. URL parameter (?modules=App Controller,View1 Controller)
// 2. window.TEST_MODULES (injected by CI)
// 3. Fallback to hardcoded defaults for local development
const modulesParam = getUrlParameter('modules');
let moduleNames = [];
if (modulesParam) {
    // From URL parameter (comma-separated)
    moduleNames = modulesParam.split(',').map(m => m.trim());
} else if (window.TEST_MODULES) {
    // From window variable (injected by CI)
    moduleNames = window.TEST_MODULES;
}
// Convert module names to internal IDs using hash function
moduleNames.forEach(module => {
    const moduleId = generateHash(module);
    internalModuleIds.push(moduleId);
});
if (internalModuleIds && internalModuleIds.length > 0) {
    QUnit.config.moduleId = internalModuleIds;
    console.log(`✓ Running ${moduleNames.length} test module(s):`, moduleNames.join(', '));
} else {
    console.log('⚠ Running ALL test modules');
}
sap.ui.require([
    "unit/AllTests"
], function () {
    "use strict";
    QUnit.start();
});
