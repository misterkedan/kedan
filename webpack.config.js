const path = require('path');

module.exports = {
  entry: './src/test.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'test'),
  },
  module: {
    rules: [
      {
        test: /\.(glsl)$/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    alias: {
      kedan: path.resolve(__dirname, 'src/kedan.js'),
    },
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'test'),
    },
    host: '192.168.1.10',
    port: 8080,
    historyApiFallback: true,
  },
};
