function filterApps(apps, space) {
  const applist = [];
  apps.forEach((app) => {
    if (app.space.name === space || space === 'all') {
      applist.push(app);
    }
  });
  return applist;
}

function filterAppsByRegion(apps, region) {
  const applist = [];
  apps.forEach((app) => {
    if (app.region.name === region || region === 'all') {
      applist.push(app);
    }
  });
  return applist;
}

function filterDynosByFormation(dynos, formation) {
  const dynolist = [];
  dynos.forEach((dyno) => {
    if (dyno.type === formation.type) {
      dynolist.push(dyno);
    }
  });
  return dynolist;
}

function filterSpacesByRegion(spaces, region) {
  const spacelist = [];
  spaces.forEach((space) => {
    if (space.region.name === region || region === 'all') {
      spacelist.push(space);
    }
  });
  return spacelist;
}

function filterSpacesByStack(spaces, stack) {
  const spacelist = [];
  spaces.forEach((space) => {
    if (space.stack.name === stack || stack === 'all') {
      spacelist.push(space);
    }
  });
  return spacelist;
}

function filterSites(sites, region) {
  const siteList = [];
  sites.forEach((site) => {
    if (site.region.name === region || region === 'all') {
      siteList.push(site);
    }
  });
  return siteList;
}

function filterName(data) {
  const namelist = [];
  data.forEach((element) => {
    namelist.push(element.name);
  });
  return namelist;
}

function filterDomain(data) {
  const namelist = [];
  data.forEach((element) => {
    namelist.push(element.domain);
  });
  return namelist;
}

function filterCouplings(couplings, filter) {
  const filteredCouplings = [];
  couplings.forEach((element) => {
    if (element.stage === filter) {
      filteredCouplings.push(element);
    }
  });
  return filteredCouplings;
}

function updateHistory(type, item, label) {
  let recentItems;
  try {
    recentItems = JSON.parse(localStorage.getItem('akkeris_history'));
    const duplicate = recentItems.find(i => i.item === item);
    if (duplicate) {
      recentItems.splice(recentItems.indexOf(duplicate), 1); // Remove duplicate so it only appears once (as the most recent item)
    }
    recentItems.unshift({ type, item, label });
    if (recentItems.length > 20) { recentItems.pop(); } // Only keep the most recent 20 items
  } catch (err) {
    recentItems = [{ type, item, label }];
  }
  localStorage.setItem('akkeris_history', JSON.stringify(recentItems));
}

function getHistory() {
  let recentItems;
  try {
    recentItems = JSON.parse(localStorage.getItem('akkeris_history'));
  } catch (err) {
    recentItems = [];
  }
  return recentItems || [];
}

function clearHistory() {
  localStorage.removeItem('akkeris_history');
}

function getDateDiff(date /* : Date */) {
  if (typeof date === 'string') {
    date = new Date(date); // eslint-disable-line no-param-reassign
  }
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  }
  if (interval === 1) {
    return `${interval} year ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }
  if (interval === 1) {
    return `${interval} month ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }
  if (interval === 1) {
    return `${interval} day ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }
  if (interval === 1) {
    return `${interval} hour ago`;
  }
  interval = Math.floor(seconds / 60);
  return `${interval} minutes ago`;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default {
  deepCopy,
  filterApps,
  filterName,
  filterCouplings,
  filterDomain,
  filterSpacesByRegion,
  filterAppsByRegion,
  filterSpacesByStack,
  filterSites,
  filterDynosByFormation,
  updateHistory,
  getHistory,
  clearHistory,
  getDateDiff,
};
