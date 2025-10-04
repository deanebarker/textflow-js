const path = require("path");
const webpack = require("webpack");

// Load environment variables
require("dotenv").config();

module.exports = {
  mode: "production",
  target: "web",
  entry: "./src/textflow.js",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.liquid$/i,
        type: "asset/source",
      },
    ],
  },

  output: {
    // Use environment variable for output path, fallback to dist
    path: process.env.WEBPACK_OUTPUT_PATH || path.resolve(__dirname, "dist"),
    filename: "textflow.min.js",
    module: true,
    chunkFormat: "module",
    library: { type: "module" },
  },

  experiments: {
    outputModule: true,
  },

  optimization: {
    splitChunks: false,
    runtimeChunk: false,
    minimize: true,
  },
  plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
};
