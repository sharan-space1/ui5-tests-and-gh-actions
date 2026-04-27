sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("com.asint.project1.controller.App", {
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

      // Array operations
      sum(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
          return 0;
        }
        return arr.reduce((acc, val) => acc + val, 0);
      },

      average(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
          return 0;
        }
        return this.sum(arr) / arr.length;
      },

      max(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
          return null;
        }
        return Math.max(...arr);
      },

      min(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
          return null;
        }
        return Math.min(...arr);
      },

      unique(arr) {
        if (!Array.isArray(arr)) {
          return [];
        }
        return [...new Set(arr)];
      },

      // Date operations
      addDays(date, days) {
        if (!date || !(date instanceof Date)) {
          return null;
        }
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      },

      subtractDays(date, days) {
        if (!date || !(date instanceof Date)) {
          return null;
        }
        return this.addDays(date, -days);
      },

      getDaysBetween(date1, date2) {
        if (!date1 || !(date1 instanceof Date) || !date2 || !(date2 instanceof Date)) {
          return null;
        }
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      },

      isWeekend(date) {
        if (!date || !(date instanceof Date)) {
          return false;
        }
        const day = date.getDay();
        return day === 0 || day === 6;
      },

      formatTime(date) {
        if (!date || !(date instanceof Date)) {
          return "";
        }

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      }
  });
});