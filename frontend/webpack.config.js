const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.js',
    mode: "development",
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        static: '.dist',
        compress: true,
        port: 9000,
    },
    plugins: [new HtmlWebpackPlugin({
        template: "./index.html"
    }),
        new CopyPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'templates'),
                    to: path.resolve(__dirname, 'dist/templates')},
                {from: path.resolve(__dirname, 'styles'),
                    to: path.resolve(__dirname, 'dist/styles')},
                {from: path.resolve(__dirname, 'static/fonts'),
                    to: path.resolve(__dirname, 'dist/fonts')},
                {from: path.resolve(__dirname, 'static/images'),
                    to: path.resolve(__dirname, 'dist/images')}
            ]
        })
    ],
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: 'babel-loader',
    //                 options: {
    //                     presets: [
    //                         ['@babel/preset-env']
    //                     ]
    //                 }
    //             }
    //         }
    //     ]
    // }
};