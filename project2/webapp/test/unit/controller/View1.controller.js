/*global QUnit*/

sap.ui.define([
	"com/asint/project2/controller/View1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("View1 Controller");

	QUnit.test("I should test the View1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

	QUnit.test("Number utilities - roundNumber", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.roundNumber(3.14159, 2), 3.14, "Rounds to 2 decimals");
		assert.strictEqual(oController.roundNumber(3.5), 4, "Rounds to nearest integer");
		assert.strictEqual(oController.roundNumber("abc", 2), null, "Invalid input returns null");
	});

	QUnit.test("Number utilities - ceilNumber", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.ceilNumber(3.1), 4, "Ceils 3.1 to 4");
		assert.strictEqual(oController.ceilNumber(-3.9), -3, "Ceils -3.9 to -3");
		assert.strictEqual(oController.ceilNumber("abc"), null, "Invalid input returns null");
	});

	QUnit.test("Number utilities - floorNumber", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.floorNumber(3.9), 3, "Floors 3.9 to 3");
		assert.strictEqual(oController.floorNumber(-3.1), -4, "Floors -3.1 to -4");
		assert.strictEqual(oController.floorNumber("abc"), null, "Invalid input returns null");
	});

	QUnit.test("Number utilities - toFixedNumber", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.toFixedNumber(3.14159, 2), "3.14", "Fixed to 2 decimals");
		assert.strictEqual(oController.toFixedNumber(5, 2), "5.00", "Integer fixed to 2 decimals");
		assert.strictEqual(oController.toFixedNumber("abc", 2), "", "Invalid input returns empty");
	});

	QUnit.test("Number utilities - toPrecisionNumber", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.toPrecisionNumber(123.456, 4), "123.5", "Precision of 4");
		assert.strictEqual(oController.toPrecisionNumber(0.00123, 2), "0.0012", "Small number precision");
		assert.strictEqual(oController.toPrecisionNumber("abc", 3), "", "Invalid input returns empty");
	});

	QUnit.test("Date helpers - getAge", function (assert) {
		var oController = new Controller();
		var birthDate = new Date(2000, 0, 1);
		var age = oController.getAge(birthDate);
		assert.ok(age >= 24 && age <= 27, "Calculates age correctly");
		assert.strictEqual(oController.getAge("invalid"), null, "Invalid date returns null");
	});

	QUnit.test("Date helpers - getDaysInMonth", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.getDaysInMonth(2024, 2), 29, "Feb 2024 has 29 days (leap year)");
		assert.strictEqual(oController.getDaysInMonth(2023, 2), 28, "Feb 2023 has 28 days");
		assert.strictEqual(oController.getDaysInMonth(2024, 1), 31, "Jan has 31 days");
		assert.strictEqual(oController.getDaysInMonth("abc", 1), null, "Invalid input returns null");
	});

	QUnit.test("Date helpers - isLeapYearCheck", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isLeapYearCheck(2024), true, "2024 is leap year");
		assert.strictEqual(oController.isLeapYearCheck(2023), false, "2023 is not leap year");
		assert.strictEqual(oController.isLeapYearCheck(2000), true, "2000 is leap year");
		assert.strictEqual(oController.isLeapYearCheck(1900), false, "1900 is not leap year");
		assert.strictEqual(oController.isLeapYearCheck("abc"), false, "Invalid input returns false");
	});

	QUnit.test("Date helpers - formatDateTime", function (assert) {
		var oController = new Controller();
		var date = new Date(2024, 0, 1, 12, 30, 0);
		var result = oController.formatDateTime(date);
		assert.ok(result.length > 0, "Formats date to locale string");
		assert.strictEqual(oController.formatDateTime("invalid"), "", "Invalid date returns empty");
	});

	QUnit.test("Date helpers - parseDate", function (assert) {
		var oController = new Controller();
		var result = oController.parseDate("2024-01-01");
		assert.ok(result instanceof Date, "Parses valid date string");
		assert.strictEqual(oController.parseDate("invalid"), null, "Invalid date string returns null");
		assert.strictEqual(oController.parseDate(123), null, "Non-string returns null");
	});

	QUnit.test("Array operations - firstItem", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.firstItem([1, 2, 3]), 1, "Returns first item");
		assert.strictEqual(oController.firstItem([]), undefined, "Empty array returns undefined");
		assert.strictEqual(oController.firstItem("abc"), undefined, "Non-array returns undefined");
	});

	QUnit.test("Array operations - lastItem", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.lastItem([1, 2, 3]), 3, "Returns last item");
		assert.strictEqual(oController.lastItem([]), undefined, "Empty array returns undefined");
		assert.strictEqual(oController.lastItem("abc"), undefined, "Non-array returns undefined");
	});

	QUnit.test("Array operations - compactArray", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.compactArray([1, 0, false, "", null, undefined, 2]), [1, 2], "Removes falsy values");
		assert.deepEqual(oController.compactArray([1, 2, 3]), [1, 2, 3], "No falsy values unchanged");
		assert.deepEqual(oController.compactArray("abc"), [], "Non-array returns empty");
	});

	QUnit.test("Array operations - withoutItems", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.withoutItems([1, 2, 3, 4], 2, 4), [1, 3], "Removes specified items");
		assert.deepEqual(oController.withoutItems([1, 2, 3], 5), [1, 2, 3], "Non-existent items unchanged");
		assert.deepEqual(oController.withoutItems("abc", 1), [], "Non-array returns empty");
	});

	QUnit.test("Array operations - unionArrays", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.unionArrays([1, 2], [2, 3], [3, 4]), [1, 2, 3, 4], "Returns union of arrays");
		assert.deepEqual(oController.unionArrays([1, 1, 2]), [1, 2], "Removes duplicates");
		assert.deepEqual(oController.unionArrays(), [], "No args returns empty");
	});

	QUnit.test("String operations - trimLeftString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.trimLeftString("  hello  "), "hello  ", "Trims left spaces");
		assert.strictEqual(oController.trimLeftString("hello"), "hello", "No left spaces unchanged");
		assert.strictEqual(oController.trimLeftString(123), "", "Non-string returns empty");
	});

	QUnit.test("String operations - trimRightString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.trimRightString("  hello  "), "  hello", "Trims right spaces");
		assert.strictEqual(oController.trimRightString("hello"), "hello", "No right spaces unchanged");
		assert.strictEqual(oController.trimRightString(123), "", "Non-string returns empty");
	});

	QUnit.test("String operations - repeatText", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.repeatText("ab", 3), "ababab", "Repeats text");
		assert.strictEqual(oController.repeatText("x", 0), "", "Zero times returns empty");
		assert.strictEqual(oController.repeatText(123, 2), "", "Non-string returns empty");
	});

	QUnit.test("String operations - splitString", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.splitString("a,b,c"), ["a", "b", "c"], "Splits by comma");
		assert.deepEqual(oController.splitString("a-b-c", "-"), ["a", "b", "c"], "Splits by custom separator");
		assert.deepEqual(oController.splitString(123), [], "Non-string returns empty array");
	});

	QUnit.test("String operations - joinArray", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.joinArray(["a", "b", "c"]), "a,b,c", "Joins with comma");
		assert.strictEqual(oController.joinArray(["a", "b"], "-"), "a-b", "Joins with custom separator");
		assert.strictEqual(oController.joinArray("abc"), "", "Non-array returns empty string");
	});

});

