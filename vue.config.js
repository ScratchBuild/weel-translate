const path = require('path');
const GenerateJsonPlugin = require('generate-json-webpack-plugin')
const ReplaceInFile = require('replace-in-file-webpack-plugin')

// firefox, chrome, etc
const TARGET_BROWSER = process.env.TARGET_BROWSER || 'web'
const AMO_ID = `@weel-translate`

module.exports = {
  outputDir: `dist/${TARGET_BROWSER}`,

  pages: {
    'background/main': 'src/pages/background.ts',
    'popup/main': 'src/pages/popup.ts',
    'options/main': 'src/pages/options.ts',
    'content/main': 'src/pages/content.ts'
  },

  filenameHashing: false,

  // crossorigin: true,

  productionSourceMap: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },

  chainWebpack: config => {
    config
      .devtool('inline-source-map')
      .node.set('global', false)
      .end()
      .plugin('define')
        .tap(args => {
          return [{
            ...args[0]['process.env'],

            // gloabl: 'window', // repeat gloabl object to window

            TARGET_BROWSER: JSON.stringify(TARGET_BROWSER),
            RUNTIME_ENV: JSON.stringify(process.env.NODE_ENV)
          }]
        })

    if (TARGET_BROWSER !== 'web') {
      const { version } = require(`./package.json`)
      const base = require(`./src/assets/manifests/${TARGET_BROWSER}.base.json`)
      const target = require(`./src/assets/manifests/${TARGET_BROWSER}.${process.env.NODE_ENV}.json`)
      const modify = { ...target, version }

      if (process.env.TARGET_PLATFORM === 'amo') {
        modify.applications = base.applications
        modify.applications.gecko.id = AMO_ID;
      }

      config.plugin('generate-json')
        .use(GenerateJsonPlugin, ['manifest.json', { ...base, ...modify }])
    }

    if (
      process.env.NODE_ENV === 'production' &&
      process.env.VUE_CLI_MODERN_BUILD &&
      process.env.VUE_CLI_MODERN_MODE
    ) {
      const search = `"undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")()`;
      const replace = 'window'

      config.plugin('replace-in-file')
        .use(ReplaceInFile, [[{
          dir: 'dist/firefox/js',
          files: ['chunk-vendors.js'],
          rules: [{ search, replace }]
        }]])
    }

    // console.log(config.toConfig().plugins)
  },

  css: {
    loaderOptions: {
      sass: {
        includePaths: [path.resolve(__dirname, 'node_modules')],
      },
    },
  },
}
