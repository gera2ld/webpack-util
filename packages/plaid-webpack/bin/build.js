process.env.NODE_ENV = 'production';

const fs = require('fs-extra');
const webpack = require('webpack');
const {
  loadProjectConfig,
  findWebpackConfig,
  loadWebpackConfig,
  exists,
  webpackCallback,
} = require('@gera2ld/plaid/util');

async function prebuild(cmd) {
  const { distDir, publicDir } = await loadProjectConfig();
  if (!cmd.keep) await fs.emptyDir(distDir);
  if (cmd.copy && await exists(publicDir, { dir: true })) {
    await fs.copy(publicDir, distDir);
  }
}

async function buildWithCLI() {
  process.argv = [
    process.argv[0],
    'webpack-cli',
    '--config',
    await findWebpackConfig(),
  ];
  require('webpack-cli/bin/cli');
}

async function buildWithAPI() {
  const compiler = webpack(await loadWebpackConfig());
  await new Promise((resolve, reject) => compiler.run(webpackCallback(resolve, reject)));
}

async function build(cmd) {
  if (cmd.analyze) process.env.RUN_ENV = 'analyze';
  await prebuild(cmd);
  await (cmd.api ? buildWithAPI : buildWithCLI)();
}

module.exports = build;
