#!/usr/bin/env bash
# Builds src/audio/announcer_sprite.mp3 from the announcer voice lines.
# Each line is padded with silence to a fixed 2.5 s slot, so line N starts at N * 2500 ms.
# The order here must match ANNOUNCER_LINES in src/audio/announcerSprite.ts.
set -euo pipefail
cd "$(dirname "$0")/../src/audio"
lines=(blue_team_capture_base blue_team_lost_base blue_team_wins new_player_joined_the_game
  one_minute_left player_has_left_the_game red_team_capture_base red_team_lost_base red_team_wins)
inputs=()
filters=""
for i in "${!lines[@]}"; do
  inputs+=(-i "${lines[$i]}.mp3")
  filters+="[$i:a]aformat=sample_rates=44100:channel_layouts=mono,apad=whole_dur=2.5[a$i];"
done
for i in "${!lines[@]}"; do filters+="[a$i]"; done
filters+="concat=n=${#lines[@]}:v=0:a=1[out]"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filters" -map "[out]" -b:a 96k announcer_sprite.mp3
