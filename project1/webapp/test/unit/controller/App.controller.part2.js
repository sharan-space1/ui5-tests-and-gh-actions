/*global QUnit*/

sap.ui.define([
	"com/asint/project1/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller - Part 2 (Array & Date Operations)");

	// Array operation tests
	QUnit.test("sum should return sum of array elements", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.sum([1, 2, 3, 4, 5]), 15, "Sum of [1,2,3,4,5] is 15");
		assert.strictEqual(oController.sum([10, -5, 3]), 8, "Sum of [10,-5,3] is 8");
		assert.strictEqual(oController.sum([]), 0, "Sum of empty array is 0");
		assert.strictEqual(oController.sum("not an array"), 0, "Non-array returns 0");
	});

	QUnit.test("average should return average of array elements", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.average([1, 2, 3, 4, 5]), 3, "Average of [1,2,3,4,5] is 3");
		assert.strictEqual(oController.average([10, 20, 30]), 20, "Average of [10,20,30] is 20");
		assert.strictEqual(oController.average([]), 0, "Average of empty array is 0");
		assert.strictEqual(oController.average("not an array"), 0, "Non-array returns 0");
	});

	QUnit.test("max should return maximum value in array", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.max([1, 2, 3, 4, 5]), 5, "Max of [1,2,3,4,5] is 5");
		assert.strictEqual(oController.max([10, -5, 3, 100]), 100, "Max of [10,-5,3,100] is 100");
		assert.strictEqual(oController.max([]), null, "Max of empty array is null");
		assert.strictEqual(oController.max("not an array"), null, "Non-array returns null");
	});

	QUnit.test("min should return minimum value in array", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.min([1, 2, 3, 4, 5]), 1, "Min of [1,2,3,4,5] is 1");
		assert.strictEqual(oController.min([10, -5, 3, 100]), -5, "Min of [10,-5,3,100] is -5");
		assert.strictEqual(oController.min([]), null, "Min of empty array is null");
		assert.strictEqual(oController.min("not an array"), null, "Non-array returns null");
	});

	QUnit.test("unique should return unique values from array", function (assert) {
		var oController = new Controller();
		assert.deepEqual(oController.unique([1, 2, 2, 3, 3, 3]), [1, 2, 3], "Duplicates removed");
		assert.deepEqual(oController.unique([1, 2, 3]), [1, 2, 3], "No duplicates to remove");
		assert.deepEqual(oController.unique([]), [], "Empty array returns empty array");
		assert.deepEqual(oController.unique("not an array"), [], "Non-array returns empty array");
	});

	// Date operation tests
	QUnit.test("addDays should add days to date", function (assert) {
		var oController = new Controller();
		var date = new Date("2026-04-21");
		var result = oController.addDays(date, 5);
		assert.strictEqual(result.getDate(), 26, "5 days added to April 21 is April 26");
		
		var result2 = oController.addDays(date, 0);
		assert.strictEqual(result2.getDate(), 21, "0 days added returns same date");
		
		assert.strictEqual(oController.addDays(null, 5), null, "Null date returns null");
		assert.strictEqual(oController.addDays("invalid", 5), null, "Invalid date returns null");
	});

	QUnit.test("subtractDays should subtract days from date", function (assert) {
		var oController = new Controller();
		var date = new Date("2026-04-21");
		var result = oController.subtractDays(date, 5);
		assert.strictEqual(result.getDate(), 16, "5 days subtracted from April 21 is April 16");
		
		var result2 = oController.subtractDays(date, 0);
		assert.strictEqual(result2.getDate(), 21, "0 days subtracted returns same date");
		
		assert.strictEqual(oController.subtractDays(null, 5), null, "Null date returns null");
		assert.strictEqual(oController.subtractDays("invalid", 5), null, "Invalid date returns null");
	});

	QUnit.test("getDaysBetween should calculate days between two dates", function (assert) {
		var oController = new Controller();
		var date1 = new Date("2026-04-21");
		var date2 = new Date("2026-04-26");
		assert.strictEqual(oController.getDaysBetween(date1, date2), 5, "5 days between April 21 and April 26");
		
		var date3 = new Date("2026-04-21");
		var date4 = new Date("2026-04-21");
		assert.strictEqual(oController.getDaysBetween(date3, date4), 0, "0 days between same dates");
		
		assert.strictEqual(oController.getDaysBetween(null, date2), null, "Null date1 returns null");
		assert.strictEqual(oController.getDaysBetween(date1, null), null, "Null date2 returns null");
		assert.strictEqual(oController.getDaysBetween("invalid", date2), null, "Invalid date1 returns null");
	});

	QUnit.test("isWeekend should check if date is weekend", function (assert) {
		var oController = new Controller();
		var saturday = new Date("2026-04-25"); // Saturday
		var sunday = new Date("2026-04-26"); // Sunday
		var monday = new Date("2026-04-20"); // Monday
		var friday = new Date("2026-04-24"); // Friday
		
		assert.ok(oController.isWeekend(saturday), "Saturday is weekend");
		assert.ok(oController.isWeekend(sunday), "Sunday is weekend");
		assert.notOk(oController.isWeekend(monday), "Monday is not weekend");
		assert.notOk(oController.isWeekend(friday), "Friday is not weekend");
		assert.notOk(oController.isWeekend(null), "Null date returns false");
		assert.notOk(oController.isWeekend("invalid"), "Invalid date returns false");
	});

	QUnit.test("formatTime should format time correctly", function (assert) {
		var oController = new Controller();
		var date = new Date("2026-04-21T10:30:45");
		assert.strictEqual(oController.formatTime(date), "10:30:45", "Time formatted as HH:MM:SS");
		
		var date2 = new Date("2026-04-21T09:05:03");
		assert.strictEqual(oController.formatTime(date2), "09:05:03", "Time with leading zeros");
		
		assert.strictEqual(oController.formatTime(null), "", "Null date returns empty string");
		assert.strictEqual(oController.formatTime("invalid"), "", "Invalid date returns empty string");
	});

});
