const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const TerserPlugin = require("terser-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");

const client = function (env) {
  const { prod, production } = env;
  const isEnvProduction = prod || production;

  const devConfig = {};
  if (!isEnvProduction) {
    Object.assign(devConfig, {
      devServer: {
        compress: true,
        port: 9000,
        host: "0.0.0.0",
        // devMiddleware: {
        //   writeToDisk: true,
        // },
        open: true,
        historyApiFallback: true,
      },
    });
  }
  return {
    name: "client",
    mode: isEnvProduction ? "production" : "development",
    entry: "./src/main.js",
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist/"),
    },
    devtool: isEnvProduction ? "hidden-source-map" : "eval",
    resolve: {
      //别名
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".vue", ".js"],
    },
    ...devConfig,
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false, //不将注释提取到单独的文件中
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.s(a|c)ss$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.vue$/,
          loader: "vue-loader",
        },
        {
          test: /\.(m?js)$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
      }),
      new ESLintPlugin({
        failOnError: true,
      }),
      new VueLoaderPlugin(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  };
};

const server = function (env) {
  const { prod, production } = env;
  const isEnvProduction = prod || production;

  return {
    name: "server",
    // mode: isEnvProduction ? "production" : "development",
    mode: "development",
    entry: {
      server: "./server/index.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist/"),
    },
    resolve: {
      extensions: [".js"],
    },
    plugins: [
      new webpack.DefinePlugin({
        isProd: isEnvProduction,
      }),
    ],
    target: "electron-main",
  };
};
module.exports = [client, server];
