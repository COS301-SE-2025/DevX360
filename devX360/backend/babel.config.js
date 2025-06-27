module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current", // Use current Node version for compiling
        },
      },
    ],
    // Uncomment if you want JSX support (React)
    // "@babel/preset-react"
  ],
  plugins: [
    // Enable parsing of import/export syntax in Jest tests
    "@babel/plugin-transform-modules-commonjs"
  ],
};
