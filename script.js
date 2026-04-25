(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // DOM REFERENCES
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById("asciiCanvas");
  const uiPanel = document.getElementById("uiPanel");
  const panelToggle = document.getElementById("panelToggle");
  const mobileControls = document.getElementById("mobileControls");
  const seedInput = document.getElementById("seedInput");
  const applySeedBtn = document.getElementById("applySeedBtn");
  const hudSeed = document.getElementById("hudSeed");
  const hudCoords = document.getElementById("hudCoords");
  const hudBiome = document.getElementById("hudBiome");
  const hudLandmark = document.getElementById("hudLandmark");

  // ---------------------------------------------------------------------------
  // CONSTANTS
  // ---------------------------------------------------------------------------
  const FOV = 1.2;
  const VIEW_DISTANCE = 280;
  const CAMERA_EYE_HEIGHT = 7.2;

  const BIOMES = [
    {
      id: "crystal_plains",
      name: "Crystal Plains",
      centroid: [-0.78, 0.58],
      groundChars: [".", ":", "`", ","],
      liquidChars: ["~", "=", "-"],
      featureChars: ["*", "+", "^", "A"],
      rockChars: ["#", "M", "^", "%"],
      colors: {
        ground: [78, 122, 140],
        liquid: [84, 220, 205],
        feature: [139, 255, 230],
        rock: [148, 198, 212]
      }
    },
    {
      id: "toxic_marsh",
      name: "Toxic Marsh",
      centroid: [-0.24, -0.88],
      groundChars: [",", ".", ";", ":"],
      liquidChars: ["~", "=", "-"],
      featureChars: ["f", "t", "y", "!"],
      rockChars: ["o", "#", "%", "0"],
      colors: {
        ground: [68, 98, 54],
        liquid: [100, 224, 94],
        feature: [149, 200, 103],
        rock: [106, 121, 80]
      }
    },
    {
      id: "fungal_forests",
      name: "Fungal Forests",
      centroid: [0.34, 0.16],
      groundChars: [".", "`", ",", ":"],
      liquidChars: ["~", "-", "_"],
      featureChars: ["Y", "T", "i", "!"],
      rockChars: ["m", "w", "#", "%"],
      colors: {
        ground: [82, 74, 66],
        liquid: [95, 154, 112],
        feature: [201, 137, 108],
        rock: [130, 114, 101]
      }
    },
    {
      id: "ash_deserts",
      name: "Ash Deserts",
      centroid: [0.88, -0.26],
      groundChars: [".", "`", ":", ";"],
      liquidChars: ["_", "~", "-"],
      featureChars: ["^", "n", "v", "x"],
      rockChars: ["o", "O", "#", "%"],
      colors: {
        ground: [116, 98, 88],
        liquid: [129, 112, 93],
        feature: [202, 152, 103],
        rock: [171, 150, 138]
      }
    },
    {
      id: "glowing_ruins",
      name: "Glowing Ruins",
      centroid: [0.1, 0.9],
      groundChars: [".", "_", "-", "="],
      liquidChars: ["~", "=", "-"],
      featureChars: ["#", "H", "+", "|"],
      rockChars: ["#", "%", "@", "M"],
      colors: {
        ground: [70, 84, 96],
        liquid: [79, 148, 154],
        feature: [126, 233, 201],
        rock: [155, 178, 192]
      }
    },
    {
      id: "acid_lakes",
      name: "Acid Lakes",
      centroid: [-0.9, -0.36],
      groundChars: [",", ".", ";", ":"],
      liquidChars: ["~", "=", "_"],
      featureChars: ["*", "!", "i", "|"],
      rockChars: ["o", "#", "%", "0"],
      colors: {
        ground: [62, 78, 74],
        liquid: [124, 255, 166],
        feature: [171, 249, 128],
        rock: [97, 119, 112]
      }
    },
    {
      id: "rocky_wastelands",
      name: "Rocky Wastelands",
      centroid: [0.77, 0.77],
      groundChars: [".", ",", ":", "`"],
      liquidChars: ["~", "_", "-"],
      featureChars: ["^", "A", "M", "#"],
      rockChars: ["#", "@", "%", "M"],
      colors: {
        ground: [97, 81, 74],
        liquid: [90, 112, 118],
        feature: [183, 154, 123],
        rock: [186, 168, 154]
      }
    },
    {
      id: "prismatic_reefs",
      name: "Prismatic Reefs",
      centroid: [-0.52, 0.04],
      groundChars: [".", ",", ":", ";"],
      liquidChars: ["~", "=", "o"],
      featureChars: ["*", "x", "+", "%"],
      rockChars: ["#", "%", "&", "8"],
      colors: {
        ground: [66, 96, 118],
        liquid: [89, 214, 255],
        feature: [255, 112, 218],
        rock: [116, 177, 220]
      }
    },
    {
      id: "storm_hives",
      name: "Storm Hives",
      centroid: [0.52, -0.72],
      groundChars: [".", "`", ":", ","],
      liquidChars: ["_", "-", "~"],
      featureChars: ["X", "V", "Y", "!"],
      rockChars: ["@", "#", "M", "%"],
      colors: {
        ground: [86, 83, 122],
        liquid: [121, 164, 221],
        feature: [255, 229, 112],
        rock: [146, 132, 174]
      }
    }
  ];

  // Extra flora rules per biome to keep each region distinct and alive.
  const BIOME_FLORA = {
    crystal_plains: {
      density: 0.58,
      glow: 0.22,
      tallChars: ["Y", "A", "|", "/", "\\"],
      lowChars: ["*", "+", ":", ";"],
      colors: [
        [129, 255, 236],
        [162, 245, 255],
        [203, 255, 246]
      ]
    },
    toxic_marsh: {
      density: 0.71,
      glow: 0.12,
      tallChars: ["f", "t", "|", "Y", "!"],
      lowChars: [";", ",", "i", ":"],
      colors: [
        [139, 206, 99],
        [162, 232, 111],
        [111, 170, 83]
      ]
    },
    fungal_forests: {
      density: 0.83,
      glow: 0.07,
      tallChars: ["T", "Y", "m", "w", "|"],
      lowChars: ["n", "u", ";", ":", "i"],
      colors: [
        [223, 140, 112],
        [194, 116, 162],
        [255, 183, 141]
      ]
    },
    ash_deserts: {
      density: 0.44,
      glow: 0.05,
      tallChars: ["^", "A", "n", "v", "|"],
      lowChars: ["`", ".", ",", ":"],
      colors: [
        [202, 158, 116],
        [224, 171, 135],
        [181, 139, 100]
      ]
    },
    glowing_ruins: {
      density: 0.52,
      glow: 0.24,
      tallChars: ["H", "|", "+", "#", "A"],
      lowChars: ["=", "-", "_", ":"],
      colors: [
        [131, 240, 207],
        [164, 255, 232],
        [122, 208, 228]
      ]
    },
    acid_lakes: {
      density: 0.62,
      glow: 0.2,
      tallChars: ["!", "i", "|", "t", "Y"],
      lowChars: ["~", ";", ":", "."],
      colors: [
        [182, 255, 149],
        [132, 235, 172],
        [215, 255, 180]
      ]
    },
    rocky_wastelands: {
      density: 0.48,
      glow: 0.05,
      tallChars: ["A", "^", "M", "|", "#"],
      lowChars: [".", ",", ":", ";"],
      colors: [
        [197, 169, 147],
        [171, 148, 128],
        [223, 194, 158]
      ]
    },
    prismatic_reefs: {
      density: 0.76,
      glow: 0.23,
      tallChars: ["X", "Y", "*", "|", "%"],
      lowChars: ["x", "+", ".", ":"],
      colors: [
        [255, 109, 218],
        [105, 231, 255],
        [255, 236, 126]
      ]
    },
    storm_hives: {
      density: 0.57,
      glow: 0.18,
      tallChars: ["V", "Y", "X", "!", "|"],
      lowChars: ["v", "x", ":", ";"],
      colors: [
        [255, 228, 103],
        [188, 157, 255],
        [116, 214, 235]
      ]
    }
  };

  const BIOME_CREATURES = {
    crystal_plains: [
      { name: "Shard Skitter", chars: ["k", "K"], color: [178, 255, 245], speed: 1.2 },
      { name: "Glass Manta", chars: ["m", "M"], color: [206, 242, 255], speed: 0.7 }
    ],
    toxic_marsh: [
      { name: "Bog Floater", chars: ["q", "Q"], color: [184, 255, 104], speed: 0.8 },
      { name: "Needle Leech", chars: ["s", "S"], color: [101, 220, 93], speed: 1.4 }
    ],
    fungal_forests: [
      { name: "Sporeback", chars: ["b", "B"], color: [255, 150, 132], speed: 0.6 },
      { name: "Cap Prowler", chars: ["r", "R"], color: [220, 127, 205], speed: 1.0 }
    ],
    ash_deserts: [
      { name: "Cinder Wisp", chars: ["c", "C"], color: [255, 175, 98], speed: 1.1 },
      { name: "Dune Strider", chars: ["h", "H"], color: [228, 192, 137], speed: 0.9 }
    ],
    glowing_ruins: [
      { name: "Rune Drone", chars: ["d", "D"], color: [147, 255, 225], speed: 1.5 },
      { name: "Vault Sentinel", chars: ["g", "G"], color: [205, 255, 171], speed: 0.45 }
    ],
    acid_lakes: [
      { name: "Acid Piper", chars: ["p", "P"], color: [181, 255, 149], speed: 1.2 },
      { name: "Brine Eye", chars: ["e", "E"], color: [226, 255, 163], speed: 0.5 }
    ],
    rocky_wastelands: [
      { name: "Ridge Crawler", chars: ["a", "A"], color: [225, 185, 147], speed: 0.9 },
      { name: "Basalt Grazer", chars: ["u", "U"], color: [195, 173, 158], speed: 0.55 }
    ],
    prismatic_reefs: [
      { name: "Neon Polliwog", chars: ["j", "J"], color: [95, 235, 255], speed: 1.45 },
      { name: "Prism Grazer", chars: ["z", "Z"], color: [255, 117, 224], speed: 0.75 }
    ],
    storm_hives: [
      { name: "Static Imp", chars: ["v", "V"], color: [255, 231, 111], speed: 1.7 },
      { name: "Hive Walker", chars: ["w", "W"], color: [184, 160, 255], speed: 0.85 }
    ]
  };

  // ---------------------------------------------------------------------------
  // GENERAL HELPERS
  // ---------------------------------------------------------------------------
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

  function fract(value) {
    return value - Math.floor(value);
  }

  function hashString(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mixColor(a, b, t) {
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t))
    ];
  }

  function scaleColor(color, factor) {
    return [
      clamp(Math.round(color[0] * factor), 0, 255),
      clamp(Math.round(color[1] * factor), 0, 255),
      clamp(Math.round(color[2] * factor), 0, 255)
    ];
  }

  function offsetColor(color, dr, dg, db) {
    return [
      clamp(Math.round(color[0] + dr), 0, 255),
      clamp(Math.round(color[1] + dg), 0, 255),
      clamp(Math.round(color[2] + db), 0, 255)
    ];
  }

  function colorToCss(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  function makeRandomSeed() {
    const n = Math.floor(Math.random() * 0xffffff);
    return `ALIEN-${n.toString(16).toUpperCase().padStart(6, "0")}`;
  }

  function createLCG(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  // ---------------------------------------------------------------------------
  // SEEDED NOISE
  // ---------------------------------------------------------------------------
  class Noise2D {
    constructor(seed) {
      this.seed = seed >>> 0;
    }

    hash2i(x, y) {
      let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ this.seed;
      h = (h ^ (h >>> 13)) >>> 0;
      h = Math.imul(h, 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967295;
    }

    value(x, y) {
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const xf = x - x0;
      const yf = y - y0;

      const v00 = this.hash2i(x0, y0);
      const v10 = this.hash2i(x0 + 1, y0);
      const v01 = this.hash2i(x0, y0 + 1);
      const v11 = this.hash2i(x0 + 1, y0 + 1);

      const u = smooth(xf);
      const v = smooth(yf);

      const nx0 = lerp(v00, v10, u);
      const nx1 = lerp(v01, v11, u);
      return lerp(nx0, nx1, v);
    }

    fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
      let value = 0;
      let frequency = 1;
      let amplitude = 0.5;
      let norm = 0;

      for (let i = 0; i < octaves; i += 1) {
        value += this.value(x * frequency, y * frequency) * amplitude;
        norm += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return norm === 0 ? 0 : value / norm;
    }

    ridged(x, y, octaves = 4, lacunarity = 2, gain = 0.55) {
      let value = 0;
      let frequency = 1;
      let amplitude = 0.6;
      let norm = 0;

      for (let i = 0; i < octaves; i += 1) {
        let n = this.value(x * frequency, y * frequency);
        n = 1 - Math.abs(n * 2 - 1);
        value += n * n * amplitude;
        norm += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return norm === 0 ? 0 : value / norm;
    }
  }

  // ---------------------------------------------------------------------------
  // WORLD GENERATION
  // ---------------------------------------------------------------------------
  class WorldGenerator {
    constructor(seedText) {
      this.seedText = String(seedText).trim() || "ALIEN";
      this.seedInt = hashString(this.seedText);
      this.noise = new Noise2D(this.seedInt);
    }

    getBiomeBlend(x, z) {
      const n = this.noise;

      // Domain warping creates larger organic biome boundaries.
      const warpX = (n.fbm(x * 0.0008, z * 0.0008, 3) - 0.5) * 240;
      const warpZ = (n.fbm((x + 910) * 0.0008, (z - 620) * 0.0008, 3) - 0.5) * 240;
      const bx = x + warpX;
      const bz = z + warpZ;

      const climateA = n.fbm(bx * 0.00034, bz * 0.00034, 5, 2, 0.52) * 2 - 1;
      const climateB = n.fbm((bx - 1380) * 0.00034, (bz + 880) * 0.00034, 5, 2, 0.52) * 2 - 1;

      const distances = BIOMES.map((biome, index) => {
        const dx = climateA - biome.centroid[0];
        const dy = climateB - biome.centroid[1];
        return {
          index,
          dist: Math.hypot(dx, dy)
        };
      }).sort((a, b) => a.dist - b.dist);

      const first = distances[0];
      const second = distances[1];
      const gap = second.dist - first.dist;

      return {
        primary: first.index,
        secondary: second.index,
        // 0.5 near biome borders, 1.0 deep inside a biome.
        primaryWeight: clamp(0.5 + gap * 1.2, 0.5, 1)
      };
    }

    sampleBiomeProfile(biome, x, z) {
      const n = this.noise;

      switch (biome.id) {
        case "crystal_plains": {
          const rolling = n.fbm(x * 0.012, z * 0.012, 4) * 10;
          const ridges = n.ridged(x * 0.04, z * 0.04, 3) * 16;
          const spikes = Math.pow(clamp((ridges - 9) / 7, 0, 1), 2) * 20;
          return {
            ground: 24 + rolling + ridges * 0.28,
            water: 11,
            feature: spikes,
            rough: clamp(ridges / 16, 0, 1),
            activity: ridges
          };
        }

        case "toxic_marsh": {
          const flats = n.fbm(x * 0.01, z * 0.01, 4) * 5;
          const channels = n.ridged(x * 0.03, z * 0.03, 3);
          const basin = Math.pow(1 - channels, 2.1) * 12;
          const growth = clamp((n.value(x * 0.09, z * 0.09) - 0.77) * 5, 0, 1) * 8;
          return {
            ground: 14 + flats - basin,
            water: 16 + n.fbm(x * 0.005, z * 0.005, 2) * 1.5,
            feature: growth,
            rough: 1 - channels,
            activity: growth + basin
          };
        }

        case "fungal_forests": {
          const rolling = n.fbm(x * 0.011, z * 0.011, 4) * 11;
          const mounds = n.ridged(x * 0.025, z * 0.025, 3) * 9;
          const spores = clamp((n.value(x * 0.08 + 20, z * 0.08 - 30) - 0.73) * 4.5, 0, 1) * 14;
          return {
            ground: 20 + rolling + mounds,
            water: 13,
            feature: spores,
            rough: clamp(mounds / 9, 0, 1),
            activity: spores
          };
        }

        case "ash_deserts": {
          const warp = n.fbm(x * 0.003, z * 0.003, 2) * 4;
          const dunes = Math.sin(x * 0.022 + warp) * 3.7 + Math.cos(z * 0.019 - warp) * 2.8;
          const grain = n.fbm(x * 0.018, z * 0.018, 3) * 4;
          const spires = clamp((n.ridged(x * 0.055, z * 0.055, 2) - 0.82) * 5.2, 0, 1) * 12;
          return {
            ground: 22 + dunes + grain,
            water: 9,
            feature: spires,
            rough: clamp(Math.abs(dunes) / 5.5, 0, 1),
            activity: grain
          };
        }

        case "glowing_ruins": {
          const base = 19 + n.fbm(x * 0.01, z * 0.01, 4) * 7;
          const terrace = Math.floor(base / 2.8) * 2.8;
          const gx = Math.abs(fract(x * 0.07) - 0.5);
          const gz = Math.abs(fract(z * 0.07) - 0.5);
          const pattern = Math.max(gx, gz);
          const structures = clamp((0.09 - pattern) / 0.09, 0, 1) * 13;
          const pulse = clamp((n.value(x * 0.04 + 90, z * 0.04 - 55) - 0.78) * 5, 0, 1) * 8;
          return {
            ground: terrace + structures * 0.75,
            water: 12,
            feature: structures + pulse,
            rough: clamp(structures / 13, 0, 1),
            activity: structures + pulse
          };
        }

        case "prismatic_reefs": {
          const shelves = n.ridged(x * 0.018, z * 0.018, 4);
          const lagoons = Math.pow(1 - shelves, 2.2) * 13;
          const coral = clamp((n.value(x * 0.065 + 14, z * 0.065 - 43) - 0.62) * 3.6, 0, 1) * 17;
          const shimmer = Math.sin(x * 0.028 + z * 0.017) * 3.5;
          return {
            ground: 17 + shelves * 18 + shimmer - lagoons,
            water: 18 + n.fbm(x * 0.004, z * 0.004, 2) * 3,
            feature: coral,
            rough: clamp(shelves + coral / 22, 0, 1),
            activity: coral + shelves * 8
          };
        }

        case "storm_hives": {
          const cells = n.ridged(x * 0.031, z * 0.031, 4);
          const storm = n.fbm(x * 0.012 - 70, z * 0.012 + 51, 4) * 11;
          const towers = Math.pow(clamp((cells - 0.48) * 2.2, 0, 1), 2.4) * 24;
          const forks = clamp((n.value(x * 0.11 + 9, z * 0.11 - 18) - 0.86) * 7, 0, 1) * 12;
          return {
            ground: 18 + storm + cells * 8,
            water: 10,
            feature: towers + forks,
            rough: clamp(cells, 0, 1),
            activity: towers + forks * 1.7
          };
        }

        case "acid_lakes": {
          const basin = n.ridged(x * 0.018, z * 0.018, 3);
          const crater = Math.pow(1 - basin, 3) * 24;
          const noise = n.fbm(x * 0.009, z * 0.009, 3) * 5;
          const vents = clamp((n.value(x * 0.06 - 11, z * 0.06 + 17) - 0.86) * 6, 0, 1) * 6;
          return {
            ground: 12 + noise - crater,
            water: 17 + n.fbm(x * 0.004, z * 0.004, 2) * 2,
            feature: vents,
            rough: 1 - basin,
            activity: crater + vents
          };
        }

        case "rocky_wastelands":
        default: {
          const mountains = n.ridged(x * 0.016, z * 0.016, 4) * 24;
          const cracks = n.fbm(x * 0.05, z * 0.05, 3) * 5;
          const teeth = clamp((n.ridged(x * 0.07, z * 0.07, 2) - 0.78) * 5.1, 0, 1) * 16;
          return {
            ground: 23 + mountains + cracks,
            water: 10,
            feature: teeth,
            rough: clamp(mountains / 24, 0, 1),
            activity: mountains
          };
        }
      }
    }

    sampleLandmark(x, z) {
      const regionSize = 360;
      const regionX = Math.floor(x / regionSize);
      const regionZ = Math.floor(z / regionSize);
      let best = null;

      for (let dz = -1; dz <= 1; dz += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const rx = regionX + dx;
          const rz = regionZ + dz;
          const spawnRoll = this.noise.hash2i(rx * 53 + 11, rz * 53 - 17);

          // Very rare points of interest.
          if (spawnRoll < 0.975) {
            continue;
          }

          const ox = (this.noise.hash2i(rx * 53 + 7, rz * 53 + 29) - 0.5) * regionSize * 0.75;
          const oz = (this.noise.hash2i(rx * 53 - 23, rz * 53 + 37) - 0.5) * regionSize * 0.75;
          const lx = rx * regionSize + regionSize * 0.5 + ox;
          const lz = rz * regionSize + regionSize * 0.5 + oz;

          const distance = Math.hypot(x - lx, z - lz);
          const radius = 70 + this.noise.hash2i(rx * 53 - 13, rz * 53 + 19) * 60;
          if (distance >= radius) {
            continue;
          }

          const strength = 1 - distance / radius;
          const typeRoll = this.noise.hash2i(rx * 53 + 41, rz * 53 + 61);

          let landmark;
          if (typeRoll < 0.34) {
            landmark = {
              name: "Ancient Spire",
              char: "|",
              color: [255, 216, 143],
              heightDelta: Math.pow(strength, 2.2) * 44,
              glow: 0.22,
              strength
            };
          } else if (typeRoll < 0.67) {
            landmark = {
              name: "Orbital Ring Fragment",
              char: "O",
              color: [156, 229, 255],
              heightDelta: Math.pow(strength, 1.9) * 30,
              glow: 0.35,
              strength
            };
          } else {
            landmark = {
              name: "Monolith Garden",
              char: "H",
              color: [200, 255, 151],
              heightDelta: Math.pow(strength, 1.7) * 26,
              glow: 0.3,
              strength
            };
          }

          if (!best || landmark.strength > best.strength) {
            best = landmark;
          }
        }
      }

      return best;
    }

    sampleCreature(x, z, timeSeconds, primaryBiome, secondaryBiome, primaryWeight, liquid, activityLevel) {
      const cellSize = 30;
      const cellX = Math.floor(x / cellSize);
      const cellZ = Math.floor(z / cellSize);
      const sourceBiome = this.noise.hash2i(cellX * 29 + 3, cellZ * 29 - 7) < primaryWeight
        ? primaryBiome
        : secondaryBiome;

      const creatures = BIOME_CREATURES[sourceBiome.id];
      if (!creatures) {
        return null;
      }

      const waterLife = sourceBiome.id === "acid_lakes" || sourceBiome.id === "prismatic_reefs" || sourceBiome.id === "toxic_marsh";
      if (liquid && !waterLife) {
        return null;
      }

      const spawnRoll = this.noise.hash2i(cellX * 173 + 31, cellZ * 173 - 47);
      const chance = clamp(0.09 + activityLevel * 0.003, 0.09, 0.22);
      if (spawnRoll < 1 - chance) {
        return null;
      }

      const jitterX = (this.noise.hash2i(cellX * 173 - 13, cellZ * 173 + 19) - 0.5) * cellSize * 0.48;
      const jitterZ = (this.noise.hash2i(cellX * 173 + 41, cellZ * 173 + 59) - 0.5) * cellSize * 0.48;
      const baseX = cellX * cellSize + cellSize * 0.5 + jitterX;
      const baseZ = cellZ * cellSize + cellSize * 0.5 + jitterZ;

      const creatureIndex = Math.floor(this.noise.hash2i(cellX * 173 + 71, cellZ * 173 - 83) * creatures.length) % creatures.length;
      const creature = creatures[creatureIndex];
      const phase = this.noise.hash2i(cellX * 173 - 101, cellZ * 173 + 107) * Math.PI * 2;
      const wander = 3 + this.noise.hash2i(cellX * 173 + 127, cellZ * 173 - 131) * 4.5;
      const angle = phase + timeSeconds * creature.speed * 0.55;
      const cx = baseX + Math.cos(angle) * wander;
      const cz = baseZ + Math.sin(angle * 0.8 + phase) * wander;
      const distance = Math.hypot(x - cx, z - cz);
      const footprint = liquid ? 4.9 : 3.8;

      if (distance > footprint) {
        return null;
      }

      const frame = Math.floor(timeSeconds * (3.5 + creature.speed * 1.5) + phase);
      const char = creature.chars[Math.abs(frame) % creature.chars.length];
      return {
        name: creature.name,
        char,
        color: creature.color,
        glow: liquid ? 0.28 : 0.18
      };
    }

    sample(x, z, timeSeconds) {
      const blendInfo = this.getBiomeBlend(x, z);
      const primaryBiome = BIOMES[blendInfo.primary];
      const secondaryBiome = BIOMES[blendInfo.secondary];

      const primary = this.sampleBiomeProfile(primaryBiome, x, z);
      const secondary = this.sampleBiomeProfile(secondaryBiome, x, z);

      const p = blendInfo.primaryWeight;
      const s = 1 - p;

      let ground = primary.ground * p + secondary.ground * s;
      const water = primary.water * p + secondary.water * s;
      let feature = primary.feature * p + secondary.feature * s;
      const rough = primary.rough * p + secondary.rough * s;

      // Adds extra local detail so the world has richer near-field structure.
      feature += this.noise.fbm(x * 0.062 + 311, z * 0.062 - 227, 2, 2, 0.58) * 3.2;

      const landmark = this.sampleLandmark(x, z);
      if (landmark) {
        ground += landmark.heightDelta;
      }

      const solidHeight = ground + feature;
      const liquid = water > solidHeight;
      const renderHeight = liquid ? water : solidHeight;

      const tileX = Math.floor(x * 1.7);
      const tileZ = Math.floor(z * 1.7);
      const tileRoll = this.noise.hash2i(tileX * 19 + 5, tileZ * 19 - 9);
      const colorRollA = this.noise.hash2i(tileX * 67 - 21, tileZ * 67 + 15);
      const colorRollB = this.noise.hash2i(tileX * 97 + 41, tileZ * 97 - 73);

      const primarySource = tileRoll < p ? primaryBiome : secondaryBiome;
      const floraPrimary = BIOME_FLORA[primaryBiome.id];
      const floraSecondary = BIOME_FLORA[secondaryBiome.id];
      const floraBlendDensity = floraPrimary.density * p + floraSecondary.density * s;
      const floraField = this.noise.fbm(x * 0.085 + 73, z * 0.085 - 91, 3, 2, 0.55);
      const floraPatch = this.noise.ridged(x * 0.18 - 17, z * 0.18 + 29, 2, 2, 0.6);
      const floraStrength = liquid
        ? 0
        : clamp((floraField - (0.7 - floraBlendDensity * 0.28)) * 3.3 + floraPatch * 0.38, 0, 1);

      let char;
      let altChar;
      let baseColor;

      let glow = 0;
      const hasCrystal = primaryBiome.id === "crystal_plains" || secondaryBiome.id === "crystal_plains";
      const hasRuins = primaryBiome.id === "glowing_ruins" || secondaryBiome.id === "glowing_ruins";
      const hasToxic = primaryBiome.id === "toxic_marsh" || secondaryBiome.id === "toxic_marsh";
      const hasAcid = primaryBiome.id === "acid_lakes" || secondaryBiome.id === "acid_lakes";
      const hasPrismatic = primaryBiome.id === "prismatic_reefs" || secondaryBiome.id === "prismatic_reefs";
      const hasStorm = primaryBiome.id === "storm_hives" || secondaryBiome.id === "storm_hives";
      const localActivity = feature + rough * 6;
      const creature = this.sampleCreature(
        x,
        z,
        timeSeconds,
        primaryBiome,
        secondaryBiome,
        p,
        liquid,
        localActivity
      );

      if (liquid) {
        const chars = primarySource.liquidChars;
        const frame = Math.floor(timeSeconds * 4.4 + tileRoll * 11);
        const index = ((frame % chars.length) + chars.length) % chars.length;
        char = chars[index];
        altChar = chars[(index + 1) % chars.length];
        baseColor = mixColor(primaryBiome.colors.liquid, secondaryBiome.colors.liquid, s);

        if (hasToxic || hasAcid || hasPrismatic) {
          glow += 0.12 + 0.12 * (0.5 + 0.5 * Math.sin(timeSeconds * 5 + tileRoll * 20));
        }
      } else if (landmark && landmark.strength > 0.34) {
        char = landmark.char;
        altChar = landmark.char;
        baseColor = mixColor(
          mixColor(primaryBiome.colors.feature, secondaryBiome.colors.feature, s),
          landmark.color,
          clamp(landmark.strength * 0.85, 0, 1)
        );
        glow += landmark.glow * landmark.strength;
      } else if (floraStrength > 0.3 && (feature > 2.2 || rough > 0.24)) {
        const floraProfile = tileRoll < p ? floraPrimary : floraSecondary;
        const floraChars = floraStrength > 0.66 ? floraProfile.tallChars : floraProfile.lowChars;
        const floraIndex =
          Math.floor(tileRoll * floraChars.length + floraField * 3.7 + floraPatch * 1.9) % floraChars.length;
        const palette = floraProfile.colors;
        const colorIndex = Math.floor(colorRollA * palette.length) % palette.length;

        char = floraChars[floraIndex];
        altChar = floraChars[(floraIndex + 1) % floraChars.length];
        baseColor = mixColor(
          mixColor(primaryBiome.colors.feature, secondaryBiome.colors.feature, s),
          palette[colorIndex],
          clamp(0.48 + floraStrength * 0.4, 0, 0.95)
        );
        glow += floraProfile.glow * floraStrength;
      } else if (feature > 4.2) {
        const chars = primarySource.featureChars;
        const baseIndex = Math.floor(tileRoll * chars.length) % chars.length;
        const animatedIndex = Math.floor(timeSeconds * 6 + tileRoll * 8) % chars.length;
        const useAnimated = hasCrystal && feature > 8;
        const index = useAnimated ? animatedIndex : baseIndex;
        char = chars[index];
        altChar = chars[(index + 1) % chars.length];
        baseColor = mixColor(primaryBiome.colors.feature, secondaryBiome.colors.feature, s);

        if (hasCrystal) {
          glow += 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(timeSeconds * 4.6 + tileRoll * 31));
        }

        if (hasRuins) {
          glow += 0.18;
        }

        if (hasStorm) {
          glow += 0.14 + 0.16 * clamp(Math.sin(timeSeconds * 9 + x * 0.04) * 0.5 + 0.5, 0, 1);
        }
      } else if (rough > 0.62) {
        const chars = primarySource.rockChars;
        const index = Math.floor(tileRoll * chars.length) % chars.length;
        char = chars[index];
        altChar = chars[(index + 1) % chars.length];
        baseColor = mixColor(primaryBiome.colors.rock, secondaryBiome.colors.rock, s);
      } else {
        const chars = primarySource.groundChars;
        const index = Math.floor(tileRoll * chars.length) % chars.length;
        char = chars[index];
        altChar = chars[(index + 2) % chars.length];
        baseColor = mixColor(primaryBiome.colors.ground, secondaryBiome.colors.ground, s);
      }

      if (hasRuins) {
        const pulse = 0.5 + 0.5 * Math.sin(timeSeconds * 1.1 + x * 0.002 + z * 0.002);
        glow += pulse * 0.08;
      }

      if (hasPrismatic) {
        const prism = 0.5 + 0.5 * Math.sin(timeSeconds * 1.9 + x * 0.017 + z * 0.011);
        baseColor = mixColor(baseColor, [255, 126, 226], prism * 0.16);
        glow += prism * 0.08;
      }

      if (creature) {
        char = creature.char;
        altChar = creature.char;
        baseColor = mixColor(baseColor, creature.color, 0.86);
        glow += creature.glow;
      }

      // Per-tile tint jitter keeps flora and objects from looking flat.
      const variation = (colorRollA - 0.5) * (liquid ? 18 : 34);
      const variationB = (colorRollB - 0.5) * (liquid ? 12 : 26);
      baseColor = offsetColor(
        baseColor,
        variation + variationB * 0.4,
        variationB * 0.35,
        -variation * 0.28 + variationB * 0.2
      );

      baseColor = scaleColor(baseColor, 1 + glow * 0.34);

      const biomeName =
        p > 0.72
          ? primaryBiome.name
          : `${primaryBiome.name} / ${secondaryBiome.name}`;

      return {
        renderHeight,
        liquid,
        char,
        altChar,
        color: baseColor,
        glow,
        biomeName,
        primaryBiomeName: primaryBiome.name,
        landmark,
        creatureName: creature ? creature.name : null,
        floraStrength,
        activityLevel: localActivity + glow * 8 + (creature ? 14 : 0)
      };
    }
  }
  // ---------------------------------------------------------------------------
  // ASCII RENDERER
  // ---------------------------------------------------------------------------
  class AsciiRenderer {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext("2d", { alpha: false });
      this.cellWidth = 10;
      this.cellHeight = 16;
      this.maxCols = 170;
      this.maxRows = 62;
      this.cssWidth = 0;
      this.cssHeight = 0;

      this.cols = 0;
      this.rows = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.gridLength = 0;
      this.chars = [];
      this.colors = [];

      this.resize();
    }

    resize() {
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const compact = cssWidth < 720 || cssHeight < 520;
      this.cssWidth = cssWidth;
      this.cssHeight = cssHeight;
      this.cellWidth = compact ? 8 : 10;
      this.cellHeight = compact ? 13 : 16;

      this.canvas.width = Math.floor(cssWidth * dpr);
      this.canvas.height = Math.floor(cssHeight * dpr);
      this.canvas.style.width = `${cssWidth}px`;
      this.canvas.style.height = `${cssHeight}px`;

      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.textBaseline = "top";
      this.ctx.font = `${compact ? 12 : 14}px "Cascadia Mono", "Consolas", "Courier New", monospace`;

      const maxCols = compact ? 104 : this.maxCols;
      const maxRows = compact ? 70 : this.maxRows;
      this.cols = Math.max(1, Math.min(maxCols, Math.floor(cssWidth / this.cellWidth)));
      this.rows = Math.max(1, Math.min(maxRows, Math.floor(cssHeight / this.cellHeight)));

      this.offsetX = Math.max(0, Math.floor((cssWidth - this.cols * this.cellWidth) * 0.5));
      this.offsetY = Math.max(0, Math.floor((cssHeight - this.rows * this.cellHeight) * 0.5));

      this.gridLength = this.cols * this.rows;
      this.chars = new Array(this.gridLength).fill(" ");
      this.colors = new Array(this.gridLength).fill("rgb(0, 0, 0)");
    }

    setCell(x, y, char, colorCss) {
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
        return;
      }
      const index = y * this.cols + x;
      this.chars[index] = char;
      this.colors[index] = colorCss;
    }

    getHorizon(playerPitch) {
      // Sin mapping allows full look-up/look-down without unstable projection spikes.
      return this.rows * (0.52 + Math.sin(playerPitch) * 1.06);
    }

    renderSky(world, timeSeconds, player) {
      const horizon = this.getHorizon(player.pitch);
      const topSky = [9, 16, 27];
      const lowSkyPulse = 0.5 + 0.5 * Math.sin(timeSeconds * 0.17);
      const lowSky = [
        Math.round(26 + lowSkyPulse * 6),
        Math.round(49 + lowSkyPulse * 8),
        Math.round(43 + lowSkyPulse * 5)
      ];

      const tickX = Math.floor(timeSeconds * 1.7);
      const tickY = Math.floor(timeSeconds * 2.2);

      for (let y = 0; y < this.rows; y += 1) {
        const topRef = horizon - this.rows * 0.85;
        const t = clamp((y - topRef) / (this.rows * 0.85), 0, 1);
        const rowColor = colorToCss(mixColor(topSky, lowSky, t));
        const aboveHorizon = y <= horizon;

        for (let x = 0; x < this.cols; x += 1) {
          let char = " ";

          if (aboveHorizon) {
            const roll = world.noise.hash2i(x + tickX * 7, y * 19 + tickY);
            if (roll > 0.997) {
              char = "*";
            } else if (roll > 0.972) {
              char = ".";
            } else if (roll > 0.942 && y > horizon * 0.48) {
              char = "`";
            }
          }

          this.setCell(x, y, char, rowColor);
        }
      }
    }

    renderTerrain(world, player, timeSeconds) {
      const horizon = this.getHorizon(player.pitch);
      const verticalScale = this.rows * 1.02;
      const hazeColor = [24, 49, 48];

      for (let x = 0; x < this.cols; x += 1) {
        const rayAngle = player.yaw + ((x / (this.cols - 1)) - 0.5) * FOV;
        const rayDirX = Math.cos(rayAngle);
        const rayDirZ = Math.sin(rayAngle);

        let columnTop = this.rows;

        for (
          let dist = 2;
          dist < VIEW_DISTANCE && columnTop > 0;
          dist += 0.95 + dist * 0.035
        ) {
          const wx = player.x + rayDirX * dist;
          const wz = player.z + rayDirZ * dist;
          const tile = world.sample(wx, wz, timeSeconds);

          const relativeHeight = tile.renderHeight - player.y;
          const projectedY = Math.floor(horizon - (relativeHeight * verticalScale) / dist);

          if (projectedY >= columnTop) {
            continue;
          }

          const start = Math.max(0, projectedY);
          const end = Math.min(columnTop, this.rows);
          const fog = clamp(dist / VIEW_DISTANCE, 0, 1);
          const depthShade = 0.34 + (1 - fog) * 0.92;
          const litColor = mixColor(tile.color, hazeColor, fog * 0.86);
          const shadedColor = scaleColor(litColor, depthShade + tile.glow * 0.26);
          const colorCss = colorToCss(shadedColor);

          for (let y = start; y < end; y += 1) {
            let char = tile.char;

            if (tile.liquid) {
              if (((x + y + Math.floor(timeSeconds * 7)) & 1) === 0) {
                char = tile.altChar;
              }
            } else if (tile.glow > 0.2 && ((x + y + Math.floor(timeSeconds * 5)) % 5 === 0)) {
              char = tile.altChar;
            }

            this.setCell(x, y, char, colorCss);
          }

          columnTop = projectedY;
        }
      }
    }

    renderParticles(particles) {
      for (const particle of particles) {
        const x = Math.floor(particle.x * this.cols);
        const y = Math.floor(particle.y * this.rows);

        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
          continue;
        }

        this.setCell(x, y, particle.char, particle.colorCss);
      }
    }

    draw() {
      this.ctx.fillStyle = "rgb(4, 7, 10)";
      this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

      let lastColor = "";

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          const index = y * this.cols + x;
          const char = this.chars[index];

          if (char === " ") {
            continue;
          }

          const color = this.colors[index];
          if (color !== lastColor) {
            this.ctx.fillStyle = color;
            lastColor = color;
          }

          this.ctx.fillText(char, this.offsetX + x * this.cellWidth, this.offsetY + y * this.cellHeight);
        }
      }

      // Simple center marker for orientation.
      const crossX = this.offsetX + Math.floor(this.cols * 0.5) * this.cellWidth;
      const crossY = this.offsetY + Math.floor(this.rows * 0.53) * this.cellHeight;
      this.ctx.fillStyle = "rgb(220, 245, 230)";
      this.ctx.fillText("+", crossX, crossY);
    }

    render(world, player, timeSeconds, particles) {
      this.chars.fill(" ");
      this.colors.fill("rgb(0, 0, 0)");

      this.renderSky(world, timeSeconds, player);
      this.renderTerrain(world, player, timeSeconds);
      this.renderParticles(particles);
      this.draw();
    }
  }

  // ---------------------------------------------------------------------------
  // INPUT + GAME STATE
  // ---------------------------------------------------------------------------
  const renderer = new AsciiRenderer(canvas);
  let world = null;

  const player = {
    x: 0,
    z: 0,
    y: 26,
    yaw: 0,
    pitch: -0.06
  };

  const pressed = new Set();
  const activeMovePointers = new Map();
  const lookTouch = {
    pointerId: null,
    x: 0,
    y: 0
  };
  const discoveredBiomes = new Set();
  let particles = [];

  function rebuildParticles(seedInt) {
    const rng = createLCG(seedInt ^ 0xa5f312cd);
    const count = clamp(Math.floor((renderer.cols * renderer.rows) / 230), 20, 70);
    const fresh = [];

    for (let i = 0; i < count; i += 1) {
      const speed = 0.015 + rng() * 0.035;
      const isBright = rng() > 0.78;
      fresh.push({
        x: rng(),
        y: rng(),
        vx: (rng() - 0.5) * 0.014,
        vy: speed,
        wobble: rng() * Math.PI * 2,
        char: isBright ? "*" : ".",
        colorCss: isBright ? "rgb(170, 230, 205)" : "rgb(117, 173, 153)"
      });
    }

    particles = fresh;
  }

  const SEED_PREFIXES = ["LUMEN", "XENO", "SPORE", "OBELISK", "AETHER", "CRYPT", "MYCEL", "VAPOR", "CHORUS"];

  function scoreSeedCandidate(seedText) {
    const candidateWorld = new WorldGenerator(seedText);
    const spawnX = candidateWorld.noise.hash2i(7, 11) * 900 - 450;
    const spawnZ = candidateWorld.noise.hash2i(-13, 5) * 900 - 450;

    let minHeight = Infinity;
    let maxHeight = -Infinity;
    let liquidCount = 0;
    let activitySum = 0;
    let landmarkStrength = 0;

    const seenBiomes = new Set();
    const seenGlyphs = new Set();

    for (let ring = 1; ring <= 5; ring += 1) {
      const radius = ring * 34;
      const samples = 8 + ring * 5;

      for (let i = 0; i < samples; i += 1) {
        const angle = (i / samples) * Math.PI * 2;
        const x = spawnX + Math.cos(angle) * radius;
        const z = spawnZ + Math.sin(angle) * radius;
        const tile = candidateWorld.sample(x, z, 21.4);

        minHeight = Math.min(minHeight, tile.renderHeight);
        maxHeight = Math.max(maxHeight, tile.renderHeight);
        seenBiomes.add(tile.primaryBiomeName);
        seenGlyphs.add(tile.char);

        activitySum += tile.activityLevel + tile.floraStrength * 7;
        if (tile.liquid) {
          liquidCount += 1;
        }
        if (tile.landmark && tile.landmark.strength > 0.32) {
          landmarkStrength += tile.landmark.strength;
        }
      }
    }

    const relief = maxHeight - minHeight;
    return (
      seenBiomes.size * 42 +
      seenGlyphs.size * 5 +
      relief * 2.1 +
      liquidCount * 1.4 +
      activitySum * 0.21 +
      landmarkStrength * 40
    );
  }

  function makeInterestingSeed() {
    let bestSeed = "LUMEN-SPRAWL-7F4E2A";
    let bestScore = -Infinity;

    for (let i = 0; i < 20; i += 1) {
      const prefix = SEED_PREFIXES[i % SEED_PREFIXES.length];
      const suffix = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
      const candidate = `${prefix}-${suffix}`;
      const score = scoreSeedCandidate(candidate);

      if (score > bestScore) {
        bestScore = score;
        bestSeed = candidate;
      }
    }

    return bestSeed;
  }

  function applySeed(seedText) {
    const cleanSeed = String(seedText).trim() || makeInterestingSeed();
    seedInput.value = cleanSeed;

    world = new WorldGenerator(cleanSeed);

    // Spawn point is deterministic for each seed.
    player.x = world.noise.hash2i(7, 11) * 900 - 450;
    player.z = world.noise.hash2i(-13, 5) * 900 - 450;
    player.yaw = world.noise.hash2i(17, -19) * Math.PI * 2;
    player.pitch = -0.06;

    const spawn = world.sample(player.x, player.z, 0);
    player.y = spawn.renderHeight + CAMERA_EYE_HEIGHT;

    discoveredBiomes.clear();
    rebuildParticles(world.seedInt);

    hudSeed.textContent = world.seedText;
    hudLandmark.textContent = "None";
  }

  function updateParticles(dt, timeSeconds) {
    for (const particle of particles) {
      particle.x += particle.vx * dt * 60 + Math.sin(timeSeconds * 0.2 + particle.wobble) * 0.0007;
      particle.y += particle.vy * dt;

      if (particle.x < 0) {
        particle.x += 1;
      } else if (particle.x > 1) {
        particle.x -= 1;
      }

      if (particle.y > 1.1) {
        particle.y = -0.08;
      }
    }
  }

  function getTouchMoveVector() {
    let forward = 0;
    let right = 0;

    for (const vector of activeMovePointers.values()) {
      forward += vector.forward;
      right += vector.right;
    }

    const length = Math.hypot(forward, right);
    if (length > 1) {
      forward /= length;
      right /= length;
    }

    return { forward, right };
  }

  function updatePlayer(dt, timeSeconds) {
    const touchMove = getTouchMoveVector();
    const moveForward = clamp(
      (pressed.has("KeyW") ? 1 : 0) - (pressed.has("KeyS") ? 1 : 0) + touchMove.forward,
      -1,
      1
    );
    const moveRight = clamp(
      (pressed.has("KeyD") ? 1 : 0) - (pressed.has("KeyA") ? 1 : 0) + touchMove.right,
      -1,
      1
    );

    if (moveForward !== 0 || moveRight !== 0) {
      const inputLength = Math.hypot(moveForward, moveRight);
      const forward = moveForward / inputLength;
      const right = moveRight / inputLength;

      const speed = pressed.has("ShiftLeft") || pressed.has("ShiftRight") ? 44 : 30;
      const sin = Math.sin(player.yaw);
      const cos = Math.cos(player.yaw);

      player.x += (cos * forward - sin * right) * speed * dt;
      player.z += (sin * forward + cos * right) * speed * dt;
    }

    const groundSample = world.sample(player.x, player.z, timeSeconds);
    const targetY = groundSample.renderHeight + CAMERA_EYE_HEIGHT;
    player.y = lerp(player.y, targetY, clamp(dt * 8, 0, 1));

    discoveredBiomes.add(groundSample.primaryBiomeName);

    hudCoords.textContent = `${player.x.toFixed(1)}, ${player.z.toFixed(1)}`;
    hudBiome.textContent = `${groundSample.biomeName} (${discoveredBiomes.size}/${BIOMES.length} seen)`;
    hudLandmark.textContent =
      groundSample.landmark && groundSample.landmark.strength > 0.32
        ? groundSample.landmark.name
        : groundSample.creatureName
          ? groundSample.creatureName
        : "None";
  }

  // ---------------------------------------------------------------------------
  // EVENT WIRING
  // ---------------------------------------------------------------------------
  window.addEventListener("keydown", (event) => {
    pressed.add(event.code);

    if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight"].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    pressed.delete(event.code);
  });

  function setPanelCollapsed(collapsed) {
    uiPanel.classList.toggle("is-collapsed", collapsed);
    panelToggle.textContent = collapsed ? "Menu" : "Min";
    panelToggle.setAttribute("aria-expanded", String(!collapsed));
  }

  const mobilePanelQuery = window.matchMedia("(max-width: 700px), (pointer: coarse)");
  setPanelCollapsed(mobilePanelQuery.matches);
  if (mobilePanelQuery.addEventListener) {
    mobilePanelQuery.addEventListener("change", (event) => {
      setPanelCollapsed(event.matches);
    });
  } else if (mobilePanelQuery.addListener) {
    mobilePanelQuery.addListener((event) => {
      setPanelCollapsed(event.matches);
    });
  }

  panelToggle.addEventListener("click", () => {
    setPanelCollapsed(!uiPanel.classList.contains("is-collapsed"));
  });

  function turnPlayer(deltaX, deltaY, yawSensitivity, pitchSensitivity) {
    player.yaw += deltaX * yawSensitivity;
    if (player.yaw > Math.PI * 2) {
      player.yaw -= Math.PI * 2;
    } else if (player.yaw < 0) {
      player.yaw += Math.PI * 2;
    }

    player.pitch = clamp(player.pitch - deltaY * pitchSensitivity, -1.45, 1.45);
  }

  function clearMovePointer(pointerId) {
    const entry = activeMovePointers.get(pointerId);
    if (entry && entry.button) {
      entry.button.classList.remove("is-active");
    }
    activeMovePointers.delete(pointerId);
  }

  mobileControls.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".moveBtn");
    if (!button) {
      return;
    }

    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    button.classList.add("is-active");
    activeMovePointers.set(event.pointerId, {
      forward: Number(button.dataset.forward || 0),
      right: Number(button.dataset.right || 0),
      button
    });
  });

  mobileControls.addEventListener("pointerup", (event) => {
    clearMovePointer(event.pointerId);
  });

  mobileControls.addEventListener("pointercancel", (event) => {
    clearMovePointer(event.pointerId);
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      event.preventDefault();
      lookTouch.pointerId = event.pointerId;
      lookTouch.x = event.clientX;
      lookTouch.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      return;
    }

    if (event.button === 0 && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (lookTouch.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const dx = event.clientX - lookTouch.x;
    const dy = event.clientY - lookTouch.y;
    lookTouch.x = event.clientX;
    lookTouch.y = event.clientY;
    turnPlayer(dx, dy, 0.0042, 0.0034);
  });

  function clearLookPointer(event) {
    if (lookTouch.pointerId === event.pointerId) {
      lookTouch.pointerId = null;
    }
  }

  canvas.addEventListener("pointerup", clearLookPointer);
  canvas.addEventListener("pointercancel", clearLookPointer);

  window.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement !== canvas) {
      return;
    }

    turnPlayer(event.movementX, event.movementY, 0.0028, 0.00195);
  });

  window.addEventListener("blur", () => {
    pressed.clear();
    for (const pointerId of activeMovePointers.keys()) {
      clearMovePointer(pointerId);
    }
    lookTouch.pointerId = null;
  });

  window.addEventListener("resize", () => {
    renderer.resize();
    if (world) {
      rebuildParticles(world.seedInt);
    }
  });

  applySeedBtn.addEventListener("click", () => {
    const typed = seedInput.value.trim();
    applySeed(typed || makeInterestingSeed());
  });

  seedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const typed = seedInput.value.trim();
      applySeed(typed || makeInterestingSeed());
    }
  });

  // ---------------------------------------------------------------------------
  // MAIN LOOP
  // ---------------------------------------------------------------------------
  let previousTime = performance.now() * 0.001;

  function frame(nowMs) {
    const now = nowMs * 0.001;
    const dt = Math.min(0.05, now - previousTime);
    previousTime = now;

    if (world) {
      updatePlayer(dt, now);
      updateParticles(dt, now);
      renderer.render(world, player, now, particles);
    }

    requestAnimationFrame(frame);
  }

  // Startup
  seedInput.placeholder = "Type a custom seed, or leave blank for curated";
  applySeed(makeInterestingSeed());
  requestAnimationFrame(frame);
})();
