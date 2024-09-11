import blueCaptureBase from './blue_team_capture_base.mp3';
import blueLostBase from './blue_team_lost_base.mp3';
import blueTeamWins from './blue_team_wins.mp3';
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
import redTeamWins from './red_team_wins.mp3';
import spaceGunFiringRepeatedly from './space_gun_firing_repeatedly.mp3';

export const audioFilesChannelZero = {
  blueCaptureBase: { src: blueCaptureBase, name: 'blue_team_capture_base.mp3', duration: 2037.50 },
  blueLostBase: { src: blueLostBase, name: 'blue_team_lost_base.mp3', duration: 1854.69 },
  blueTeamWins: { src: blueTeamWins, name: 'blue_team_wins.mp3', duration: 1384.44 },
  newPlayerJoined: { src: newPlayerJoined, name: 'new_player_joined_the_game.mp3', duration: 2037.50 },
  oneMinuteLeft: { src: oneMinuteLeft, name: 'one_minute_left.mp3', duration: 1253.88 },
  playerHasLeftGame: { src: playerHasLeftGame, name: 'player_has_left_the_game.mp3', duration: 1697.94 },
  redCaptureBase: { src: redCaptureBase, name: 'red_team_capture_base.mp3', duration: 2168.13 },
  redLostBase: { src: redLostBase, name: 'red_team_lost_base.mp3', duration: 1906.94 },
  redTeamWins: { src: redTeamWins, name: 'red_team_wins.mp3', duration: 1488.94 },
};

export const audioFilesChannelOne = {
  laserGunFiring: { src: laserGunFiring, name: 'laser_gun_firing.mp3', duration: 5041.63 },
  laserGunFiringRepeatedlyOne: { src: laserGunFiringRepeatedlyOne, name: 'laser_gun_firing_repeatedly.mp3', duration: 5041.63 },
  longTeleportationOne: { src: longTeleportationOne, name: 'long_teleportation.mp3', duration: 14053.88 },
  longTeleportationThree: { src: longTeleportationThree, name: 'long_teleportation_3.mp3', duration: 10057.13 },
  longTeleportationTwo: { src: longTeleportationTwo, name: 'long_teleportation_2.mp3', duration: 14053.88 },
  spaceGunFiringRepeatedly: { src: spaceGunFiringRepeatedly, name: 'space_gun_firing_repeatedly.mp3', duration: 5041.63 },
};

export function getRandomAudioFile(audioFiles: Record<string, { src: string; name: string; duration: number }>) {
  const keys = Object.keys(audioFiles);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return audioFiles[randomKey];
}

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