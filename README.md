Bookstera
=========

![Bookstera](public/images/logo-bookstera.png)

A showcase of pragmatic web systems.

## Run Bookstera

This showcase uses data store plugin (Storix). The configuration for Bookstera data store is reside in `/etc/rethinkdb/instances.d/bookstera.conf` since we will use systemd for bookstera bootstrap. The `bookstera.conf` file consists of some RethinkDB configuration:

```
## Directory to store data and metadata
## Command line default: ./rethinkdb_data
## Init script default: /var/lib/rethinkdb/<name>/ (where <name> is the name of this file without the extension)
directory=/var/lib/rethinkdb/bookstera

## Log file options
## Default: <directory>/log_file
log-file=/var/log/rethinkdb-bookstera

### Network options

## Address of local interfaces to listen on when accepting connections
## May be 'all' or an IP address, loopback addresses are enabled by default
## Default: all local addresses
##bind=127.0.0.1
bind=all

## The name for this server (as will appear in the metadata).
## If not specified, it will be randomly chosen from a short list of names.
server-name=bookstera
```

For the first time, the directory should be populated first with metadata (this should be done for first time data store creation, no need to do that again next):

```
# rethinkdb create /var/lib/rethinkdb/bookstera
# chown -R rethinkdb:rethinkdb /var/lib/rethinkdb/bookstera
```

If you already have the directory, run with:

```
# systemctl start rethinkdb@bookstera.service
# systemctl status rethinkdb@bookstera.service
● rethinkdb@bookstera.service - RethinkDB database server for instance 'bookstera'
  Loaded: loaded (/usr/lib/systemd/system/rethinkdb@.service; disabled; vendor preset: disabled)
  Active: active (running) since Sun 2016-04-03 10:04:34 WIB; 4min 54s ago
  Main PID: 3435 (rethinkdb)
    Tasks: 78 (limit: 512)
    CGroup: /system.slice/system-rethinkdb.slice/rethinkdb@bookstera.service
           ├─3435 /usr/bin/rethinkdb serve --config-file /etc/rethinkdb/instances.d/bookstera.conf
           ├─3437 /usr/bin/rethinkdb serve --config-file /etc/rethinkdb/instances.d/bookstera.conf
           └─3515 /usr/bin/rethinkdb serve --config-file /etc/rethinkdb/instances.d/bookstera.conf

  Apr 03 10:04:34 archera systemd[1]: Started RethinkDB database server for instance 'bookstera'.
  Apr 03 10:04:34 archera rethinkdb[3435]: Warning: The following options are not used by this invocation of
    rethinkdb and will be ignor
  Apr 03 10:04:34 archera rethinkdb[3435]: Running rethinkdb 2.2.6 (GCC 5.3.0)...
  Apr 03 10:04:34 archera rethinkdb[3435]: Running on Linux 4.4.5-1-ARCH x86_64
  Apr 03 10:04:34 archera rethinkdb[3435]: Loading data from directory /var/lib/rethinkdb/bookstera
  Apr 03 10:04:35 archera rethinkdb[3435]: Listening for intracluster connections on port 29015
  Apr 03 10:04:35 archera rethinkdb[3435]: Listening for client driver connections on port 28015
  Apr 03 10:04:35 archera rethinkdb[3435]: Listening for administrative HTTP connections on port 8080
  Apr 03 10:04:35 archera rethinkdb[3435]: Listening on addresses: 127.0.0.1, 192.168.1.7, ::1,
    fe80::e9ca:7754:44a5:1d92%3
  Apr 03 10:04:35 archera rethinkdb[3435]: Server ready, "archera_9lk" c40097cf-f9f7-448a-aa84-bd0f9b629dee
```

## License

Copyright © 2016 [Bambang Purnomosidi D. P.](http://bpdp.xyz)

Distributed under the [Apache License - version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
