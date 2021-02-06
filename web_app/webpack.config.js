const path = require("path");
const webpack = require("webpack");
const prefixed = require("autoprefixer");
const html_plugin = require("html-webpack-plugin");
const mini_css = require("mini-css-extract-plugin");

let outputPath = path.resolve(__dirname, "../extension/web_app/www"),
  minify_options = {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
  };

module.exports = {
  entry: "./src/js/plugin.js",
  output: {
    path: outputPath,
    filename: "app.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_moudles/,
        use: [
          mini_css.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
          "import-glob-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg)$/,
        exclude: /node_modules/,
        use: {
          loader: "file-loader",
          options: {
            name: "[contenthash].[ext]",
            outputPath: "assets/img",
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2?)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[name]-[hash:8].[ext]",
          },
        },
      },
    ],
  },
  devServer: {
    port: 9009,
    stats: "errors-only",
    open: true,
    hot: true,
  },
  plugins: [
    new html_plugin({
      title: "PNGER extension host",
      bannertitle: "PNGER",
      template: `src/index.html`,
      filename: `${outputPath}/index.html`,
      // ↓ comment to ignore minify in dev ↓
      minify: minify_options,
    }),
    new mini_css({
      filename: "style.css",
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedChunksPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [prefixed()],
      },
    }),
  ],
};
