/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const sass = require("sass");

module.exports = {
    mode: "production",
    context: __dirname,
    entry: ["babel-polyfill", "./client/src/index.js"],
    devtool: "source-map",

    output: {
        path: path.resolve(__dirname, "client/dist"),
        filename: "bundle.min.js",
        publicPath: "",
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "bundle.min.css",
        }),
        new HtmlWebpackPlugin({
            template: "client/index-template.html",
            favicon: "client/assets/GurrIcon.png",
            minify: {
                collapseWhitespace: false,
            },
            publicPath: "./dist",
        }),
    ],

    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: [
                    path.resolve(__dirname, "server"),
                    path.resolve(__dirname, "node_modules"),
                ],
                loader: "babel-loader",
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader",
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: sass,
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "images",
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|ttf|otf|eot)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "fonts",
                        },
                    },
                ],
            },
        ],
    },
};
