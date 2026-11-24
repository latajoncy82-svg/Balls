# Balls · Arena 1v1

Dwuwymiarowa gra pojedynkowa typu **arena 1 na 1** (auto-battler oparty na fizyce odbić), z trybem **Solo vs Bot** oraz **Online 1v1** przez WebSocket (`ws`).

## Postacie
* **George Floyd (`250 HP`)** – *Tank / Overdrive*: co 3 s rzuca energetyczną kapsułkę z przyciąganiem magnetycznym (`+6 HP`, `+1` siła, `+10%` szybkości). Przy `10/10` odpala **Falę Mocy** (`-18 HP` i odrzut rywala w pobliżu). Siła spada o 1 co 7 s.
* **Benjamin Netanjahu (`200 HP`)** – *Dystans / Super Ult*: co 5 s strzela odbijającą się sześcioramienną gwiazdą (`12 DMG`). Po 5 trafieniach odpala **Super Gwiazdę Dawida** z natychmiastowym promieniem za **50 HP**.
* **Charlie Kirk (`200 HP`)** – *Kontrola / Sustain*: co 4 s wysyła odbijającą się **Falę Debaty** (`9 DMG` + odrzut). Co 15 s pije gorącą herbatę (`+25 HP`, `+25%` szybkości i siła `8` na 5 s).
* **Klasyczna kulka (`100 HP`)** – czysta fizyka areny bez zdolności specjalnych.

## Struktura projektu
* `games/balls/index.html` – interfejs gry, renderer 2D `<canvas>` oraz syntezator dźwięków Web Audio API.
* `games/balls/physics.mjs` – współdzielony silnik fizyki i umiejętności (klient + serwer).
* `api/balls.mjs` – serwer HTTP/WebSocket dla rozgrywki online 1 na 1.
* `games/balls/netanjahu.png`, `games/balls/kirk.png` – portrety postaci (`256×256` PNG).
