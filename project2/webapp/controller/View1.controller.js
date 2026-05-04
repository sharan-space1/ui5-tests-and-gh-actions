sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.asint.project2.controller.View1", {
        onInit() {
        },

        // Number utilities
        roundNumber(num, decimals = 0) {
            if (typeof num !== "number" || typeof decimals !== "number") return null;
            const factor = Math.pow(10, decimals);
            return Math.round(num * factor) / factor;
        },

        ceilNumber(num) {
            return typeof num === "number" ? Math.ceil(num) : null;
        },

        floorNumber(num) {
            return typeof num === "number" ? Math.floor(num) : null;
        },

        toFixedNumber(num, decimals = 2) {
            if (typeof num !== "number" || typeof decimals !== "number") return "";
            return num.toFixed(decimals);
        },

        toPrecisionNumber(num, precision = 3) {
            if (typeof num !== "number" || typeof precision !== "number") return "";
            return num.toPrecision(precision);
        },

        // Date helpers
        getAge(birthDate) {
            if (!(birthDate instanceof Date) || isNaN(birthDate)) return null;
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        },

        getDaysInMonth(year, month) {
            if (typeof year !== "number" || typeof month !== "number") return null;
            return new Date(year, month, 0).getDate();
        },

        isLeapYearCheck(year) {
            if (typeof year !== "number") return false;
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        },

        formatDateTime(date) {
            if (!(date instanceof Date) || isNaN(date)) return "";
            return date.toLocaleString();
        },

        parseDate(dateStr) {
            if (typeof dateStr !== "string") return null;
            const date = new Date(dateStr);
            return isNaN(date) ? null : date;
        },

        // Array operations
        firstItem(arr) {
            return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
        },

        lastItem(arr) {
            return Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;
        },

        compactArray(arr) {
            if (!Array.isArray(arr)) return [];
            return arr.filter(item => item !== null && item !== undefined && item !== false && item !== "" && item !== 0);
        },

        withoutItems(arr, ...values) {
            if (!Array.isArray(arr)) return [];
            return arr.filter(item => !values.includes(item));
        },

        unionArrays(...arrays) {
            const combined = arrays.reduce((acc, arr) => Array.isArray(arr) ? acc.concat(arr) : acc, []);
            return [...new Set(combined)];
        },

        // String operations
        trimLeftString(str) {
            return typeof str === "string" ? str.trimStart() : "";
        },

        trimRightString(str) {
            return typeof str === "string" ? str.trimEnd() : "";
        },

        repeatText(str, times) {
            if (typeof str !== "string" || typeof times !== "number" || times < 0) return "";
            return str.repeat(times);
        },

        splitString(str, separator = ",") {
            if (typeof str !== "string") return [];
            return str.split(separator);
        },

        joinArray(arr, separator = ",") {
            if (!Array.isArray(arr)) return "";
            return arr.join(separator);
        },

        // New function - check if number is even
        isEven(num) {
            if (typeof num !== "number") {
                return false;
            }
            return num % 2 === 0;
        }
    });
});