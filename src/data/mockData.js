export const MOCK_DATA = {
  history: [
    { time: '08:00', temp: 32, hum: 60, weight: 45.0 },
    { time: '10:00', temp: 33.5, hum: 58, weight: 45.2 },
    // ... suite des données
  ]
};

// src/data/mockData.js

export const HIVES_LIST = [
  { id: 1, name: "Ruche Alpha", status: "online", temp: 34.2, humidity: 62, weight: 42.5, battery: 85, lastUpdate: "Il y a 5 min" },
  { id: 2, name: "Ruche Beta", status: "online", temp: 33.8, humidity: 65, weight: 38.2, battery: 92, lastUpdate: "Il y a 12 min" },
  { id: 3, name: "Ruche Gamma", status: "warning", temp: 31.5, humidity: 72, weight: 35.0, battery: 15, lastUpdate: "Il y a 1h" },
];

export const CHART_DATA = [
  { time: '08:00', temp: 32, humidity: 60, weight: 40 },
  { time: '10:00', temp: 33, humidity: 62, weight: 40.2 },
  { time: '12:00', temp: 35, humidity: 58, weight: 40.5 },
  { time: '14:00', temp: 36, humidity: 55, weight: 40.8 },
  { time: '16:00', temp: 34, humidity: 59, weight: 41.2 },
  { time: '18:00', temp: 33, humidity: 63, weight: 41.5 },
];
