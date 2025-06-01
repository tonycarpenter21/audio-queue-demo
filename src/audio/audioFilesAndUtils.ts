import blueCaptureBase from './blue_team_capture_base.mp3';
import blueLostBase from './blue_team_lost_base.mp3';
import laserGunFiring from './laser_gun_firing.mp3';
import laserGunFiringRepeatedlyOne from './laser_gun_firing_repeatedly.mp3';
import longTeleportationOne from './long_teleportation.mp3';
import longTeleportationTwo from './long_teleportation_2.mp3';
import longTeleportationThree from './long_teleportation_3.mp3';
import newPlayerJoined from './new_player_joined_the_game.mp3';
import oneMinuteLeft from './one_minute_left.mp3';
import playerHasLeftGame from './player_has_left_the_game.mp3';
import redCaptureBase from './red_team_capture_base.mp3';
import redLostBase from './red_team_lost_base.mp3';

export interface AudioFile {
  name: string;
  src: string;
}

export const audioFilesChannelZero: Record<string, AudioFile> = {
  blueCaptureBase: {
    name: 'blue_team_capture_base.mp3',
    src: blueCaptureBase
  },
  blueLostBase: {
    name: 'blue_team_lost_base.mp3',
    src: blueLostBase
  },
  newPlayerJoined: {
    name: 'new_player_joined_the_game.mp3',
    src: newPlayerJoined
  },
  oneMinuteLeft: {
    name: 'one_minute_left.mp3',
    src: oneMinuteLeft
  },
  playerHasLeftGame: {
    name: 'player_has_left_the_game.mp3',
    src: playerHasLeftGame
  },
  redCaptureBase: {
    name: 'red_team_capture_base.mp3',
    src: redCaptureBase
  },
  redLostBase: {
    name: 'red_team_lost_base.mp3',
    src: redLostBase
  }
};

export const audioFilesChannelOne: Record<string, AudioFile> = {
  laserGunFiring: {
    name: 'laser_gun_firing.mp3',
    src: laserGunFiring
  },
  laserGunFiringRepeatedlyOne: {
    name: 'laser_gun_firing_repeatedly.mp3',
    src: laserGunFiringRepeatedlyOne
  },
  longTeleportationOne: {
    name: 'long_teleportation.mp3',
    src: longTeleportationOne
  },
  longTeleportationThree: {
    name: 'long_teleportation_3.mp3',
    src: longTeleportationThree
  },
  longTeleportationTwo: {
    name: 'long_teleportation_2.mp3',
    src: longTeleportationTwo
  }
};

export function getRandomAudioFile(audioFiles: Record<string, AudioFile>): AudioFile {
  const keys = Object.keys(audioFiles);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return audioFiles[randomKey];
}

// Unused Audio Files:
// import blueTeamWins from './blue_team_wins.mp3';
// import redTeamWins from './red_team_wins.mp3';
// redTeamWins: {
//   name: 'red_team_wins.mp3',
//   src: redTeamWins
// }
// blueTeamWins: {
//   name: 'blue_team_wins.mp3',
//   src: blueTeamWins
// },
