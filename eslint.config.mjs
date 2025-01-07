import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReactConfig,
    {
        ignores: ["functions/lib/**", "build/**"],
    },
    {
        rules: {
            // suppress errors for missing 'import React' in files
            "react/react-in-jsx-scope": "off",
            // allow jsx syntax in js files (for next.js project)
            "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }], //should add ".ts" if typescript project
            semi: "error",
            "prefer-const": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-var-requires": 0,
        },
    },
];
