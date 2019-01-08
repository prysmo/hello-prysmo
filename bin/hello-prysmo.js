#!node
const fs = require('fs');
const toml = require('toml');
const cli = require('cli');
const HelloPrysmo = require('../lib/main');

let opts = cli.parse({
    conf: ['c', 'The absolute path to the configuration file.', 'file']
});

(async function(){
    try{
        let conf = opts.conf || process.env.HELLO_PRYSMO_CONF || false;
        let settings = conf ? toml.parse(fs.readFileSync(conf)) : {};
        let ag = new HelloPrysmo(settings);

        function handle(){ ag.stop(); }

        process.on('SIGINT', handle);
        process.on('SIGTERM', handle);

        await ag.start();
        console.log('%s listening at %s', ag.server.name, ag.server.port);
    }
    catch(e){
        console.log(e.message);
        console.log(e.stack || '');
    }
})();
