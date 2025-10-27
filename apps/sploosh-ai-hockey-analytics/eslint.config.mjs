import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        ignores: ["scripts/**/*.js", "tailwind.config.ts"],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "@next/next/no-img-element": "warn",
            "import/no-anonymous-default-export": "off",
        },
    },
];