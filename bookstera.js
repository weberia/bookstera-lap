'use strict';

const Hapi = require('hapi');
var Path = require('path');
var Inert = require('inert');
var Zax = require('zax');
 
const zax = new Zax();

const server = new Hapi.Server();
server.connection({ port: 8000 });

var r = require('rethinkdb')
var cn = null;
r.connect( {host: 'archera', port: 28015, db: 'bookstera'}, function(err, conn) {
  if (err) throw err;
  cn = conn;
})

server.register(require('vision'), (err) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views/common'
  });
});

server.register(Inert, (err) => {

  if (err) {
    throw err;
  }

  server.route({

    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public'),
        listing: true
      }
    }

  });

});

let uuid = 1;       // Use seq instead of proper unique identifiers for demo only

const users = {
  buyer: {
    id: 'buyer',
    password: '123',
    name: 'XYZ University'
  },
  seller: {
    id: 'seller',
    password: '123',
    name: 'Bookstera Expert'
  }
};

const home = function (request, reply) {

    reply.view('index', { 
      message: 'Welcome ' + 
               request.auth.credentials.name + 
              '!</h3><br/><form method="get" action="/logout">' +
              '<input type="submit" value="Logout">' +
              '</form></body>',
      whoami: request.auth.credentials.name,
      title: 'Home'
    });

};

const goals = function (request, reply) {

    reply.view('index', { 
      message: 'Msg goals',
      whoami: request.auth.credentials.name,
      title: 'Goals and Progress'
    });

};

const ontology = function (request, reply) {

    reply.view('index', { 
      message: 'Msg ontology',
      whoami: request.auth.credentials.name,
      title: 'Ontology and Shared Meaning'
    });

};

const notes = function (request, reply) {

    reply.view('index', { 
      message: 'Msg notes',
      whoami: request.auth.credentials.name,
      title: 'Notes'
    });

};

const discourses = function (request, reply) {

    reply.view('index', { 
      message: 'Msg discourses',
      whoami: request.auth.credentials.name,
      title: 'Discourses'
    });

};

const speax = function (request, reply) {

  var query = request.params.param;

  var qReceived = zax.query(query);

  switch (qReceived.force) {
    case 'request':
      reply('{"req": "' + qReceived.directivePropositional + '"}' );
      break;
    case 'assert':
      var p = qReceived.assertivePropositional;
      reply('{"9781617292019": 100}' );
      break;
    default:
      reply('{"req": "default"}' );
  }

};

const resourcesjson = function (request, reply) {

  r.db('bookstera').table('resources').run(cn, function(err, result) {
    if (err) {
      reply('error');
    } else {
      reply(result.toArray());
    }
  })

};

const login = function (request, reply) {

    if (request.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    let mmessage = '';
    let account = null;

    if (request.method === 'post') {

        if (!request.payload.username ||
            !request.payload.password) {

            mmessage = 'Missing username or password';
        }
        else {
            account = users[request.payload.username];
            if (!account ||
                account.password !== request.payload.password) {

                mmessage = 'Invalid username or password';
            }
        }
    }

    if (request.method === 'get' ||
        mmessage) {

        return reply.view('login', { message: 
            (mmessage ? '<h3>' + mmessage + '</h3><br/>' : '') +
            '<form method="post" action="/login">' +
            'Username: <input type="text" name="username"><br>' +
            'Password: <input type="password" name="password"><br/>' +
            '<input type="submit" value="Login"></form>'});
    }

    const sid = String(++uuid);
    request.server.app.cache.set(sid, { account: account }, 0, (err) => {

        if (err) {
            return reply(err);
        }

        request.cookieAuth.set({ sid: sid });
        return reply.redirect('/');
    });
};

const logout = function (request, reply) {

    request.cookieAuth.clear();
    return reply.redirect('/');
};


server.register(require('hapi-auth-cookie'), (err) => {

    if (err) {
        throw err;
    }

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', true, {
        password: 'password-should-be-32-characters',
        cookie: 'sid-example',
        redirectTo: '/login',
        isSecure: false,
        validateFunc: function (request, session, callback) {

            cache.get(session.sid, (err, cached) => {

                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }

                return callback(null, true, cached.account);
            });
        }
    });

    server.route([
        { 
          method: 'GET', 
          path: '/', 
          config: { 
            handler: home 
          } 
        },
        { 
          method: ['GET', 'POST'], 
          path: '/login', 
          config: { 
            handler: login, 
            auth: { mode: 'try' }, 
            plugins: { 
              'hapi-auth-cookie': 
                { 
                  redirectTo: false 
                } 
            } 
          } 
        },
        { 
          method: 'GET', 
          path: '/logout', 
          config: { 
            handler: logout 
          } 
        },
        {
          method: 'GET',
          path: '/goals',
          config: {
            handler: goals
          }
        },
        {
          method: 'GET',
          path: '/ontology',
          config: {
            handler: ontology
          }
        },
        {
          method: 'GET',
          path: '/notes',
          config: {
            handler: notes
          }
        },
        {
          method: 'GET',
          path: '/discourses',
          config: {
            handler: discourses
          }
        },
        {
          method: ['GET', 'POST'],
          path: '/speax/{param*}',
          config: {
            auth: false,
            handler: speax
          }
        },
        {
          method: ['GET', 'POST'],
          path: '/resources.json',
          config: {
            auth: false,
            handler: resourcesjson
          }
        }
    ]);

    server.start(() => {
        console.log('Server ready');
    });
});
