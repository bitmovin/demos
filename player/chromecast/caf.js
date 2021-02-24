var conf = {
  key: '<YOUR PLAYER KEY HERE>',
  remotecontrol: {
    type: 'googlecast',
    receiverApplicationId: 'FFE417E5', // this id points to the Bitmovin default receiver application
    receiverVersion: 'v3',
    messageNamespace: 'urn:x-cast:com.bitmovin.player.caf',
  },
};

// Send custom messages to CAF receiver
var payload = { foo: 'bar' };
player.addMetadata('CAST', payload);
