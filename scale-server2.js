var argv = require('minimist')(process.argv.slice(2));
console.log(argv);
var SocketCluster = require('socketcluster').SocketCluster;

var socketCluster = new SocketCluster({
  transports: [ 'websocket', 'polling'],
  balancers: Number(argv.b) || 2,
  workers: Number(argv.w) || 1,
  stores: Number(argv.s) || 2,
  port: Number(argv.p) || 8000,
  appName: argv.n || 'app',
  workerController: __dirname + '/worker2.js',
  socketChannelLimit: 100,
  rebootWorkerOnCrash: !argv.debug
});