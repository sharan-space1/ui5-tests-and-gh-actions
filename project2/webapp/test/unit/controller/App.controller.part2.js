/*global QUnit*/

sap.ui.define([
	"com/asint/project2/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller - Part 2 (Object & String Operations)");

	QUnit.test("Object helpers - merge", function (assert) {
		var oController = new Controller();
		var result = oController.merge({a: 1, b: 2}, {b: 3, c: 4});
		assert.deepEqual(result, {a: 1, b: 3, c: 4}, "Merges objects correctly");
		assert.deepEqual(oController.merge("abc", {a: 1}), {}, "Invalid input returns empty");
	});

	QUnit.test("Object helpers - clone", function (assert) {
		var oController = new Controller();
		var original = {a: 1, b: {c: 2}};
		var cloned = oController.clone(original);
		assert.deepEqual(cloned, original, "Clone equals original");
		cloned.b.c = 5;
		assert.strictEqual(original.b.c, 2, "Deep clone - original unchanged");
		assert.strictEqual(oController.clone(123), 123, "Primitive returns same value");
	});

	QUnit.test("Object helpers - pick", function (assert) {
		var oController = new Controller();
		var obj = {a: 1, b: 2, c: 3};
		assert.deepEqual(oController.pick(obj, ["a", "c"]), {a: 1, c: 3}, "Picks specified keys");
		assert.deepEqual(oController.pick(obj, ["x"]), {}, "Non-existent keys return empty");
		assert.deepEqual(oController.pick("abc", ["a"]), {}, "Invalid input returns empty");
	});

	QUnit.test("Object helpers - omit", function (assert) {
		var oController = new Controller();
		var obj = {a: 1, b: 2, c: 3};
		assert.deepEqual(oController.omit(obj, ["b"]), {a: 1, c: 3}, "Omits specified keys");
		assert.deepEqual(oController.omit(obj, ["x"]), {a: 1, b: 2, c: 3}, "Non-existent keys unchanged");
		assert.deepEqual(oController.omit("abc", ["a"]), {}, "Invalid input returns empty");
	});

	QUnit.test("Object helpers - isEmpty", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.isEmpty({}), true, "Empty object is empty");
		assert.strictEqual(oController.isEmpty({a: 1}), false, "Object with properties is not empty");
		assert.strictEqual(oController.isEmpty(null), true, "Null is empty");
		assert.strictEqual(oController.isEmpty(undefined), true, "Undefined is empty");
	});

	QUnit.test("String utilities - repeatString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.repeatString("ab", 3), "ababab", "Repeats string");
		assert.strictEqual(oController.repeatString("x", 0), "", "Zero times returns empty");
		assert.strictEqual(oController.repeatString(123, 2), "", "Non-string returns empty");
		assert.strictEqual(oController.repeatString("a", -1), "", "Negative times returns empty");
	});

	QUnit.test("String utilities - padStartString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.padStartString("5", 3, "0"), "005", "Pads start with zeros");
		assert.strictEqual(oController.padStartString("test", 6), "  test", "Pads with spaces by default");
		assert.strictEqual(oController.padStartString(123, 5, "0"), "", "Non-string returns empty");
	});

	QUnit.test("String utilities - padEndString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.padEndString("5", 3, "0"), "500", "Pads end with zeros");
		assert.strictEqual(oController.padEndString("test", 6), "test  ", "Pads with spaces by default");
		assert.strictEqual(oController.padEndString(123, 5, "0"), "", "Non-string returns empty");
	});

	QUnit.test("String utilities - containsString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.containsString("hello world", "world"), true, "Contains substring");
		assert.strictEqual(oController.containsString("hello", "bye"), false, "Does not contain substring");
		assert.strictEqual(oController.containsString(123, "1"), false, "Non-string returns false");
	});

	QUnit.test("String utilities - startsWithString", function (assert) {
		var oController = new Controller();
		assert.strictEqual(oController.startsWithString("hello world", "hello"), true, "Starts with substring");
		assert.strictEqual(oController.startsWithString("hello", "world"), false, "Does not start with substring");
		assert.strictEqual(oController.startsWithString(123, "1"), false, "Non-string returns false");
	});

});
