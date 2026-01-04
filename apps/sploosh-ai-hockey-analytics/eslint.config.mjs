import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        ignores: ["scripts/**/*.js", "tailwind.config.ts", "coverage/**"],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off", // Allow any types in utility functions
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "react-hooks/exhaustive-deps": "off", // Disable for now, requires careful review
            "react-hooks/set-state-in-effect": "off", // Intentional pattern for SSR/client-side initialization
            "@next/next/no-img-element": "off", // Team logos from external CDN work better with img
            "import/no-anonymous-default-export": "off",
        },
    },
];