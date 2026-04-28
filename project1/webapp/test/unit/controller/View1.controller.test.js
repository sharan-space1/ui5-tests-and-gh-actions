/*global QUnit*/

sap.ui.define([
	"com/asint/project1/controller/View1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("View1 Controller - Basic Tests");

	QUnit.test("I should test the View1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

	QUnit.module("View1 Controller - Calculation Functions");

	QUnit.test("add should return sum of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.add(5, 3), 8, "5 + 3 = 8");
		assert.strictEqual(oController.add(-5, 3), -2, "-5 + 3 = -2");
		assert.strictEqual(oController.add(0, 0), 0, "0 + 0 = 0");
		assert.strictEqual(oController.add(100, 200), 300, "100 + 200 = 300");
		assert.strictEqual(oController.add(-10, -5), -15, "-10 + -5 = -15");
	});

	QUnit.test("subtract should return difference of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.subtract(10, 3), 7, "10 - 3 = 7");
		assert.strictEqual(oController.subtract(3, 10), -7, "3 - 10 = -7");
		assert.strictEqual(oController.subtract(5, 5), 0, "5 - 5 = 0");
		assert.strictEqual(oController.subtract(100, 50), 50, "100 - 50 = 50");
	});

	QUnit.test("multiply should return product of two numbers", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.multiply(5, 3), 15, "5 * 3 = 15");
		assert.strictEqual(oController.multiply(-5, 3), -15, "-5 * 3 = -15");
		assert.strictEqual(oController.multiply(0, 100), 0, "0 * 100 = 0");
		assert.strictEqual(oController.multiply(7, 7), 49, "7 * 7 = 49");
		assert.strictEqual(oController.multiply(-2, -3), 6, "-2 * -3 = 6");
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

	QUnit.module("View1 Controller - Formatting Functions");

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

	QUnit.test("formatDate should handle edge cases", function (assert) {
		var oController = new Controller();
		var futureDate = new Date("2030-12-31T23:59:59");
		assert.strictEqual(oController.formatDate(futureDate), "2030-12-31", "Future date formatted correctly");
		var pastDate = new Date("2000-01-01T00:00:00");
		assert.strictEqual(oController.formatDate(pastDate), "2000-01-01", "Past date formatted correctly");
	});

	QUnit.module("View1 Controller - Validation Functions");

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

	QUnit.test("isInRange should handle decimal ranges", function (assert) {
		var oController = new Controller();
		assert.ok(oController.isInRange(5.5, 5, 6), "5.5 is in range 5-6");
		assert.ok(oController.isInRange(0.1, 0, 1), "0.1 is in range 0-1");
		assert.notOk(oController.isInRange(6.1, 5, 6), "6.1 is not in range 5-6");
	});

	QUnit.module("View1 Controller - String Operations");

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
		assert.strictEqual(oController.countWords("  multiple   spaces  between  "), 3, "Three words with extra spaces");
		assert.strictEqual(oController.countWords(""), 0, "Empty string has 0 words");
		assert.strictEqual(oController.countWords("   "), 0, "Whitespace only has 0 words");
	});

	QUnit.test("truncate should handle exact length strings", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.truncate("Hello", 5), "Hello", "Exact length not truncated");
		assert.strictEqual(oController.truncate("Test", 10), "Test", "Shorter than max not truncated");
		assert.strictEqual(oController.truncate("LongString", 4), "Long...", "Longer than max truncated");
	});

	QUnit.module("View1 Controller - Helper Functions");

	QUnit.test("something1 should concatenate strings with plus sign", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.something1("hello", "world"), "hello+world", "Two strings concatenated with +");
		assert.strictEqual(oController.something1("test", "123"), "test+123", "String and number concatenated");
		assert.strictEqual(oController.something1("a", "b"), "a+b", "Single characters concatenated");
		assert.strictEqual(oController.something1("first", undefined), "first+undefined", "Second parameter undefined");
		assert.strictEqual(oController.something1("", "second"), "Invalid", "Empty string returns Invalid");
		assert.strictEqual(oController.something1("", "third"), "Invalid", "Empty string returns Invalid");
		assert.strictEqual(oController.something1(null, "second"), "Invalid", "Null first parameter returns Invalid");
		assert.strictEqual(oController.something1(undefined, "second"), "Invalid", "Undefined first parameter returns Invalid");
	});

	QUnit.test("something1 should concatenate strings with @ sign", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.something2("hello", "world"), "hello@world", "Two strings concatenated with +");
		assert.strictEqual(oController.something2("test", "123"), "test@123", "String and number concatenated");
		assert.strictEqual(oController.something2("a", "b"), "a@b", "Single characters concatenated");
		assert.strictEqual(oController.something2("first", undefined), "first@undefined", "Second parameter undefined");
		assert.strictEqual(oController.something2("", "second"), "Invalid", "Empty string returns Invalid");
		assert.strictEqual(oController.something2(null, "second"), "Invalid", "Null first parameter returns Invalid");
		assert.strictEqual(oController.something2(undefined, "second"), "Invalid", "Undefined first parameter returns Invalid");
	});

	QUnit.test("something1 should concatenate strings with # sign", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.something3("hello", "world"), "hello#world", "Two strings concatenated with +");
		assert.strictEqual(oController.something3("test", "123"), "test#123", "String and number concatenated");
		assert.strictEqual(oController.something3("a", "b"), "a#b", "Single characters concatenated");
		assert.strictEqual(oController.something3("first", undefined), "first#undefined", "Second parameter undefined");
		assert.strictEqual(oController.something3("", "second"), "Invalid", "Empty string returns Invalid");
		assert.strictEqual(oController.something3(null, "second"), "Invalid", "Null first parameter returns Invalid");
		assert.strictEqual(oController.something3(undefined, "second"), "Invalid", "Undefined first parameter returns Invalid");
	});

	QUnit.test("something1 should concatenate strings with & sign", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.something4("hello", "world"), "hello&world", "Two strings concatenated with +");
		assert.strictEqual(oController.something4("test", "123"), "test&123", "String and number concatenated");
		assert.strictEqual(oController.something4("a", "b"), "a&b", "Single characters concatenated");
		assert.strictEqual(oController.something4("first", undefined), "first&undefined", "Second parameter undefined");
		assert.strictEqual(oController.something4("", "second"), "Invalid", "Empty string returns Invalid");
		assert.strictEqual(oController.something4(null, "second"), "Invalid", "Null first parameter returns Invalid");
		assert.strictEqual(oController.something4(undefined, "second"), "Invalid", "Undefined first parameter returns Invalid");
		assert.strictEqual(oController.something4(undefined, undefined), "Invalid", "Undefined first parameter returns Invalid");
	});

	QUnit.module("View1 Controller - User Data Processing");

	QUnit.test("processUserData should return error when no data provided", function (assert) {
		var oController = new Controller();
		var result = oController.processUserData(null);
		assert.strictEqual(result.status, "error", "Status should be error");
		assert.strictEqual(result.error, "No data provided", "Error message should be correct");
	});

	QUnit.test("processUserData should process valid adult user", function (assert) {
		var oController = new Controller();
		var userData = {
			name: "John Doe",
			age: 30,
			email: "john@example.com",
			role: "editor",
			active: true
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.name, "John Doe", "Name should be set");
		assert.strictEqual(result.data.age, 30, "Age should be set");
		assert.strictEqual(result.data.category, "adult", "Category should be adult");
		assert.strictEqual(result.data.email, "john@example.com", "Email should be set");
		assert.deepEqual(result.data.permissions, ["read", "write"], "Editor permissions should be set");
		assert.strictEqual(result.data.status, "active", "Status should be active");
	});

	QUnit.test("processUserData should handle viewer role", function (assert) {
		var oController = new Controller();
		var userData = {
			name: "Jane",
			age: 25,
			email: "jane@test.com",
			role: "viewer"
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.deepEqual(result.data.permissions, ["read"], "Viewer should have read permission");
	});

	QUnit.test("processUserData should return error for invalid data type", function (assert) {
		var oController = new Controller();
		var result = oController.processUserData("not an object");
		assert.strictEqual(result.status, "error", "Status should be error");
		assert.strictEqual(result.error, "Invalid data type", "Error message should be correct");
	});

	QUnit.test("processUserData should handle missing name", function (assert) {
		var oController = new Controller();
		var userData = { age: 30, email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.name, "Unknown", "Name should default to Unknown");
		assert.ok(result.warnings.includes("Name is missing"), "Should warn about missing name");
	});

	QUnit.test("processUserData should handle empty name", function (assert) {
		var oController = new Controller();
		var userData = { name: "   ", age: 30, email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.data.name, "Unknown", "Empty name should default to Unknown");
		assert.ok(result.warnings.includes("Name is missing"), "Should warn about missing name");
	});

	QUnit.test("processUserData should handle name too short", function (assert) {
		var oController = new Controller();
		var userData = { name: "AB", age: 30, email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.name, "AB", "Short name should be preserved");
		assert.ok(result.warnings.includes("Name is too short"), "Should warn about short name");
	});

	QUnit.test("processUserData should handle name too long", function (assert) {
		var oController = new Controller();
		var longName = "A".repeat(60);
		var userData = { name: longName, age: 30, email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.name.length, 50, "Name should be truncated to 50 chars");
		assert.ok(result.warnings.includes("Name is too long"), "Should warn about long name");
	});

	QUnit.test("processUserData should handle missing age", function (assert) {
		var oController = new Controller();
		var userData = { name: "John", email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.age, 0, "Age should default to 0");
		assert.ok(result.warnings.includes("Age is missing"), "Should warn about missing age");
	});

	QUnit.test("processUserData should handle non-number age", function (assert) {
		var oController = new Controller();
		var userData = { name: "John", age: "thirty", email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.age, 0, "Invalid age should default to 0");
		assert.ok(result.warnings.includes("Age must be a number"), "Should warn about invalid age type");
	});

	QUnit.test("processUserData should handle negative age", function (assert) {
		var oController = new Controller();
		var userData = { name: "John", age: -5, email: "test@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.age, 0, "Negative age should default to 0");
		assert.ok(result.warnings.includes("Age cannot be negative"), "Should warn about negative age");
	});

	QUnit.test("processUserData should categorize minor users", function (assert) {
		var oController = new Controller();
		var userData = { name: "Tommy", age: 15, email: "tommy@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.age, 15, "Age should be set");
		assert.strictEqual(result.data.category, "minor", "Category should be minor");
	});

	QUnit.test("processUserData should categorize senior users", function (assert) {
		var oController = new Controller();
		var userData = { name: "Bob", age: 70, email: "bob@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.age, 70, "Age should be set");
		assert.strictEqual(result.data.category, "senior", "Category should be senior");
	});

	QUnit.test("processUserData should handle missing email", function (assert) {
		var oController = new Controller();
		var userData = { name: "John", age: 30 };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.ok(result.warnings.includes("Email is missing"), "Should warn about missing email");
	});

	QUnit.test("processUserData should handle invalid email format", function (assert) {
		var oController = new Controller();
		var userData = { name: "John", age: 30, email: "not-an-email" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.ok(result.warnings.includes("Email format is invalid"), "Should warn about invalid email");
	});

	QUnit.test("processUserData should handle admin role", function (assert) {
		var oController = new Controller();
		var userData = { 
			name: "Admin User", 
			age: 35, 
			email: "admin@example.com",
			role: "admin"
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.deepEqual(result.data.permissions, ["read", "write", "delete", "admin"], "Admin should have all permissions");
	});

	QUnit.test("processUserData should handle unknown role", function (assert) {
		var oController = new Controller();
		var userData = { 
			name: "User", 
			age: 30, 
			email: "user@example.com",
			role: "manager"
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.deepEqual(result.data.permissions, ["read"], "Unknown role should default to read permission");
		assert.ok(result.warnings.includes("Unknown role, defaulting to viewer"), "Should warn about unknown role");
	});

	QUnit.test("processUserData should handle missing role", function (assert) {
		var oController = new Controller();
		var userData = { name: "User", age: 30, email: "user@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.deepEqual(result.data.permissions, ["read"], "Missing role should default to read permission");
	});

	QUnit.test("processUserData should handle inactive status", function (assert) {
		var oController = new Controller();
		var userData = { 
			name: "User", 
			age: 30, 
			email: "user@example.com",
			active: false
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.status, "inactive", "Status should be inactive");
	});

	QUnit.test("processUserData should handle unknown active status", function (assert) {
		var oController = new Controller();
		var userData = { name: "User", age: 30, email: "user@example.com" };
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.strictEqual(result.data.status, "unknown", "Status should be unknown when active not set");
	});

	QUnit.test("processUserData should handle multiple warnings", function (assert) {
		var oController = new Controller();
		var userData = { 
			name: "AB",
			age: -10,
			email: "invalid-email",
			role: "unknown-role"
		};
		var result = oController.processUserData(userData);
		assert.strictEqual(result.status, "success", "Status should be success");
		assert.ok(result.warnings.length > 0, "Should have multiple warnings");
		assert.ok(result.warnings.includes("Name is too short"), "Should warn about short name");
		assert.ok(result.warnings.includes("Age cannot be negative"), "Should warn about negative age");
		assert.ok(result.warnings.includes("Email format is invalid"), "Should warn about invalid email");
		assert.ok(result.warnings.includes("Unknown role, defaulting to viewer"), "Should warn about unknown role");
	});

});
