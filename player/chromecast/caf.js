var conf = {
  key: '<YOUR PLAYER KEY HERE>',
  remotecontrol: {
    type: 'googlecast',
    receiverApplicationId: 'FFE417E5',
    receiverVersion: 'v3',
    messageNamespace: 'urn:x-cast:com.bitmovin.player.caf',
  },
};

// Send custom messages to CAF receiver
const payload = { foo: 'bar' };
player.addmetadata('CAST', payload);