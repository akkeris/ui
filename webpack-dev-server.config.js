const webpack = require('webpack');
const path = require('path');// eslint-disable-line no-unused-vars

const config = {
  mode: 'development',
  cache: true,
  // Entry points to the project
  entry: {
    main: [
      // only- means to only hot reload for successful updates
      'babel-polyfill',
      'webpack-hot-middleware/client?reload=true',
      './src/app.jsx',
    ],
  },
  target: 'web',
  devtool: 'eval-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: __dirname, // Path of output file
    filename: 'app.js',
    publicPath: 'http://localhost:3000/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externals: {
    externals: {
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': true,
      'react-addons-test-utils': 'react-dom',
    },
  },
};

module.exports = config;
