/* global QUnit */
QUnit.config.autostart = false;

// Took from Qunit 2.3.2
// Based on Java's String.hashCode, a simple but not rigorously collision resistant hashing function
function generateHash(module, testName) {
    var str = testName !== undefined ? module + "\x1C" + testName : module;
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
console.log("[unitTests.qunit.js] Starting module filter setup...");
console.log("[unitTests.qunit.js] Current URL:", window.location.href);
console.log("[unitTests.qunit.js] window.TEST_MODULES:", window.TEST_MODULES);

const modulesParam = getUrlParameter('modules');
console.log("[unitTests.qunit.js] URL modules parameter:", modulesParam);

let moduleNames;

if (modulesParam) {
    // From URL parameter (comma-separated)
    moduleNames = modulesParam.split(',').map(m => m.trim());
    console.log("[unitTests.qunit.js] Using URL parameter modules:", moduleNames);
} else if (window.TEST_MODULES) {
    // From window variable (injected by CI)
    moduleNames = window.TEST_MODULES;
    console.log("[unitTests.qunit.js] Using window.TEST_MODULES:", moduleNames);
} else {
    // Fallback for local development
    moduleNames = ["App Controller", "View1 Controller"];
    console.log("[unitTests.qunit.js] Using fallback modules:", moduleNames);
}

// Convert module names to internal IDs using hash function
console.log("[unitTests.qunit.js] Converting module names to hash IDs...");
moduleNames.forEach(module => {
    const moduleId = generateHash(module);
    console.log("[unitTests.qunit.js]   Module: '" + module + "' -> Hash: " + moduleId);
    internalModuleIds.push(moduleId);
});

console.log("[unitTests.qunit.js] Final module IDs array:", internalModuleIds);

if (internalModuleIds && internalModuleIds.length > 0) {
    QUnit.config.moduleId = internalModuleIds;
    console.log("[unitTests.qunit.js] ✓ Set QUnit.config.moduleId to:", internalModuleIds);
    console.log("[unitTests.qunit.js] ✓ Will run tests ONLY for these modules:", moduleNames);
} else {
    console.log("[unitTests.qunit.js] ⚠ No module IDs set - will run ALL tests");
}

console.log("[unitTests.qunit.js] QUnit.config.moduleId:", QUnit.config.moduleId);
console.log("[unitTests.qunit.js] ========================================");

sap.ui.require([
    "unit/AllTests"
], function () {
    "use strict";

    QUnit.start();
});