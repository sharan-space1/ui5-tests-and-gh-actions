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
        },

        something2(str1, str2) {
          if(!str1) {
            return "Invalid";
          }
          return str1 + "@" + str2;
        },

        something3(str1, str2) {
          if(!str1) {
            return "Invalid";
          }
          return str1 + "#" + str2;
        },

        something4(str1, str2) {
          if(!str1) {
            return "Invalid";
          }
          return str1 + "&" + str2;
        },

        // Complex function for testing coverage
        processUserData(userData) {
          // Multiple branches and conditions
          if (!userData) {
            return { error: "No data provided", status: "error" };
          }

          if (typeof userData !== "object") {
            return { error: "Invalid data type", status: "error" };
          }

          const result = {
            status: "success",
            data: {},
            warnings: []
          };

          // Check name
          if (!userData.name || userData.name.trim() === "") {
            result.warnings.push("Name is missing");
            result.data.name = "Unknown";
          } else if (userData.name.length < 3) {
            result.warnings.push("Name is too short");
            result.data.name = userData.name;
          } else if (userData.name.length > 50) {
            result.warnings.push("Name is too long");
            result.data.name = userData.name.substring(0, 50);
          } else {
            result.data.name = userData.name;
          }

          // Check age
          if (!userData.age) {
            result.warnings.push("Age is missing");
            result.data.age = 0;
          } else if (typeof userData.age !== "number") {
            result.warnings.push("Age must be a number");
            result.data.age = 0;
          } else if (userData.age < 0) {
            result.warnings.push("Age cannot be negative");
            result.data.age = 0;
          } else if (userData.age < 18) {
            result.data.age = userData.age;
            result.data.category = "minor";
          } else if (userData.age >= 18 && userData.age < 65) {
            result.data.age = userData.age;
            result.data.category = "adult";
          } else {
            result.data.age = userData.age;
            result.data.category = "senior";
          }

          // Check email
          if (!userData.email) {
            result.warnings.push("Email is missing");
          } else if (!this.isEmail(userData.email)) {
            result.warnings.push("Email format is invalid");
          } else {
            result.data.email = userData.email;
          }

          // Check role
          if (userData.role) {
            if (userData.role === "admin") {
              result.data.permissions = ["read", "write", "delete", "admin"];
            } else if (userData.role === "editor") {
              result.data.permissions = ["read", "write"];
            } else if (userData.role === "viewer") {
              result.data.permissions = ["read"];
            } else {
              result.warnings.push("Unknown role, defaulting to viewer");
              result.data.permissions = ["read"];
            }
          } else {
            result.data.permissions = ["read"];
          }

          // Check status
          if (userData.active === true) {
            result.data.status = "active";
          } else if (userData.active === false) {
            result.data.status = "inactive";
          } else {
            result.data.status = "unknown";
          }

          return result;
        },

        // Validation function - validate password strength
        isStrongPassword(password) {
          if (typeof password !== "string" || password.length < 8) {
            return false;
          }
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },

        // String operation - convert to title case
        toTitleCase(str) {
          if (typeof str !== "string" || str.trim().length === 0) {
            return "";
          }
          return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');
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