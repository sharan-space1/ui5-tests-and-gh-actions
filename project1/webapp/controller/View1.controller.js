sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.asint.project1.controller.View1", {
        onInit() {
        },

        // Calculation functions
        add(a, b) {
          return a + b;
        },

        subtract(a, b) {
          return a - b;
        },

        multiply(a, b) {
          return a * b;
        },

        divide(a, b) {
          if (b === 0) {
            return null;
          }
          return a / b;
        },

        percentage(value, total) {
          if (total === 0) {
            return 0;
          }
          return (value / total) * 100;
        },

        // Formatting functions
        formatDate(date) {
          if (!date || !(date instanceof Date)) {
            return "";
          }
          return date.toISOString().split('T')[0];
        },

        formatCurrency(amount, currency = "USD") {
          if (typeof amount !== "number") {
            return "";
          }
          return `${currency} ${amount.toFixed(2)}`;
        },

        formatNumber(number, decimals = 2) {
          if (typeof number !== "number") {
            return "";
          }
          return number.toFixed(decimals);
        },

        formatPercentage(value) {
          if (typeof value !== "number") {
            return "";
          }
          return `${value.toFixed(2)}%`;
        },

        formatBoolean(value) {
          return value ? "Yes" : "No";
        },

        // Validation functions
        isEmail(email) {
          if (typeof email !== "string") {
            return false;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },

        isNumeric(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        },

        isRequired(value) {
          if (value === null || value === undefined) {
            return false;
          }
          if (typeof value === "string") {
            return value.trim().length > 0;
          }
          return true;
        },

        isInRange(value, min, max) {
          return value >= min && value <= max;
        },

        isPositive(value) {
          return typeof value === "number" && value > 0;
        },

        // String operations
        capitalize(str) {
          if (typeof str !== "string" || str.length === 0) {
            return "";
          }
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        truncate(str, length) {
          if (typeof str !== "string") {
            return "";
          }
          if (str.length <= length) {
            return str;
          }
          return str.substring(0, length) + "...";
        },

        reverse(str) {
          if (typeof str !== "string") {
            return "";
          }
          return str.split("").reverse().join("");
        },

        removeSpaces(str) {
          if (typeof str !== "string") {
            return "";
          }
          return str.replace(/\s+/g, "");
        },

        countWords(str) {
          if (typeof str !== "string" || str.trim().length === 0) {
            return 0;
          }
          return str.trim().split(/\s+/).length;
        },

        something1(str1, str2) {
          if(!str1) {
            return "Invalid";
          }
          return str1 + "+" + str2;
        }
    });
});