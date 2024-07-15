const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const config = {
  entry: './demo/demo.js',
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.(css|glsl)$/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    alias: {
      kedan: path.resolve(__dirname, 'src/kedan.js'),
    },
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development')
    return {
      ...config,
      devtool: 'inline-source-map',
      devServer: {
        static: { directory: config.output.path },
        host: '192.168.1.10',
        port: 8080,
        historyApiFallback: true,
      },
    };

  return {
    ...config,
    optimization: {
      minimize: true,
      usedExports: true,
      minimizer: [new TerserPlugin({ extractComments: false })],
    },
  };
};
