import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const listOutputFilesPlugin = {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("ListOutputFiles", (compilation) => {
      const outPath = compilation.outputOptions.path;
      console.log("\nFiles written to disk:");
      for (const filename of Object.keys(compilation.assets)) {
        console.log("  " + path.join(outPath, filename));
      }
    });
  },
};

export default {
  mode: "production",
  target: "web",
  entry: "./src/textflow.js",
  module: {
    rules: [
      {
        test: /\.liquid$/i,
        type: "asset/source",
      },
      {
        test: /\.json$/,
        type: "json",
        exclude: /package\.json$/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "textflow.min.js",
    module: true,
    chunkFormat: "module",
    library: { type: "module" },
  },
  externals: {
    jsdom: 'jsdom', // Exclude jsdom from bundle (only needed in Node.js)
    'markdown-it': 'markdown-it', // Exclude markdown-it (optional command, example only)
  },
  externalsPresets: {
    node: false,
    web: true,
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
    minimize: true,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(vitest|jest|@testing-library)$/,
    }),
    listOutputFilesPlugin,
  ],
};
