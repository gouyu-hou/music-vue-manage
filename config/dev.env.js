'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // 🔥 新增：本地开发依然用 localhost
  API_HOST: '"http://localhost:8085"'
})