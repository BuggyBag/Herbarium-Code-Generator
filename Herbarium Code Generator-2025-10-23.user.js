// ==UserScript==
// @name         Herbarium Code Generator
// @namespace    http://tampermonkey.net/
// @version      2025-10-23
// @description  Auto-generate catalog codes based on Scientific Name
// @author       Me
// @match        https://herbanwmex.net/portal/collections/editor/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Generate herbarium code from first 2 words
    function generateCode(string) {
        const words = string.trim().split(" ").slice(0, 2); // first 2 words
        let code = "";
        for (let word of words) {
            if (!word) continue;
            code += word.substring(0, 3) + word.charAt(word.length - 1) + "-"; // trailing hyphen
        }
        return code.toUpperCase();
    }

    // Find Scientific Name and Catalogue Number input fields
    function findFields() {
        const sciInput = document.querySelector('#ffsciname') ||
                         document.querySelector('input[name="sciname"]');
        const catalogInput = document.querySelector('#catalognumber') ||
                             document.querySelector('input[name="catalognumber"]');
        return { sciInput, catalogInput };
    }

    // Initialize the script when fields are ready
    function initWhenReady(attempt = 0) {
        const { sciInput, catalogInput } = findFields();

        if (!sciInput || !catalogInput) {
            if (attempt < 30) { // Retry for ~30 seconds
                setTimeout(() => initWhenReady(attempt + 1), 1000);
            } else {
                console.error('❌ Could not find Scientific Name or Catalogue Number fields');
            }
            return;
        }

        // Add blur listener to Scientific Name field
        sciInput.addEventListener('blur', () => {
            const value = sciInput.value.trim();
            if (!value) return;

            const code = generateCode(value);

            // Only update if the value changed
            if (catalogInput.value !== code) {
                catalogInput.value = code;

                // Trigger existing onchange handlers
                catalogInput.dispatchEvent(new Event('input', { bubbles: true }));
                catalogInput.dispatchEvent(new Event('change', { bubbles: true }));

                console.log(`🔹 Herbarium code generated: ${code}`);
            }
        });

        console.log('✅ Herbarium auto-code generator loaded!');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initWhenReady());
    } else {
        initWhenReady();
    }
})();

