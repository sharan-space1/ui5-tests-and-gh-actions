sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("com.asint.project2.controller.App", {
      onInit() {
      },

      // Math operations
      square(n) {
        return typeof n === "number" ? n * n : null;
      },

      cube(n) {
        return typeof n === "number" ? n * n * n : null;
      },

      factorial(n) {
        if (typeof n !== "number" || n < 0 || !Number.isInteger(n)) return null;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
      },

      fibonacci(n) {
        if (typeof n !== "number" || n < 0 || !Number.isInteger(n)) return null;
        if (n === 0) return 0;
        if (n === 1) return 1;
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
          let temp = a + b;
          a = b;
          b = temp;
        }
        return b;
      },

      gcd(a, b) {
        if (typeof a !== "number" || typeof b !== "number") return null;
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
          let temp = b;
          b = a % b;
          a = temp;
        }
        return a;
      },

      // Text processing
      slugify(str) {
        if (typeof str !== "string") return "";
        return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      },

      camelCase(str) {
        if (typeof str !== "string") return "";
        return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      },

      snakeCase(str) {
        if (typeof str !== "string") return "";
        return str.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w_]/g, "");
      },

      titleCase(str) {
        if (typeof str !== "string") return "";
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
      },

      wordWrap(str, width) {
        if (typeof str !== "string" || typeof width !== "number") return "";
        const regex = new RegExp(`.{1,${width}}`, "g");
        return str.match(regex)?.join("\n") || "";
      },

      // Data validation
      isURL(str) {
        if (typeof str !== "string") return false;
        const urlRegex = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
        return urlRegex.test(str);
      },

      isPhone(str) {
        if (typeof str !== "string") return false;
        const phoneRegex = /^[\d\s()+-]{10,}$/;
        return phoneRegex.test(str.trim());
      },

      isCreditCard(str) {
        if (typeof str !== "string") return false;
        const ccRegex = /^\d{13,19}$/;
        return ccRegex.test(str.replace(/\s/g, ""));
      },

      isIPAddress(str) {
        if (typeof str !== "string") return false;
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(str)) return false;
        return str.split(".").every(num => parseInt(num) <= 255);
      },

      isHexColor(str) {
        if (typeof str !== "string") return false;
        const hexRegex = /^#?[0-9A-Fa-f]{6}$/;
        return hexRegex.test(str);
      },

      // Array helpers
      flatten(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.reduce((flat, item) => flat.concat(Array.isArray(item) ? this.flatten(item) : item), []);
      },

      chunk(arr, size) {
        if (!Array.isArray(arr) || typeof size !== "number" || size <= 0) return [];
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      },

      zip(...arrays) {
        if (arrays.length === 0) return [];
        const maxLength = Math.max(...arrays.map(arr => Array.isArray(arr) ? arr.length : 0));
        return Array.from({ length: maxLength }, (_, i) => arrays.map(arr => arr?.[i]));
      },

      difference(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
        return arr1.filter(item => !arr2.includes(item));
      },

      intersection(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
        return arr1.filter(item => arr2.includes(item));
      },

      // Object helpers
      merge(obj1, obj2) {
        if (typeof obj1 !== "object" || typeof obj2 !== "object") return {};
        return { ...obj1, ...obj2 };
      },

      clone(obj) {
        if (typeof obj !== "object" || obj === null) return obj;
        return JSON.parse(JSON.stringify(obj));
      },

      pick(obj, keys) {
        if (typeof obj !== "object" || !Array.isArray(keys)) return {};
        return keys.reduce((result, key) => {
          if (key in obj) result[key] = obj[key];
          return result;
        }, {});
      },

      omit(obj, keys) {
        if (typeof obj !== "object" || !Array.isArray(keys)) return {};
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
      },

      isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === "object") return Object.keys(obj).length === 0;
        return false;
      },

      // String utilities
      repeatString(str, times) {
        if (typeof str !== "string" || typeof times !== "number" || times < 0) return "";
        return str.repeat(times);
      },

      padStartString(str, length, char = " ") {
        if (typeof str !== "string") return "";
        return str.padStart(length, char);
      },

      padEndString(str, length, char = " ") {
        if (typeof str !== "string") return "";
        return str.padEnd(length, char);
      },

      containsString(str, searchStr) {
        if (typeof str !== "string" || typeof searchStr !== "string") return false;
        return str.includes(searchStr);
      },

      startsWithString(str, searchStr) {
        if (typeof str !== "string" || typeof searchStr !== "string") return false;
        return str.startsWith(searchStr);
      }
  });
});