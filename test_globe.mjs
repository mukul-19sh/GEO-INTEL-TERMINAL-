import Globe from 'globe.gl';

const globe = Globe()();
console.log("Has heatmapsData?", typeof globe.heatmapsData === 'function');
console.log("Has ringsData?", typeof globe.ringsData === 'function');
console.log("Has hexBinPointsData?", typeof globe.hexBinPointsData === 'function');
process.exit(0);
