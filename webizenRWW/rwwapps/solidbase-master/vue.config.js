var webpack = require('webpack')
const childProcess = require('child_process');

module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

  publicPath: '/',

  pwa: {
    name: 'SolidBase',
    themeColor: 'green',
    workboxOptions: {
      skipWaiting: true
    }
  },

  configureWebpack: {
    externals: {
      '@trust/webcrypto': 'crypto',
      'text-encoding': 'TextEncoder',
    },
    devServer: {
      compress: true,
      disableHostCheck: false  // set to true if no DNS is available for host
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.GIT_COMMITS': childProcess.execSync('git rev-list HEAD --count').toString(),
        'process.env.BUILD_DATE': JSON.stringify((new Date()).toUTCString())
      })
    ]
  }
}
