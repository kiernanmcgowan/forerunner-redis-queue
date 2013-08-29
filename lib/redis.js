// harbinger-redis.js
// redis queue and store for harbinger
// does not really make sense as a store, but hey some people use redis for that
// but only mad people....

var redis = require('redis');
var uuid = require('node-uuid');
var _ = require('underscore');
var redisClient = null;

var _defaults = {
  queueHashName: 'harbinger_job_queue',
  jobFailedHashName: 'harbinger_job_fail_count'
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
  redisClient.hset(this.opts.queueHashName, id, JSON.stringify(dataToStore), function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, id);
    }
  });
};

constructor.prototype.queuedJobs = function(count, callback) {
  console.log('maor queuedJobs: ' + count);
  redisClient.hkeys(this.opts.queueHashName, function(err, jobIds) {
    if (err) {
      return callback(err);
    }
    console.log('redis result: ' + jobIds.length);
    callback(null, jobIds.slice(0, count));
  });
};

constructor.prototype.removeJob = function(jobId, callback) {
  console.log('remove: ' + jobId);
  redisClient.hdel(this.opts.queueHashName, jobId, function(err) {
    if (err) {
      console.log('DERPADFASDFASDF');
      return callback(err);
    } else {
      //console.log('job deleted: ' + jobId);
    }
    callback(null);
  });
};


constructor.prototype.fetchJob = function(jobId, callback) {
  var self = this;
  redisClient.hget(this.opts.queueHashName, jobId, function(err, raw) {
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

    if (!data) {
      console.log(jobId);
      console.log(raw);
    }

    callback(null, data.jobName, data.jobData);

  });
};

constructor.prototype.countFailedJob = function(jobId, message, callback) {
  redisClient.hincrby(this.opts.jobFailedHashName, jobId, 1, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  });
};
