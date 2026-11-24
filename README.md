# Balls · Arena 1v1

Dwuwymiarowa gra pojedynkowa typu **arena 1 na 1** (auto-battler oparty na fizyce odbić), z trybem **Solo vs Bot** oraz **Online 1v1 na 5 żyć** przez WebSocket (`ws`).

## Mechaniki ogólne
* **Losowe kolory bojowe:** Przed pojedynkiem każda kulka otrzymuje wyrazisty kolor z palety (np. Szmaragdowy, Karmazynowy, Błękitny, Fioletowy, Pomarańczowy, Neonowy róż). Wszystkie specjalne ataki danej postaci przyjmują jej przypisany kolor (w przypadku tabletek George'a Floyda sama tabletka pozostaje niebieska, a kolorowa jest jej obramówka).
* **Online 1v1 na 5 żyć:** Obaj gracze zaczynają z 5 sercami. Przegrana runda odbiera 1 życie, a między rundami można zmienić postać na kolejną rundę. Mecz wygrywa ten, kto przetrwa — kto pierwszy straci wszystkie 5 żyć, przegrywa.

## Postacie
* **George Floyd (`250 HP`)** – *Tank / Fent Level*: co 3 s rzuca niebieską tabletkę w kolorowej obramówce (`+5 HP`, `+1` Fent level, `+10%` szybkości). Fent level spada o 1 co 7 s.
* **Benjamin Netanjahu (`200 HP`)** – *Dystans / Super Ult*: co 5 s strzela odbijającą się sześcioramienną gwiazdą (`12 DMG`). Po 5 trafieniach odpala **Super Gwiazdę Dawida** z natychmiastowym promieniem za **50 HP**.
* **Charlie Kirk (`200 HP`)** – *Kontrola / Sustain*: co 4 s wysyła odbijającą się **Falę Debaty** (`9 DMG` + odrzut). Co 15 s pije gorącą herbatę (`+25 HP`, `+25%` szybkości i siła `8` na 5 s).
* **Diddy (`200 HP`)** – *Strefa / Baby Oil*: co 6 s rzuca w losowe miejsce **Baby Oil**, który zostawia plamę na 10 s z kolorową obramówką — leczy Didiego (`+3 HP/s`) i rani rywala (`-3 HP/s`).
* **Klasyczna kulka (`100 HP`)** – czysta fizyka areny bez zdolności specjalnych.

## Struktura projektu
* `games/balls/index.html` – interfejs gry, renderer 2D `<canvas>` oraz syntezator dźwięków Web Audio API.
* `games/balls/physics.mjs` – współdzielony silnik fizyki, kolorów i umiejętności (klient + serwer).
* `api/balls.mjs` – serwer HTTP/WebSocket dla rozgrywki online 1v1 na 5 żyć.
* `games/balls/netanjahu.png`, `games/balls/kirk.png`, `games/balls/diddy.png` – portrety postaci (`256×256` PNG).
