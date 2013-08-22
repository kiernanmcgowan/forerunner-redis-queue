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
  jobFailedHashName: 'harbinger_job_fail_count',
  storeHashName: 'harbinger_job_store'
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
  redisClient.hmset(this.opts.queueHashName, id, JSON.stringify(dataToStore), function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, id);
    }
  });
};

constructor.prototype.queuedJobs = function(callback) {
  redisClient.hkeys(this.opts.queueHashName, function(err, jobIds) {
    if (err) {
      return callback(err);
    }
    callback(null, jobIds);
  });
};

constructor.prototype.removeJob = function(jobId, callback) {
  redisClient.hdel(this.opts.queueHashName, jobId, function(err) {
    if (err) {
      return callback(err);
    } else {
      //console.log('job deleted: ' + jobId);
    }
    callback(null);
  });
};



constructor.prototype.fetchJob = function(jobId, callback) {
  var self = this;
  redisClient.hmget(this.opts.queueHashName, jobId, function(err, raw) {
    if (err) {
      return callback(err);
    }

    var data = null;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      return callback(parseErr);
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

constructor.prototype.storeJob = function(jobId, jobResult, callback) {
  redisClient.hmset(this.opts.storeHashName, jobId, JSON.stringify(jobResult), function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, id);
    }
  });
};