const UNSORTED_AUDIO_FILES = ["acf_black_01.mp3","acf_black_02.mp3","acf_black_03.mp3","acf_black_04.mp3","acf_black_05.mp3","acf_black_06.mp3","acf_black_07.mp3","acf_black_08.mp3","acf_black_09.mp3","ceg_red_01.mp3","ceg_red_02.mp3","ceg_red_03.mp3","ceg_red_04.mp3","ceg_red_05.mp3","ceg_red_06.mp3","ceg_red_07.mp3","ceg_red_08.mp3","ceg_red_09.mp3","cfa_yellow_01.mp3","cfa_yellow_02.mp3","cfa_yellow_03.mp3","cfa_yellow_04.mp3","cfa_yellow_05.mp3","cfa_yellow_06.mp3","cfa_yellow_07.mp3","cfa_yellow_08.mp3","cfa_yellow_09.mp3","dgh_green_01.mp3","dgh_green_02.mp3","dgh_green_03.mp3","dgh_green_04.mp3","dgh_green_05.mp3","dgh_green_06.mp3","dgh_green_07.mp3","dgh_green_08.mp3","dgh_green_09.mp3","egc_orange_01.mp3","egc_orange_02.mp3","egc_orange_03.mp3","egc_orange_04.mp3","egc_orange_05.mp3","egc_orange_06.mp3","egc_orange_07.mp3","egc_orange_08.mp3","egc_orange_09.mp3","fac_purple_01.mp3","fac_purple_02.mp3","fac_purple_03.mp3","fac_purple_04.mp3","fac_purple_05.mp3","fac_purple_06.mp3","fac_purple_07.mp3","fac_purple_08.mp3","fac_purple_09.mp3","gce_brown_01.mp3","gce_brown_02.mp3","gce_brown_03.mp3","gce_brown_04.mp3","gce_brown_05.mp3","gce_brown_06.mp3","gce_brown_07.mp3","gce_brown_08.mp3","gce_brown_09.mp3","ghd_pink_01.mp3","ghd_pink_02.mp3","ghd_pink_03.mp3","ghd_pink_04.mp3","ghd_pink_05.mp3","ghd_pink_06.mp3","ghd_pink_07.mp3","ghd_pink_08.mp3","ghd_pink_09.mp3","hdg_blue_01.mp3","hdg_blue_02.mp3","hdg_blue_03.mp3","hdg_blue_04.mp3","hdg_blue_05.mp3","hdg_blue_06.mp3","hdg_blue_07.mp3","hdg_blue_08.mp3","hdg_blue_09.mp3",];
const INSTRUMENT_INFO = {"piano_1": {
        "display_name": "🎹 Piano",
        "base_url": "static_files/samples/piano_1/","legacy": false,
        "sample_files": {"A3" : "A3v11.mp3","A4" : "A4v11.mp3","A5" : "A5v11.mp3","A6" : "A6v11.mp3","C3" : "C3v11.mp3","C4" : "C4v11.mp3","C4" : "C4v5.mp3","C5" : "C5v11.mp3","C6" : "C6v11.mp3","D#3" : "D%233v11.mp3","D#4" : "D%234v11.mp3","D#5" : "D%235v11.mp3","F#3" : "F%233v11.mp3","F#4" : "F%234v11.mp3","F#5" : "F%235v11.mp3",},},"piano_old": {
        "display_name": "🎹🧓 Piano (old)",
        "base_url": "static_files/samples/piano_old/","legacy": true,
        "fallback": "piano_1",},};

const APP_CACHE = "cim-cache-v0";
let APP_ASSETS = null;

function get_static_files() {
    if (APP_ASSETS === null) {
        function get_instrument_files(instrument) {
            if (instrument.legacy) {
                return [];
            } else {
                return Object.values(instrument.sample_files).map(
                    (filename) => (instrument.base_url + filename));
            }
        }

        const instrument_files = Object.values(INSTRUMENT_INFO).flatMap(get_instrument_files);
        const audio_files = UNSORTED_AUDIO_FILES.map((file) => "static_files/chords/" + file);
        const extras = [
            "index.html",
            "js/cim.js",
            "assets/css/style.css",
            "assets/fonts/forkawesome-webfont.woff2?v=1.2.0"
        ]

        APP_ASSETS = [];
        APP_ASSETS = APP_ASSETS.concat(instrument_files);
        APP_ASSETS = APP_ASSETS.concat(audio_files);
        APP_ASSETS = APP_ASSETS.concat(extras);
    }

    return APP_ASSETS;
}

self.addEventListener("install", event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(APP_CACHE);
            console.log("[Service Worker] Caching all: app and shell content");
            await cache.addAll(get_static_files());
        })(),
    );
});

self.addEventListener("activate", (e) => {
    console.log("[Service Worker] Claiming control");
    return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(APP_CACHE);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});
