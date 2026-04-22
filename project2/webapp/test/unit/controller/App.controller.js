/*global QUnit*/

sap.ui.define([
	"com/asint/project2/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("Math operations - square", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.square(5), 25, "Square of 5 is 25");
		assert.strictEqual(oController.square(0), 0, "Square of 0 is 0");
		assert.strictEqual(oController.square(-3), 9, "Square of -3 is 9");
		assert.strictEqual(oController.square("abc"), null, "Invalid input returns null");
	});

	QUnit.test("Math operations - cube", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.cube(3), 27, "Cube of 3 is 27");
		assert.strictEqual(oController.cube(0), 0, "Cube of 0 is 0");
		assert.strictEqual(oController.cube(-2), -8, "Cube of -2 is -8");
		assert.strictEqual(oController.cube("abc"), null, "Invalid input returns null");
	});

	QUnit.test("Math operations - factorial", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.factorial(5), 120, "Factorial of 5 is 120");
		assert.strictEqual(oController.factorial(0), 1, "Factorial of 0 is 1");
		assert.strictEqual(oController.factorial(1), 1, "Factorial of 1 is 1");
		assert.strictEqual(oController.factorial(-1), null, "Negative number returns null");
		assert.strictEqual(oController.factorial(3.5), null, "Non-integer returns null");
	});

	QUnit.test("Math operations - fibonacci", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.fibonacci(0), 0, "Fibonacci of 0 is 0");
		assert.strictEqual(oController.fibonacci(1), 1, "Fibonacci of 1 is 1");
		assert.strictEqual(oController.fibonacci(6), 8, "Fibonacci of 6 is 8");
		assert.strictEqual(oController.fibonacci(-1), null, "Negative number returns null");
		assert.strictEqual(oController.fibonacci("abc"), null, "Invalid input returns null");
	});

	QUnit.test("Math operations - gcd", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.gcd(12, 8), 4, "GCD of 12 and 8 is 4");
		assert.strictEqual(oController.gcd(100, 50), 50, "GCD of 100 and 50 is 50");
		assert.strictEqual(oController.gcd(-12, 8), 4, "GCD works with negative numbers");
		assert.strictEqual(oController.gcd("abc", 8), null, "Invalid input returns null");
	});

	QUnit.test("Text processing - slugify", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.slugify("Hello World"), "hello-world", "Converts to slug format");
		assert.strictEqual(oController.slugify("Test-123"), "test-123", "Keeps hyphens and numbers");
		assert.strictEqual(oController.slugify("Multiple   Spaces"), "multiple-spaces", "Handles multiple spaces");
		assert.strictEqual(oController.slugify(123), "", "Non-string returns empty");
	});

	QUnit.test("Text processing - camelCase", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.camelCase("hello world"), "helloWorld", "Converts to camelCase");
		assert.strictEqual(oController.camelCase("test-case-example"), "testCaseExample", "Handles hyphens");
		assert.strictEqual(oController.camelCase("multiple   spaces"), "multipleSpaces", "Handles multiple spaces");
		assert.strictEqual(oController.camelCase(123), "", "Non-string returns empty");
	});

	QUnit.test("Text processing - snakeCase", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.snakeCase("Hello World"), "hello_world", "Converts to snake_case");
		assert.strictEqual(oController.snakeCase("Test Case"), "test_case", "Handles spaces");
		assert.strictEqual(oController.snakeCase("multiple   spaces"), "multiple_spaces", "Handles multiple spaces");
		assert.strictEqual(oController.snakeCase(123), "", "Non-string returns empty");
	});

	QUnit.test("Text processing - titleCase", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.titleCase("hello world"), "Hello World", "Converts to Title Case");
		assert.strictEqual(oController.titleCase("the quick brown fox"), "The Quick Brown Fox", "Capitalizes each word");
		assert.strictEqual(oController.titleCase(123), "", "Non-string returns empty");
	});

	QUnit.test("Text processing - wordWrap", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.wordWrap("hello", 3), "hel\nlo", "Wraps text at width");
		assert.strictEqual(oController.wordWrap("test", 10), "test", "No wrap if text shorter");
		assert.strictEqual(oController.wordWrap(123, 5), "", "Non-string returns empty");
	});

	QUnit.test("Data validation - isURL", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isURL("http://example.com"), true, "Valid HTTP URL");
		assert.strictEqual(oController.isURL("https://example.com/path"), true, "Valid HTTPS URL with path");
		assert.strictEqual(oController.isURL("not-a-url"), false, "Invalid URL");
		assert.strictEqual(oController.isURL(123), false, "Non-string returns false");
	});

	QUnit.test("Data validation - isPhone", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isPhone("1234567890"), true, "Valid 10-digit phone");
		assert.strictEqual(oController.isPhone("(123) 456-7890"), true, "Valid formatted phone");
		assert.strictEqual(oController.isPhone("123"), false, "Too short");
		assert.strictEqual(oController.isPhone(123), false, "Non-string returns false");
	});

	QUnit.test("Data validation - isCreditCard", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isCreditCard("4111111111111111"), true, "Valid 16-digit card");
		assert.strictEqual(oController.isCreditCard("4111 1111 1111 1111"), true, "Valid card with spaces");
		assert.strictEqual(oController.isCreditCard("123"), false, "Too short");
		assert.strictEqual(oController.isCreditCard(123), false, "Non-string returns false");
	});

	QUnit.test("Data validation - isIPAddress", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isIPAddress("192.168.1.1"), true, "Valid IP address");
		assert.strictEqual(oController.isIPAddress("0.0.0.0"), true, "Valid IP with zeros");
		assert.strictEqual(oController.isIPAddress("256.1.1.1"), false, "Invalid octet > 255");
		assert.strictEqual(oController.isIPAddress("192.168.1"), false, "Incomplete IP");
		assert.strictEqual(oController.isIPAddress(123), false, "Non-string returns false");
	});

	QUnit.test("Data validation - isHexColor", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isHexColor("#FF5733"), true, "Valid hex with #");
		assert.strictEqual(oController.isHexColor("FF5733"), true, "Valid hex without #");
		assert.strictEqual(oController.isHexColor("#FFF"), false, "Invalid - too short");
		assert.strictEqual(oController.isHexColor("GGGGGG"), false, "Invalid characters");
		assert.strictEqual(oController.isHexColor(123), false, "Non-string returns false");
	});

	QUnit.test("Array helpers - flatten", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.flatten([1, [2, 3], [4, [5]]]), [1, 2, 3, 4, 5], "Flattens nested arrays");
		assert.deepEqual(oController.flatten([1, 2, 3]), [1, 2, 3], "Flat array unchanged");
		assert.deepEqual(oController.flatten("abc"), [], "Non-array returns empty");
	});

	QUnit.test("Array helpers - chunk", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]], "Chunks array by size");
		assert.deepEqual(oController.chunk([1, 2, 3], 3), [[1, 2, 3]], "Single chunk if size equals length");
		assert.deepEqual(oController.chunk("abc", 2), [], "Non-array returns empty");
		assert.deepEqual(oController.chunk([1, 2], 0), [], "Invalid size returns empty");
	});

	QUnit.test("Array helpers - zip", function (assert) {
		var oController = new Controller();
		var result = oController.zip([1, 2], ["a", "b"]);
		assert.deepEqual(result, [[1, "a"], [2, "b"]], "Zips two arrays");
		var result2 = oController.zip([1, 2, 3], ["a", "b"]);
		assert.deepEqual(result2, [[1, "a"], [2, "b"], [3, undefined]], "Handles different lengths");
	});

	QUnit.test("Array helpers - difference", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.difference([1, 2, 3], [2, 3, 4]), [1], "Returns difference");
		assert.deepEqual(oController.difference([1, 2], [3, 4]), [1, 2], "No common elements");
		assert.deepEqual(oController.difference("abc", [1, 2]), [], "Non-array returns empty");
	});

	QUnit.test("Array helpers - intersection", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.intersection([1, 2, 3], [2, 3, 4]), [2, 3], "Returns intersection");
		assert.deepEqual(oController.intersection([1, 2], [3, 4]), [], "No common elements");
		assert.deepEqual(oController.intersection("abc", [1, 2]), [], "Non-array returns empty");
	});

});
