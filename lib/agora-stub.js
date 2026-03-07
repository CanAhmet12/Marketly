/**
 * react-native-agora stub — Expo Go ortamında kullanılır.
 * Development build'de gerçek Agora modülü yüklenir.
 */
const React = require('react');
const { View } = require('react-native');

// RtcSurfaceView — sadece boş bir View döner
const RtcSurfaceView = (props) => React.createElement(View, props);

// Engine stub — tüm metodlar no-op
const engineStub = {
  initialize: () => {},
  setChannelProfile: () => {},
  setClientRole: () => {},
  enableVideo: () => {},
  enableAudio: () => {},
  joinChannel: () => {},
  leaveChannel: () => {},
  switchCamera: () => {},
  muteLocalAudioStream: () => {},
  muteLocalVideoStream: () => {},
  destroy: () => {},
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
};

const createAgoraRtcEngine = () => engineStub;

const ChannelProfileType = { ChannelProfileLiveBroadcasting: 1 };
const ClientRoleType     = { ClientRoleBroadcaster: 1, ClientRoleAudience: 2 };

module.exports = {
  createAgoraRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  ClientRoleType,
};
