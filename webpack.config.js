const path = require('path');

module.exports = () => {
  const entry = './demo/demo.js';
  const output = {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'demo'),
  };

  const config = {
    entry,
    output,
    module: {
      rules: [
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
    devtool: 'inline-source-map',
    devServer: {
      static: { directory: output.path },
      host: '192.168.1.10',
      port: 8080,
      historyApiFallback: true,
    },
  };

  return config;
};
