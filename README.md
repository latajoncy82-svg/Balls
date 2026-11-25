# Balls · Arena 1v1

Dwuwymiarowa gra pojedynkowa typu **arena 1 na 1** w **60 FPS** z dynamicznymi, szybkimi kulkami, 5 mapami do wyboru, przyciskiem startu w trybie Solo oraz **Lobby Gotowości** w trybie **Online 1v1 na 5 żyć**.

## Mechaniki ogólne
* **60 FPS i szybkie kulki:** Stały krok symulacji `60 Hz` (`1000/60 ms`) z płynnym renderowaniem `requestAnimationFrame` i smugami prędkości.
* **5 map areny (+ Losowa):**
  * `Klasyczna` – otwarta arena 1v1.
  * `Kolumny` – dwie okrągłe kolumny na środku planszy do odbić rykoszetowych.
  * `Bunkier` – centralna stalowa bariera dzieląca arenę z górnym i dolnym przejściem.
  * `Pinball` – trzy neonowe bumpery odbijające i przyspieszające kulki (`+35%` chwilowego boosta).
  * `Wulkan` – płonące strefy lawy w 4 rogach areny (`-4 HP/s` przy kontakcie).
* **Losowe kolory bojowe:** Przed meczem każda kulka otrzymuje wyrazisty kolor z 6-kolorowej palety — wszystkie jej ataki przejmują ten kolor (tabletki Floyda pozostają niebieskie z kolorową obramówką).
* **Lobby Gotowości Online 1v1 (5 żyć) i losowe mapy co rundę:** Po dobraniu przeciwnika gracze trafiają do lobby, gdzie wybierają postać i klikają **„Jestem gotowy”**. Każda runda rozgrywa się na losowej mapie areny; przegrana runda odbiera 1 z 5 serc, a między rundami gracze mogą zmienić postać lub od razu potwierdzić gotowość.

## Postacie
* **George Floyd (`250 HP`)** – *Tank / Fent Level*: co 3 s rzuca niebieską tabletkę w kolorowej obramówce (`+4 HP`, `+1` Fent level, `+10%` szybkości). Bije przy zderzeniu od **1 DMG** (0 Fent) do **11 DMG** (10 Fent). Fent level spada o 1 co 7 s.
* **Benjamin Netanjahu (`200 HP`)** – *Dystans / Super Ult*: brak ataku z bliska (`0 DMG` przy zderzeniu). Co 5 s strzela odbijającą się sześcioramienną gwiazdą (`12 DMG`). Po 5 trafieniach odpala **Super Gwiazdę Dawida** z natychmiastowym promieniem za **50 HP**.
* **Charlie Kirk (`200 HP`)** – *Kontrola / Sustain*: brak ataku z bliska (`0 DMG` przy zderzeniu). Co 4 s wysyła odbijającą się **Falę Debaty** (**18 DMG** na starcie, traci **3 DMG** co sekundę lotu aż do **0**). Co 15 s pije gorącą herbatę (`+25 HP` i `+25%` szybkości na 5 s).
* **Diddy (`200 HP`)** – *Strefa / Baby Oil*: brak ataku z bliska (`0 DMG` przy zderzeniu). Co 6 s rzuca powiększony o 25% **Baby Oil** (`10 s`) — nawet lekkie dotknięcie plamy rani rywala (**-2 DMG co 0,5 s**) i leczy Didiego (**+1 HP co 0,5 s**).
* **Klasyczna kulka (`100 HP`)** – czysta fizyka areny (`5 DMG` przy zderzeniu), bez zdolności specjalnych.

## Struktura projektu
* `games/balls/index.html` – interfejs gry, lobby gotowości, wybór map, renderer 60 FPS `<canvas>` oraz syntezator Web Audio API.
* `games/balls/physics.mjs` – współdzielony silnik fizyki 60 Hz, map, kolorów i umiejętności (klient + serwer).
* `api/balls.mjs` – serwer HTTP/WebSocket dla rozgrywki online 1v1 na 5 żyć (Fluid Compute).
* `games/balls/netanjahu.png`, `games/balls/kirk.png`, `games/balls/diddy.png` – portrety postaci (`256×256` PNG).
