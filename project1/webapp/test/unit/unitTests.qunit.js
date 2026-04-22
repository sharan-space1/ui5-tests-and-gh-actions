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
    {
        "module": "App Controller",
        "test": "add should return sum of two numbers"
    },
    {
        "module": "App Controller",
        "test": "divide should return quotient of two numbers"
    },
    {
        "module": "View1 Controller",
        "test": "capitalize should capitalize first letter"
    },
    {
        "module": "App Controller - Part 2 (Array & Date Operations)",
        "test": "sum should return sum of array elements"
    }
];

changeLogs.forEach(test => {
    const testId = generateHash(test.module, test.test);
    // internalTestIds.push(testId);
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