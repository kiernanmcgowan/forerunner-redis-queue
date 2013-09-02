harbinger-redis-queue
===

Simple redis queue plugin for [harbinger](https://github.com/dropdownmenu/harbinger).

```
npm install harbinger-redis-queue
```

usage
---

```
var redisQueue = require('harbinger-redis-queue');
var harbingerOpts = {
  queue: new redisQueue()
};

harbinger.start(harbingerOpts, function() {

});

```

configuring
---

```
var redisQueue = require('harbinger-redis-queue');

var redisOpts = {
  // redis config
  port: 'the redis port number',
  host: 'your redis host',
  redis: {}, // additional redis config, see node_redis for more details
  // harbinger config
  queueHashName: 'harbinger_job_queue', // key used to store jobs
  jobFailedHashName: 'harbinger_job_fail_count' // key used to store job failed status
};

var harbingerOpts = {
  queue: new redisQueue(redisOpts)
};
```


LICENSE
---

<MIT>

Copyright (c) 2013 Kiernan Tim McGowan (dropdownmenu)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

