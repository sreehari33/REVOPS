const path = require("path");

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react/jsx-dev-runtime': 'react/jsx-runtime',
    },
    configure: (webpackConfig) => {
      // Remove react-refresh in production
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
      );

      // Force production React
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          'react/jsx-dev-runtime': 'react/jsx-runtime',
        }
      };

      return webpackConfig;
    },
  },
};
