const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include:[path.resolve(__dirname, 'src')]
      },
    ],
  },
  resolve: {
    extensions: [".ts", '.js']
  },
  output: {
    publicPath: path.resolve(__dirname, 'client'),
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client'),
  },
};