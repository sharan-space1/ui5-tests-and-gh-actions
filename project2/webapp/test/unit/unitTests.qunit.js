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

const internalTestIds = [];

// Read from window.CHANGED_TESTS (injected by CI) or use local defaults
// In CI: window.CHANGED_TESTS will be set by build pipeline
// Locally: falls back to hardcoded changeLogs for development
const changeLogs = window.CHANGED_TESTS || [
    { module: "App Controller", test: "Math operations - factorial" },
    { module: "App Controller", test: "Math operations - fibonacci" },
    { module: "App Controller", test: "Text processing - camelCase" },
    { module: "App Controller", test: "Data validation - isURL" },
    { module: "App Controller", test: "Array helpers - flatten" },
    { module: "View1 Controller", test: "Number utilities - ceilNumber" },
    { module: "View1 Controller", test: "Date helpers - getDaysInMonth" },
    { module: "View1 Controller", test: "Array operations - compactArray" },
    { module: "App Controller - Part 2 (Object & String Operations)", test: "Object helpers - clone" },
    { module: "App Controller - Part 2 (Object & String Operations)", test: "String utilities - padStartString" }
];

changeLogs.forEach(test => {
    const testId = generateHash(test.module, test.test);
    internalTestIds.push(testId);
});

if (internalTestIds && internalTestIds.length > 0) {
    QUnit.config.testId = internalTestIds;
}

sap.ui.require([
    "unit/AllTests"
], function () {
    "use strict";

    QUnit.start();
});