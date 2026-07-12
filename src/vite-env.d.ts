/// <reference types="vite/client" />

// @fontsource packages ship CSS only (no TS types). Declare them so the
// side-effect imports in main.tsx type-check.
declare module "@fontsource-variable/*";
declare module "@fontsource/*";
