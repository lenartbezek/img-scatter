const webpack = require('webpack');
const path = require("path");

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    hot: true,
    inline: true,
    port: 5050,
  },
  mode: "development",
  entry: {
    "img-scatter": [
      "./src/index.ts",
    ],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "eval-source-map",
  optimization: {
    splitChunks: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.ejs",
      hash: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(?:ts|js)$/,
        loaders: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        include: path.join(__dirname, "src"),
        exclude: /node_modules/,
      },
      {
        test: /\.(?:png|jpg)$/,
        loaders: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'img',
            }
          },
        ],
        include: path.join(__dirname, 'assets'),
      },
      {
        test: /\.(?:ejs)$/,
        loaders: [
          { loader: 'ejs-compiled-loader' },
        ]
      },
    ],
  },
};
