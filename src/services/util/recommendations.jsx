import React from 'react';

/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unescaped-entities */

// TODO: remove this, there's no structured way to dynamically fetch this
// yet
const postgresqlPlans = [
  { name: 'alamo-postgresql:micro', price: 0, size: (4 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:small', price: 60, size: (20 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:medium', price: 135, size: (50 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:large', price: 360, size: (100 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:hobby', price: 0, size: (4 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:standard-0', price: 5, size: (4 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:standard-1', price: 15, size: (16 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:standard-2', price: 45, size: (32 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:premium-0', price: 60, size: (20 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:premium-1', price: 135, size: (50 * 1024 * 1024 * 1024) },
  { name: 'alamo-postgresql:premium-2', price: 720, size: (100 * 1024 * 1024 * 1024) },
];
const redisPlans = [
  { name: 'alamo-redis:small', price: 15, size: (600 * 1024 * 1024) },
  { name: 'alamo-redis:medium', price: 50, size: (3.2 * 1024 * 1024 * 1024) },
  { name: 'alamo-redis:large', price: 135, size: (6 * 1024 * 1024 * 1024) },
];
const memcachedPlans = [
  { name: 'alamo-memcached:small', price: 15, size: (600 * 1024 * 1024) },
  { name: 'alamo-memcached:medium', price: 50, size: (3.2 * 1024 * 1024 * 1024) },
  { name: 'alamo-memcached:large', price: 135, size: (6 * 1024 * 1024 * 1024) },
];

function mean(obj) {
  return Object.values(obj).map(x => parseFloat(x, 10))
    .reduce((a, b) => a + b) / Object.values(obj).length;
}

function maximum(obj) {
  return Object.values(obj).map(x => parseFloat(x, 10)).sort((a, b) => (a < b ? 1 : -1))[0];
}

function derivative(obj) {
  const arr = Object.values(obj).map(x => parseFloat(x, 10));
  return arr.map((x, i) => {
    if (i !== 0) {
      return x - arr[i - 1];
    }
    return 0;
  });
}

function examinSavings(metrics, formations, addons, sizes) {
  const savings = [];
  metrics = metrics || {}; // eslint-disable-line no-param-reassign

  // Larger than necessary memory
  formations.forEach((formation, index) => {
    let size = null;
    let previousSize = null;
    sizes.forEach((s, i) => {
      if (s.name === formation.size) {
        size = s;
        if (i > 1) {
          previousSize = sizes[i - 2];
        }
      }
    });
    if (size && previousSize && formation.quantity > 0) {
      let limit = parseInt(size.resources.limits.memory.replace(/Mi/g, ''), 10);
      // warn on nothing larger than 60%.
      limit *= 0.6;
      if (metrics[formation.type] && metrics[formation.type].memory_usage_bytes) {
        const memorySamples = Object.values(metrics[formation.type].memory_usage_bytes);
        const memoryExceeds60Percent = memorySamples.filter(z => z > (limit * 1024 * 1024));
        if (memoryExceeds60Percent.length / memorySamples.length < 0.5) {
          if (((size.price - previousSize.price) * formation.quantity) > 0) {
            savings.push((
              <li key={`savings_mem${index}`} className="recommendation">Changing your dyno size to {previousSize.resources.limits.memory.replace(/Mi/g, '')}MB ({previousSize.name}) (on dyno {formation.type}) will save you ${(size.price - previousSize.price) * formation.quantity}.00 a month.</li>
            ));
          }
        }
      }
    }
  });

  // postgresql
  addons.filter(addon => addon.addon_service.name === 'akkeris-postgresql').forEach((addon) => {
    const currentPlanIndex = postgresqlPlans.findIndex(x => x.name === addon.plan.name);
    const lowerPlanIndex = currentPlanIndex - 1;
    let found = false;
    Object.values(metrics).forEach((dyno, index) => {
      if (!dyno.postgres_db_size) {
        return;
      }
      const avg = mean(dyno.postgres_db_size);
      const max = maximum(dyno.postgres_db_size);
      if (currentPlanIndex > -1 &&
        lowerPlanIndex > -1 &&
        !found &&
        avg < (postgresqlPlans[currentPlanIndex].size * 0.5) &&
        postgresqlPlans[lowerPlanIndex].size > max) {
        found = true;
        savings.push((
          <li key={`savings_pg${index}`} className="recommendation">Switching to a lower postgresql plan ({postgresqlPlans[lowerPlanIndex].name}) would save you ${postgresqlPlans[currentPlanIndex].price - postgresqlPlans[lowerPlanIndex].price}.00 a month, you're using {((avg / postgresqlPlans[currentPlanIndex].size) * 100).toFixed(2)}% of your plan.</li>
        ));
      }
      if (avg > (postgresqlPlans[currentPlanIndex].size * 0.9)) {
        savings.push((
          <li key={`savings_pg${index}`} className="warning">Consider upgrading your postgresql database plan, you're using on average more than 90% of your plan {(avg / 1024 / 1024 / 1024).toFixed(2)}GB.</li>
        ));
      }
      const connectionChanges = derivative(dyno.postgres_db_connections);
      const connectionIncreases = connectionChanges.filter(x => (x > 0));
      const connectionDecreases = connectionChanges.filter(x => (x < 0));
      if (connectionIncreases.length - connectionDecreases.length > 3) {
        savings.push((
          <li key={`savings_pg${index}`} className="warning">You may have a database connection leak, the connections have increased by {connectionIncreases.length - connectionDecreases.length} in the last 24 hours.</li>
        ));
      }
    });
  });

  // memcached
  addons.filter(addon => addon.addon_service.name === 'alamo-memcached').forEach((addon) => {
    const currentPlanIndex = memcachedPlans.findIndex(x => x.name === addon.plan.name);
    const lowerPlanIndex = currentPlanIndex - 1;
    let found = false;
    Object.values(metrics).forEach((dyno, index) => {
      if (!dyno.memcached_stat_bytes) {
        return;
      }
      const avg = mean(dyno.memcached_stat_bytes);
      const max = maximum(dyno.memcached_stat_bytes);
      if (currentPlanIndex > -1 &&
        lowerPlanIndex > -1 &&
        !found &&
        avg < (memcachedPlans[currentPlanIndex].size * 0.5) &&
        memcachedPlans[lowerPlanIndex].size > max) {
        found = true;
        savings.push((
          <li key={`savings_memch${index}`} className="recommendation">Switching to a lower memcached plan ({memcachedPlans[lowerPlanIndex].name}) would save you ${memcachedPlans[currentPlanIndex].price - memcachedPlans[lowerPlanIndex].price}.00 a month, you're using {((avg / memcachedPlans[currentPlanIndex].size) * 100).toFixed(2)}% of your plan.</li>
        ));
      }
      if (avg > (memcachedPlans[currentPlanIndex].size * 0.9)) {
        savings.push((
          <li key={`savings_memch${index}`} className="warning">Consider upgrading your memcached plan, you're using on average more than 90% of its size {(avg / 1024 / 1024 / 1024).toFixed(2)}GB.</li>
        ));
      }
      const connectionChanges = derivative(dyno.memcached_stat_curr_connections);
      const connectionIncreases = connectionChanges.filter(x => x > 0);
      const connectionDecreases = connectionChanges.filter(x => (x < 0));
      if (connectionIncreases.length - connectionDecreases.length > 3) {
        savings.push((
          <li key={`savings_memch${index}`} className="warning">You may have a memcached connection leak, the connections have increased by {connectionIncreases.length - connectionDecreases.length} in the last 24 hours.</li>
        ));
      }
    });
  });

  // redis
  addons.filter(addon => addon.addon_service.name === 'alamo-redis').forEach((addon) => {
    const currentPlanIndex = redisPlans.findIndex(x => x.name === addon.plan.name);
    const lowerPlanIndex = currentPlanIndex - 1;
    let found = false;
    Object.values(metrics).forEach((dyno, index) => {
      if (!dyno.redis_info_used_memory) {
        return;
      }
      const avg = mean(dyno.redis_info_used_memory);
      const max = maximum(dyno.redis_info_used_memory);
      if (currentPlanIndex > -1 &&
        lowerPlanIndex > -1 &&
        !found &&
        avg < (redisPlans[currentPlanIndex].size * 0.5) &&
        redisPlans[lowerPlanIndex].size > max) {
        found = true;
        savings.push((
          <li key={`savings_redis${index}`} className="recommendation">Switching to a lower redis plan ({redisPlans[lowerPlanIndex].name}) would save you ${redisPlans[currentPlanIndex].price - redisPlans[lowerPlanIndex].price}.00 a month, you're using {((avg / redisPlans[currentPlanIndex].size) * 100).toFixed(2)}% of your plan.</li>
        ));
      }
      if (avg > (redisPlans[currentPlanIndex].size * 0.9)) {
        savings.push((
          <li key={`savings_redis${index}`} className="warning">Consider upgrading your redis plan, you're using on average more than 90% of its size {(avg / 1024 / 1024 / 1024).toFixed(2)}GB.</li>
        ));
      }
      const connectionChanges = derivative(dyno.redis_info_connected_clients);
      const connectionIncreases = connectionChanges.filter(x => (x > 0));
      const connectionDecreases = connectionChanges.filter(x => (x < 0));
      if (connectionIncreases.length - connectionDecreases.length > 3) {
        savings.push((
          <li key={`savings_redis${index}`} className="warning">You may have a redis connection leak, the connections have increased by {connectionIncreases.length - connectionDecreases.length} in the last 24 hours.</li>
        ));
      }
    });
  });

  return savings;
}

function examineWarnings(metrics) {
  if (!metrics) {
    return [];
  }
  const warnings = [];
  const dynos = Object.keys(metrics);

  // Memory Leaks
  Object.values(metrics).forEach((data, index) => {
    if (data.memory_usage_bytes) {
      const memory = Object.values(data.memory_usage_bytes)
        .map(x => parseInt(x, 10));

      const numPositive = derivative(data.memory_usage_bytes).filter(x => (x > 0));
      const percentRise = numPositive.length / memory.length;
      if (percentRise > 0.75) {
        warnings.push((
          <li key={`warning${index}`} className="warning">It appears your application ({dynos[index]} dyno) may have a memory leak. Its been increasing ({Math.floor(percentRise * 10000) / 100}% of the time) for the last 24 hours.</li>
        ));
      }
    }
  });

  // Out of memory

  return warnings;
}

function examineErrors(metrics) {
  if (!metrics) {
    return [];
  }
  let internalErrors = 0;
  let upstreamErrors = 0;
  let overloadedErrors = 0;
  const errors = [];
  if (metrics.web) {
    if (metrics.web.router_status_500) {
      internalErrors += Object.values(metrics.web.router_status_500)
        .reduce((sum, val) => sum + parseInt(val, 10), 0);
    }
    if (metrics.web.router_status_502) {
      upstreamErrors += Object.values(metrics.web.router_status_502)
        .reduce((sum, val) => sum + parseInt(val, 10), 0);
    }
    if (metrics.web.router_status_503) {
      overloadedErrors += Object.values(metrics.web.router_status_503)
        .reduce((sum, val) => sum + parseInt(val, 10), 0);
    }
    if (metrics.web.router_status_504) {
      overloadedErrors += Object.values(metrics.web.router_status_504)
        .reduce((sum, val) => sum + parseInt(val, 10), 0);
    }
  }
  if (internalErrors > 0) {
    errors.push((
      <li key="internalErrors" className="error">There has been {internalErrors} (500) critical errors on this application in the last 24 hours.</li>
    ));
  }
  if (upstreamErrors > 0) {
    errors.push((
      <li key="upstreamErrors" className="error">One of your upstream resources or services you rely on may not be working correctly. There have been ${upstreamErrors} upstream (502) errors on this application in the last 24 hours.</li>
    ));
  }
  if (overloadedErrors > 0) {
    errors.push((
      <li key="overloadedErrors" className="error">You may want to consider getting a larger dyno. This application has timed out (503 and 504 http status codes) ${overloadedErrors} in the last 24 hours.  Consider inspecting where the delay may be, including long running SQL queries or lagging attached (or upstream) resources.</li>
    ));
  }
  return errors;
}

function execute(metrics, formations, addons, sizes) {
  return examineErrors(metrics)
    .concat(examineWarnings(metrics))
    .concat(examinSavings(metrics, formations, addons, sizes));
}

module.exports = {
  execute,
};
