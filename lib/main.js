const Prysmo = require('prysmo');
const mergeDeep = require('merge-deep');

/*============================================================================o\
    Instances of this class are Prysmo service gateways according to given
    settings.
\o============================================================================*/
module.exports = class HelloPrysmo{

    /*------------------------------------------------------------------------o\
        Constructor
    \o------------------------------------------------------------------------*/
    constructor(settings){
        this.settings = settings || {};

        // Instace Prysmo server.
        this.server = new Prysmo(settings);

        // Register basic endpoints.
        this.server.entity({
            hello: (s, d, send) => send('Hello Prysmo!'),
            alias: function(){ this.trigger('hello') },
            hellos: (s, d, send) => [...Array(d || 3)].forEach(n => send('Hello ' + n) ),
            reset: async (s, d, send) => {
                send('Bye bye, Prysmo!');
                await this.server.close();
                this.server = new Prysmo(mergeDeep(this.settings, d));
                this.server.listen();
            }
        });

        // register Sesison endpoints.
        this.server.entity({
            set: (s, d) => s[d.key] = d.value,
            get: (s, d, send) => send(s[d]),
            dump: (s, d, send) => send(s)
        }, 'Session.');

        // Register Token endpoints.
        //this.server.endpoint('Token.refresh', function(s, d, send){ send(this.token) });
        this.server.endpoint('Token.check', function(s, d, send){ send(this.token) });

        // Register debug and error endpoints.
        this.server.endpoint('error', () => { throw new Error('Hello Prysmo!'); }, true);
        this.server.endpoint('debug', function(){ this.trigger('error'); });
    }

    /*------------------------------------------------------------------------o\
        Start the Prysmo server.
    \o------------------------------------------------------------------------*/
    start(){
        this.server.listen();
    }

    /*------------------------------------------------------------------------o\
        Stop the Prysmo server.
    \o------------------------------------------------------------------------*/
    async stop(){
        await this.server.close();
    }

    /*------------------------------------------------------------------------o\
        Stop and start the Prysmo server.
    \o------------------------------------------------------------------------*/
    async restart(){
        await this.server.close();
        this.server.listen();
    }
}
