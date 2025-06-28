import blueCaptureBase from './blue_team_capture_base.mp3';
import blueLostBase from './blue_team_lost_base.mp3';
import backgroundMusic from './background_music.mp3';
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

// Voice/dialogue audio files (people talking - game announcements)
export const audioFilesVocalExamples: string[] = [
  blueCaptureBase,
  blueLostBase,
  newPlayerJoined,
  oneMinuteLeft,
  playerHasLeftGame,
  redCaptureBase,
  redLostBase
];

// Sound effect audio files (non-vocal sounds like lasers, teleportation)
export const audioFilesSoundEffectExamples: string[] = [
  laserGunFiring,
  laserGunFiringRepeatedlyOne,
  longTeleportationOne,
  longTeleportationTwo,
  longTeleportationThree
];

// Export background music separately for specific use cases
export { backgroundMusic };

export function getRandomAudioFile(audioFiles: string[]): string {
  return audioFiles[Math.floor(Math.random() * audioFiles.length)];
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
