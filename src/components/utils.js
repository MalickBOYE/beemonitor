// utils.js
export const geocodeAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'BeeHiveApp/1.0' }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      // ON RE-MAPPE ICI : On transforme 'lat' en 'latitude'
      return {
        latitude: parseFloat(data[0].lat), 
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur de géocodage:", error);
    return null;
  }
};