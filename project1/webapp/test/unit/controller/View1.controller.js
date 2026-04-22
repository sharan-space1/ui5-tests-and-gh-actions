/*global QUnit*/

sap.ui.define([
	"com/asint/project1/controller/View1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("View1 Controller");

	QUnit.test("I should test the View1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

	// Calculation function tests
	QUnit.test("add should return sum of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.add(5, 3), 8, "5 + 3 = 8");
		assert.strictEqual(oController.add(-5, 3), -2, "-5 + 3 = -2");
		assert.strictEqual(oController.add(0, 0), 0, "0 + 0 = 0");
	});

	QUnit.test("subtract should return difference of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.subtract(10, 3), 7, "10 - 3 = 7");
		assert.strictEqual(oController.subtract(3, 10), -7, "3 - 10 = -7");
		assert.strictEqual(oController.subtract(5, 5), 0, "5 - 5 = 0");
	});

	QUnit.test("multiply should return product of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.multiply(5, 3), 15, "5 * 3 = 15");
		assert.strictEqual(oController.multiply(-5, 3), -15, "-5 * 3 = -15");
		assert.strictEqual(oController.multiply(0, 100), 0, "0 * 100 = 0");
	});

	QUnit.test("divide should return quotient of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.divide(10, 2), 5, "10 / 2 = 5");
		assert.strictEqual(oController.divide(10, 4), 2.5, "10 / 4 = 2.5");
		assert.strictEqual(oController.divide(10, 0), null, "Division by zero returns null");
	});

	QUnit.test("percentage should calculate percentage correctly", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.percentage(50, 200), 25, "50 is 25% of 200");
		assert.strictEqual(oController.percentage(100, 100), 100, "100 is 100% of 100");
		assert.strictEqual(oController.percentage(50, 0), 0, "Division by zero returns 0");
	});

	// Formatting function tests
	QUnit.test("formatDate should format date correctly", function (assert) {
		var oController = new Controller();
		var date = new Date("2026-04-21T10:30:00");
		assert.strictEqual(oController.formatDate(date), "2026-04-21", "Date formatted as YYYY-MM-DD");
		assert.strictEqual(oController.formatDate(null), "", "Null returns empty string");
		assert.strictEqual(oController.formatDate("invalid"), "", "Invalid date returns empty string");
	});

	QUnit.test("formatCurrency should format currency correctly", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.formatCurrency(100.5), "USD 100.50", "Default currency is USD");
		assert.strictEqual(oController.formatCurrency(100.5, "EUR"), "EUR 100.50", "Custom currency EUR");
		assert.strictEqual(oController.formatCurrency("invalid"), "", "Invalid amount returns empty string");
	});

	QUnit.test("formatNumber should format number with decimals", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.formatNumber(100.456), "100.46", "Default 2 decimals");
		assert.strictEqual(oController.formatNumber(100.456, 1), "100.5", "Custom 1 decimal");
		assert.strictEqual(oController.formatNumber("invalid"), "", "Invalid number returns empty string");
	});

	QUnit.test("formatPercentage should format percentage correctly", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.formatPercentage(25.5), "25.50%", "25.5 formatted as 25.50%");
		assert.strictEqual(oController.formatPercentage(100), "100.00%", "100 formatted as 100.00%");
		assert.strictEqual(oController.formatPercentage("invalid"), "", "Invalid value returns empty string");
	});

	QUnit.test("formatBoolean should format boolean correctly", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.formatBoolean(true), "Yes", "true formatted as Yes");
		assert.strictEqual(oController.formatBoolean(false), "No", "false formatted as No");
		assert.strictEqual(oController.formatBoolean(1), "Yes", "Truthy value formatted as Yes");
		assert.strictEqual(oController.formatBoolean(0), "No", "Falsy value formatted as No");
	});

	// Validation function tests
	QUnit.test("isEmail should validate email addresses", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isEmail("test@example.com"), "Valid email");
		assert.ok(oController.isEmail("user.name+tag@example.co.uk"), "Valid complex email");
		assert.notOk(oController.isEmail("invalid"), "Invalid email without @");
		assert.notOk(oController.isEmail("@example.com"), "Invalid email without local part");
		assert.notOk(oController.isEmail(123), "Non-string value returns false");
	});

	QUnit.test("isNumeric should validate numeric values", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isNumeric(123), "Integer is numeric");
		assert.ok(oController.isNumeric(123.45), "Float is numeric");
		assert.ok(oController.isNumeric("123"), "Numeric string is numeric");
		assert.notOk(oController.isNumeric("abc"), "Non-numeric string is not numeric");
		assert.notOk(oController.isNumeric(NaN), "NaN is not numeric");
	});

	QUnit.test("isRequired should validate required values", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isRequired("text"), "Non-empty string is required");
		assert.ok(oController.isRequired(123), "Number is required");
		assert.notOk(oController.isRequired(""), "Empty string is not required");
		assert.notOk(oController.isRequired("   "), "Whitespace string is not required");
		assert.notOk(oController.isRequired(null), "Null is not required");
		assert.notOk(oController.isRequired(undefined), "Undefined is not required");
	});

	QUnit.test("isInRange should validate range", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isInRange(5, 1, 10), "5 is in range 1-10");
		assert.ok(oController.isInRange(1, 1, 10), "1 is in range 1-10 (min boundary)");
		assert.ok(oController.isInRange(10, 1, 10), "10 is in range 1-10 (max boundary)");
		assert.notOk(oController.isInRange(0, 1, 10), "0 is not in range 1-10");
		assert.notOk(oController.isInRange(11, 1, 10), "11 is not in range 1-10");
	});

	QUnit.test("isPositive should validate positive numbers", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isPositive(5), "5 is positive");
		assert.ok(oController.isPositive(0.1), "0.1 is positive");
		assert.notOk(oController.isPositive(0), "0 is not positive");
		assert.notOk(oController.isPositive(-5), "-5 is not positive");
		assert.notOk(oController.isPositive("5"), "String '5' is not a positive number");
	});

	// String operation tests
	QUnit.test("capitalize should capitalize first letter", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.capitalize("hello"), "Hello", "hello -> Hello");
		assert.strictEqual(oController.capitalize("WORLD"), "World", "WORLD -> World");
		assert.strictEqual(oController.capitalize(""), "", "Empty string returns empty");
		assert.strictEqual(oController.capitalize(123), "", "Non-string returns empty");
	});

	QUnit.test("truncate should truncate string", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.truncate("Hello World", 5), "Hello...", "Truncated to 5 chars");
		assert.strictEqual(oController.truncate("Hi", 5), "Hi", "Short string not truncated");
		assert.strictEqual(oController.truncate("Hello", 5), "Hello", "Equal length not truncated");
		assert.strictEqual(oController.truncate(123, 5), "", "Non-string returns empty");
	});

	QUnit.test("reverse should reverse string", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.reverse("hello"), "olleh", "hello reversed to olleh");
		assert.strictEqual(oController.reverse("12345"), "54321", "12345 reversed to 54321");
		assert.strictEqual(oController.reverse(""), "", "Empty string returns empty");
		assert.strictEqual(oController.reverse(123), "", "Non-string returns empty");
	});

	QUnit.test("removeSpaces should remove all spaces", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.removeSpaces("hello world"), "helloworld", "Spaces removed");
		assert.strictEqual(oController.removeSpaces("  a  b  c  "), "abc", "Multiple spaces removed");
		assert.strictEqual(oController.removeSpaces("noSpaces"), "noSpaces", "No spaces to remove");
		assert.strictEqual(oController.removeSpaces(123), "", "Non-string returns empty");
	});

	QUnit.test("countWords should count words in string", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.countWords("hello world"), 2, "Two words");
		assert.strictEqual(oController.countWords("one"), 1, "One word");
		assert.strictEqual(oController.countWords("  multiple   spaces  between  "), 3, "Three words with extra spaces");
		assert.strictEqual(oController.countWords(""), 0, "Empty string has 0 words");
		assert.strictEqual(oController.countWords("   "), 0, "Whitespace only has 0 words");
	});

	QUnit.test("something1 should concatenate two strings", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.something1("Hello, ", "world!"), "Hello, world!", "Concatenates two strings");
		assert.strictEqual(oController.something1("Foo", "Bar"), "FooBar", "Concatenates without space");
		assert.strictEqual(oController.something1("", "Test"), "Test", "Empty first string");
		assert.strictEqual(oController.something1("Test", ""), "Test", "Empty second string");
		assert.strictEqual(oController.something1("Test", "Test"), "TestTest", "Concatenates two identical strings");
	});
});
