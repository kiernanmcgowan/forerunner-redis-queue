// forerunner-redis.js
// redis queue and store for forerunner
// does not really make sense as a store, but hey some people use redis for that
// but only mad people....

var redis = require('redis');
var _ = require('underscore');
var async = require('async');
var redisClient = null;

var _defaults = {
  jobQueue: 'forerunner_job_queue',
  logger: console,
  auth: null
};

function constructor(opts) {
  if (!opts) {
    opts = {};
  }
  opts = _.defaults(opts, _defaults);
  this.opts = opts;
  this.logger = opts.logger;
  redisClient = redis.createClient(opts.port, opts.host, opts.redis);
  // if the auth option is set, auth with redis
  if (opts.auth) {
    redisClient.auth(opts.auth);
  }
  return this;
}
module.exports = constructor;

constructor.prototype.push = function(jobId, jobType, jobData, callback) {
  var dataToStore = {
    jobId: jobId,
    jobType: jobType,
    jobData: jobData
  };
  var self = this;
  redisClient.rpush(self.opts.jobQueue, JSON.stringify(dataToStore), function(err) {
    if (err) {
      self.logger.error('RedisQueue - Failed to push job to queue');
      self.logger.error(JSON.stringify(err, null, 2));
      return callback(err);
    }
    callback(null);
  });
};

constructor.prototype.each = function(count, eachFn, callback) {
  var multi = createMultiPopObject(count, this.opts.jobQueue);
  var self = this;
  multi.exec(function(err, jobs) {
    if (err) {
      self.logger.error('RedisQueue - Failed to pop from queue (count n= ' + count + ')');
      self.logger.error(JSON.stringify(err, null, 2));
      return callback(err);
    }
    async.each(jobs, function(rawData, cb) {
      // it is possible for the data to be null b/c of out of range list
      if (rawData === null) {
        cb();
      } else {
        var jobObject = null;
        try {
          jobObject = JSON.parse(rawData);
        } catch (err) {
          self.logger.error('RedisQueue - Failed to parse stored JSON data:');
          self.logger.error(rawData);
          self.logger.error(err);
          // this will stop the iteration over the rest of the queue
          cb(err);
        }
        if (jobObject) {
          eachFn(jobObject.jobId, jobObject.jobType, jobObject.jobData);
          cb();
        }
      }
    }, callback);
  });
};

// requeue puts a job back onto the stack if no worker could be found for it
constructor.prototype.requeue = function(jobId, jobType, jobData, callback) {
  var dataToStore = {
    jobId: jobId,
    jobType: jobType,
    jobData: jobData
  };
  var self = this;
  redisClient.lpush(self.opts.jobQueue, JSON.stringify(dataToStore), function(err) {
    if (err) {
      self.logger.error('RedisQueue - Failed to push job to queue');
      self.logger.error(JSON.stringify(err, null, 2));
      return callback(err);
    }
    callback(null);
  });
};

// empties the queue
constructor.prototype.empty = function(callback) {
  var self = this;
  redisClient.del(self.opts.jobQueue, function(err) {
    if (err) {
      self.logger.error('RedisQueue - Failed to empty job queue');
      self.logger.error(JSON.stringify(err, null, 2));
      return callback(err);
    }
    callback(null);
  });
};

function createMultiPopObject(count, key) {
  var multiArray = [];
  for (var i = 0; i < count; i++) {
    multiArray.push(['lpop', key]);
  }
  return redisClient.multi(multiArray);
}
