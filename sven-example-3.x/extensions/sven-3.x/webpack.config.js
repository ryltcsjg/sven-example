const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    sven: './src/sven.js',
  },
  // devtool: "source-map",
  output: {
    //webpack output
    path: path.join(__dirname, '/dependent'),
    filename: '[name].js',
    library: {
      type: 'window',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  // 需要兼容到以下浏览器的什么版本
                  targets: {
                    ie: 7,
                    edge: '17',
                    firefox: '60',
                    chrome: '67',
                    safari: '11.1',
                  },
                  // // 按需加载
                  // useBuiltIns: 'usage',
                  // // 指定core-js版本 看了这个地方如果和你安装的包的版本不一样会报错
                  // corejs: '3.19.3',
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
