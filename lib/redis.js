// forerunner-redis.js
// redis queue and store for forerunner
// does not really make sense as a store, but hey some people use redis for that
// but only mad people....

var redis = require('redis');
var uuid = require('node-uuid');
var async = require('async');
var _ = require('underscore');
var redisClient = null;

var _defaults = {
  jobQueueSet: 'forerunner_job_queue',
  jobDataHash: 'forerunner_job_data',
  jobFailedHash: 'forerunner_job_fail_count'
};

function constructor(opts) {
  if (!opts) {
    opts = {};
  }
  opts = _.defaults(opts, _defaults);
  this.opts = opts;
  redisClient = redis.createClient(opts.port, opts.host, opts.redis);
  return this;
}
module.exports = constructor;

constructor.prototype.createJob = function(jobName, jobData, callback) {
  var id = uuid();
  var dataToStore = {
    jobName: jobName,
    jobData: jobData
  };
  var self = this;
  async.parallel([
    function(cb) {
      redisClient.sadd(self.opts.jobQueueSet, id, cb);
    },
    function(cb) {
      redisClient.hset(self.opts.jobDataHash, id, JSON.stringify(dataToStore), cb);
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, id);
    }
  });
};

constructor.prototype.queuedJobs = function(count, callback) {
  redisClient.srandmember(this.opts.jobQueueSet, count, function(err, jobIds) {
    if (err) {
      return callback(err);
    }
    callback(null, jobIds);
  });
};

constructor.prototype.removeJob = function(jobId, callback) {
  var self = this;
  async.parallel([
    function(cb) {
      redisClient.srem(self.opts.jobQueueSet, jobId, cb);
    },
    function(cb) {
      redisClient.hdel(self.opts.jobDataHash, jobId, cb);
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};


constructor.prototype.fetchJob = function(jobId, callback) {
  var self = this;
  redisClient.hget(this.opts.jobDataHash, jobId, function(err, raw) {
    if (err) {
      return callback(err);
    }

    if (raw === null) {
      return callback(new Error('job does not exist'));
    }

    var data = null;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.log('fetch: ' + jobId);
      console.log(raw);
      return callback(parseErr);
    }

    callback(null, data.jobName, data.jobData);

  });
};

constructor.prototype.countFailedJob = function(jobId, message, callback) {
  redisClient.hincrby(this.opts.jobFailedHash, jobId, 1, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  });
};
