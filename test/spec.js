const wtf = require('wtfnode');
const assert = require('assert');

//const delay = s => new Promise(done => setTimeout(done, s * 1000));

const HelloPrysmo = require('../lib/main');
const WebSocket = require('ws');

describe('HelloPrysmo', () => {

    after(() => wtf.dump());

    describe('::constructor', () => {

        it('should start the server', () => {
            let p = new HelloPrysmo();
            assert.equal(typeof p.server, 'object');
        });

        it('should read settings object', () => {
            let p = new HelloPrysmo({ custom: true });
            assert(p.settings.custom);
        });

    });

    describe('#start', () => {

        it('should listen on default port', done => {
            let p = new HelloPrysmo();
            p.start();

            let c = new WebSocket('ws://localhost:7667');
            c.on('open', () => {
                p.stop();
                done();
            });
        });

    });

    describe('#stop', () => {

        it('should stop all server components', done => {
            let p = new HelloPrysmo();
            p.start();
            p.stop();

            let c = new WebSocket('ws://localhost:7667');
            c.on('error', e => {
                assert(e);
                done();
            });
        });

    });

    describe('#restart', () => {

        it('should stop and start over all server components', done => {
            let p = new HelloPrysmo();
            p.start();
            p.restart();

            let c = new WebSocket('ws://localhost:7667');
            c.on('open', () => {
                p.stop();
                done();
            });
        });

    });

    describe('Interaction', () => {

        let p, c;
        beforeEach(() => {
            p = new HelloPrysmo();
            p.start();
            c = new WebSocket('ws://localhost:7667', ['other', 'prysmo']);
        });

        afterEach(() => {
            p.stop();
            c.terminate();
        });

        describe('> hello', () => {

            it('should say hello', done => {
                c.on('open', () => c.send('{"endpoint":"hello"}') );
                c.on('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(m.data, 'Hello Prysmo!');
                    done();
                });
            });

        });

        describe('> alias', () => {

            it('should say hello', done => {
                c.on('open', () => c.send('{"endpoint":"alias"}') );
                c.on('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(m.data, 'Hello Prysmo!');
                    done();
                });
            });

        });

        describe('> hellos', () => {

            it('should say hello 3 times', done => {
                c.on('open', () => c.send('{"endpoint":"hellos"}') );
                let i = 0;
                c.on('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(typeof m.data, 'string');
                    i++;
                    if(i == 3)
                        done();
                });
            });

            it('should say hello N times', done => {
                c.on('open', () => c.send('{"endpoint":"hellos", "data": 5}') );
                let i = 0;
                c.on('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(typeof m.data, 'string');
                    i++;
                    if(i == 5)
                        done();
                });
            });

        });

        describe('> reset', () => {

            it('should restart the server with new settings', done => {
                c.on('open', () => c.send('{"endpoint":"reset", "data": { "test":true }}') );
                c.on('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(m.data, 'Bye bye, Prysmo!');
                    c2 = new WebSocket('ws://localhost:7667', ['other', 'prysmo']);
                    c2.on('open', () => {
                        assert(p.server.settings.test);
                        done();
                    });
                });
            });

        });

        describe('> Session.*', () => {

            it('should dump session contents', done => {
                c.on('open', () => c.send('{"token":"null"}') );
                c.once('message', () => {
                    c.once('message', e => {
                        let m = JSON.parse(e);
                        assert.equal(m.data.expiryDate, null);
                        done();
                    });
                    c.send('{"endpoint":"Session.dump"}');
                });
            });

            it('should get sesison key', done => {
                c.on('open', () => c.send('{"token":"null"}') );
                c.once('message', () => {
                    c.once('message', e => {
                        let m = JSON.parse(e);
                        assert.equal(m.data, null);
                        done();
                    });
                    c.send('{"endpoint":"Session.get","data":"expiryDate"}');
                });
            });

            it('should set sesison key', done => {
                c.on('open', () => c.send('{"token":"null"}') );
                c.once('message', () => {
                    c.send('{"endpoint":"Session.set","data":{"key":"test","value":2}}');
                    c.send('{"endpoint":"Session.get","data":"test"}');
                    c.once('message', e => {
                        let m = JSON.parse(e);
                        assert.equal(m.data, 2);
                        done();
                    });
                });
            });

        });

        describe('> Token.*', () => {

            it('should send a token back', done => {
                c.on('open', () => c.send('{"token":"null"}') );
                c.once('message', () => {
                    c.send('{"endpoint":"Token.check"}');
                    c.once('message', e => {
                        let m = JSON.parse(e);
                        assert.equal(typeof m.data, 'string');
                        done();
                    });
                });
            });

        });

        describe('> debug', () => {

            it('should send an endpoint error', done => {
                c.on('open', () => c.send('{"endpoint":"debug"}') );
                c.once('message', e => {
                    let m = JSON.parse(e);
                    assert.equal(m.error, 'Hello Prysmo!');
                    done();
                });
            });

        });

    });

});
