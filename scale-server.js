var argv = require('minimist')(process.argv.slice(2));
console.log(argv);
var SocketCluster = require('socketcluster').SocketCluster;

var socketCluster = new SocketCluster({
  transports: [ 'websocket', 'polling'],
  balancers: Number(argv.b) || 1,
  workers: Number(argv.w) || 2,
  stores: Number(argv.s) || 1,
  port: Number(argv.p) || 8000,
  appName: argv.n || 'app',
  workerController: __dirname + '/worker.js',
  socketChannelLimit: 100,
  rebootWorkerOnCrash: !argv.debug
});