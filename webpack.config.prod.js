const webpack = require('webpack');
const path = require("path");

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    compress: true,
    port: 5050,
  },
  mode: "production",
  entry: {
    "img-scatter": [
      "./src/index.ts",
    ],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    publicPath: "/img-scatter/",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "hidden-source-map",
  optimization: {
    splitChunks: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        VERSION: JSON.stringify(require("./package.json").version),
      },
    }),
    new CleanWebpackPlugin(),
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
          { loader: "ts-loader" },
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
              name: '[name].[hash].[ext]',
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
