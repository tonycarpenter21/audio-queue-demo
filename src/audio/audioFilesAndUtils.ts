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
import spaceGunFiringRepeatedly from './space_gun_firing_repeatedly.mp3';

export interface AudioFile {
  duration: number;
  name: string;
  src: string;
}

export const audioFilesChannelZero: Record<string, AudioFile> = {
  blueCaptureBase: {
    duration: 2037.5,
    name: 'blue_team_capture_base.mp3',
    src: blueCaptureBase
  },
  blueLostBase: {
    duration: 1854.69,
    name: 'blue_team_lost_base.mp3',
    src: blueLostBase
  },
  newPlayerJoined: {
    duration: 2037.5,
    name: 'new_player_joined_the_game.mp3',
    src: newPlayerJoined
  },
  oneMinuteLeft: {
    duration: 1253.88,
    name: 'one_minute_left.mp3',
    src: oneMinuteLeft
  },
  playerHasLeftGame: {
    duration: 1697.94,
    name: 'player_has_left_the_game.mp3',
    src: playerHasLeftGame
  },
  redCaptureBase: {
    duration: 2168.13,
    name: 'red_team_capture_base.mp3',
    src: redCaptureBase
  },
  redLostBase: {
    duration: 1906.94,
    name: 'red_team_lost_base.mp3',
    src: redLostBase
  }
};

export const audioFilesChannelOne: Record<string, AudioFile> = {
  laserGunFiring: {
    duration: 5041.63,
    name: 'laser_gun_firing.mp3',
    src: laserGunFiring
  },
  laserGunFiringRepeatedlyOne: {
    duration: 5041.63,
    name: 'laser_gun_firing_repeatedly.mp3',
    src: laserGunFiringRepeatedlyOne
  },
  longTeleportationOne: {
    duration: 14053.88,
    name: 'long_teleportation.mp3',
    src: longTeleportationOne
  },
  longTeleportationThree: {
    duration: 10057.13,
    name: 'long_teleportation_3.mp3',
    src: longTeleportationThree
  },
  longTeleportationTwo: {
    duration: 14053.88,
    name: 'long_teleportation_2.mp3',
    src: longTeleportationTwo
  },
  spaceGunFiringRepeatedly: {
    duration: 5041.63,
    name: 'space_gun_firing_repeatedly.mp3',
    src: spaceGunFiringRepeatedly
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
//   duration: 1488.94,
//   name: 'red_team_wins.mp3',
//   src: redTeamWins
// }
// blueTeamWins: {
//   duration: 1384.44,
//   name: 'blue_team_wins.mp3',
//   src: blueTeamWins
// },

// Depreciated utility functions for logging length of audio files:
// function getAudioDuration(audioFile: { src: string; name: string }): Promise<number> {
//   return new Promise((resolve, reject) => {
//     const audio = new Audio(audioFile.src);
//     audio.addEventListener('loadedmetadata', () => {
//       resolve(audio.duration * 1000); // Convert to milliseconds
//     });
//     audio.addEventListener('error', (e: ErrorEvent) => reject(e.error));
//   });
// }

// async function logAudioDurations(audioFiles: Record<string, { src: string; name: string }>): Promise<void> {
//   for (const [key, audioFile] of Object.entries(audioFiles)) {
//     try {
//       const duration = await getAudioDuration(audioFile);
//       console.log(`${audioFile.name}: ${duration.toFixed(2)} ms`);
//     } catch (error) {
//       console.error(`Error getting duration for ${audioFile.name}:`, error);
//     }
//   }
// }
