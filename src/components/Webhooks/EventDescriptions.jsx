// Helper file for accessing event descriptions in various places

const eventDescriptions = [
  'Used when a new release starts. This fires once per application.',
  'Used when a new build starts, and also fires when it succeeds or fails. This will fire at least twice per app.',
  'If a dyno type is added, removed, or changed this fires once. This includes application scale events, command changes, or health check changes.',
  'This fires when a logdrain is added or removed.',
  'This fires when an add-on is provisioned or deprovisioned.',
  'If a config var is added, removed, or changed, this event fires once.',
  'Fires when an application is destroyed. This may cause other events to fires as well (such as addon_change.',
  'If a preview app is created based on the app this fires.',
  'When a release succeeds and is the active release running, this fires.',
  'If a dyno crashes this will fire. In addition, if an app entirely crashes, each dyno will fire as a separate event. This will fire as well if an application fails to shutdown gracefully when a new release is deployed.',
];

function getEventDescriptions() {
  return eventDescriptions;
}

export default{
  getEventDescriptions,
};
