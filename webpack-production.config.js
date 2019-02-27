const webpack = require('webpack');
const path = require('path');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
  mode: 'production',
  entry: {
    main: [
      'babel-polyfill',
      './src/app.jsx',
    ],
  },
  // Render source-map file for final build
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  // output config
  output: {
    path: path.resolve(__dirname, 'build'), // Path of output file
    filename: 'app.js', // Name of output file
    publicPath: '/',
  },
  plugins: [
    // Define production build to allow React to strip out unnecessary checks
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    // Transfer Files
    new TransferWebpackPlugin([
      { from: 'public' },
    ]),
  ],
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      },
    ],
  },
};

module.exports = config;
