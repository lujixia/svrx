
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')

// Ejs template, used to inject initialize service to  client


class IO {


    constructor({ server }){
        // this._channel = sse( server );
        this._services = {}
        this._handlers = {}
        this.renderClient = ejs.compile(
            fs.readFileSync(
                path.join( __dirname, './io.client.js.ejs' ),
                'utf8'
            )
        )
    }



    // socketio server attach to app
    attach( app, opts ){
        // if not already listen
        const server = app.server || (app.server = this._createServer(app))

        this._io = new IO( server )

        app.listen = function(){
            return server.listen.apply(server, arguments);
        }
    }


    //  Serialization Script to Browser
    pickle(){

        return this.clientRender({
            services: this._services,
            handlers: this._handlers
        })

    }

    register( service, handler ){

        if(this._services[service] !== undefined){
            throw Error(`service [${service}] has been registed`)
        }
        if( typeof this._services[service] !== 'function'){
            throw Error(`service [${service}] must been an function`)
        }

        this._services[service] = handler
    }

    call( service, params ){

    }

    on( event, handler ){

    }

    emit(event, handler){

    }

    off(event, handler){

    }
    

}



module.exports = IO;
