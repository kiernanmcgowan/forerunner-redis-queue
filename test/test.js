// forerunner-redis-queue tests
// uses the forerunner queue tester to test the redis queue
var testSuite = require('forerunner-queue-tests');

var redisQueue = require('../index');

// set up the queue with a dummy redis key
var queue = new redisQueue({
  jobQueue: 'forerunner_queue_tests'
});

testSuite(queue, function(results) {
  process.exit(results.broken);
});
