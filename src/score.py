"""Trilha do filme do Shomer Vision: uma base leve (Dmaj9, 92 bpm) do começo ao fim, um clique em cada botão do
operador, três bipes na detecção da pessoa, o motor das tampas da doca, o zumbido do drone enquanto voa e um toque
suave no pouso.

    python run_sfx.py <pasta>/src/score.py

Tempos de src/film.js (SCRIPT) e src/kin.js (MISSION_T, com a missão começando em 21 s).
"""

import os

from sfx.score_kit import airy, bed, chords, hz, motor, thud
from sfx.synth import click

TIMELINE = "../film/timeline.json"
OUT = os.path.join(os.environ.get("TEARDOWN_OUT", "teardown-out"), "shomer-score.wav")
TARGET_LUFS = -14.0
SEED = 31

CHORDS = chords("Dmaj9:D2 A2 C#3 E3 F#3/D1", "Bm9:B1 F#2 A2 C#3 D3/B0", "Gmaj7:G2 D3 F#3 B3/G1", "A6sus:A2 D3 E3 F#3 B3/A1")
MOTIF = [(0.5, hz("F#5")), (1.5, hz("A5")), (2.5, hz("E5"))]
CLICKS = (1.6, 6.0, 6.2, 6.8, 13.0, 13.4, 19.4, 19.8, 21.0, 23.8, 30.0, 36.0, 43.6, 50.2, 50.8, 55.4, 55.8, 64.6, 65.0, 65.4, 71.2, 71.8, 72.0)
MISSION = 21.0
DETECT = MISSION + 0.8
OPEN = (MISSION + 4.0, 2.6)
SPIN = MISSION + 6.6
FLY = (MISSION + 7.8, 39.6 - 7.8)
LAND = MISSION + 39.6
CLOSE = (MISSION + 40.4, 2.6)


def score(mix, tl):
    dur = tl["duration"]
    left, right, low, drums = bed(dur, 92, CHORDS, MOTIF, motif_voice="epiano", kicks=(0, 2.5), snares=(), hats=8, swing=0.0, keys_vel=0.7, keys_lp=3400)
    mix.put_stereo(0, left, right, 0.12)
    mix.put(0, low, 0.12)
    mix.put(0, drums, 0.045)
    # a pessoa detectada: três bipes subindo
    for i, f in enumerate((1240, 1480, 1760)):
        mix.put(DETECT + i * 0.16, click(f, 0.09), 0.08)
    # as tampas da doca abrindo e fechando
    mix.put(OPEN[0], motor(OPEN[1], 150, 850, 10), 0.022)
    mix.put(CLOSE[0], motor(CLOSE[1], 145, 800, 10), 0.022)
    # o drone: as hélices sobem de rotação e o zumbido segue enquanto ele voa
    mix.put(SPIN, airy(1.4, 300, 1400, 0.6), 0.03)
    mix.put(FLY[0], motor(FLY[1], 240, 2400, 22), 0.012)
    mix.put(LAND, thud(90, 0.06, 0.4), 0.06)
    for t in CLICKS:
        mix.put(t, click(2400, 0.025), 0.055)
