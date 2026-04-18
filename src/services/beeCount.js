// src/services/beeService.js
export const getBeeCount = async (imageUrl) => {
  if (!imageUrl) return 0;
  try {
    const response = await fetch(
      `https://detect.roboflow.com/bee_detection-9mugi/31?api_key=YOUR_KEY&image=${encodeURIComponent(imageUrl)}`
    );
    const result = await response.json();
    return result.predictions?.length || 0;
  } catch (err) {
    console.error("IA Error:", err);
    return 0;
  }
};