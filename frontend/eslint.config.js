import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
    js.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    {
        files: ["**/*.vue", "**/*.js"],
        languageOptions: {
           ecmaVersion: 2022,
           sourceType: "module"
        },
        rules: {
            "vue/multi-word-component-names": "off" 
        }
    }
];
