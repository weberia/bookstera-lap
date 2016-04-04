How to make your own template
=============================

All references to static assets and images should be prefixed with "/collabox/", see [example](index.html). This one depends on Hapi application which uses this plugin (taken from [this Hapi example which uses this plugin](../../../../hapi/index.js)):

```javascript
server.register({ register: require('collabox') }, {
    routes: {
          prefix: '/collabox'
            }
}, (err) => {
    server.log(err);
});
```

