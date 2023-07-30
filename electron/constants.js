//TODO: WHEN CHANGING THIS VARIABLE, DO NOT CHANGE THE IDs
const voices = [
  {
    id: 1,
    img: { src: "/zeus.webp", alt: "Voice: Zeus" },
    name: "Zeus",
    isBase: true,
  },

  {
    id: 2,
    img: { src: "/scarlett.webp", alt: "Voice: Scarlett" },
    name: "Scarlett",
    isBase: true,
  },

  {
    id: 3,
    img: { src: "/eva.webp", alt: "Voice: Eva" },
    name: "Eva",
    isBase: true,
  },

  {
    id: 4,
    img: { src: "/yara.webp", alt: "Voice: Yara" },
    name: "Yara",
    isBase: true,
  },

  {
    id: 5,
    img: { src: undefined, alt: "Voice: Blake" },
    name: "Blake",
    isBase: true,
  },

  {
    id: 6,
    img: { src: "/dex.webp", alt: "Voice: Dex" },
    name: "Dex",
    isPremium: true,
    isBase: true,
  },

  {
    id: 7,
    img: { src: "/aurora.webp", alt: "Voice: Aurora" },
    name: "Aurora",
    isPremium: true,
    isBase: true,
  },

  {
    id: 8,
    img: { src: "/elijah.webp", alt: "Voice: Elijah" },
    name: "Elijah",
    isPremium: true,
    isBase: true,
  },

  {
    id: 9,
    img: { src: "/alex.webp", alt: "Voice: Alex" },
    name: "Alex",
    isPremium: true,
    isBase: true,
  },
];

const baseVoices = voices.map((voice) => {
  return { isBase: true, ...voice };
});

const BASE_SERVER_URL = "http://localhost:58000";
const defaultUpdatePath = "%localappdata%/MetaVoice";

module.exports = { baseVoices, BASE_SERVER_URL, defaultUpdatePath };
