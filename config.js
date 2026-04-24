// ============================================================
// JOYLEAF DASHBOARD CONFIG
// ============================================================
// Fill in your API keys once. These never change.
// Keep this file private - do not share publicly.
// ============================================================

const CONFIG = {

  // GOOGLE BUSINESS PROFILE API
  // Get from: console.cloud.google.com
  // Instructions: Ask FLP for setup guide
  google_api_key: "YOUR_GOOGLE_API_KEY_HERE",
  google_place_id: "YOUR_JOYLEAF_PLACE_ID_HERE",  // Find at: https://developers.google.com/maps/documentation/places/web-service/place-id

  // GOOGLE ANALYTICS 4
  // Get from: Google Analytics > Admin > Data Streams
  ga4_measurement_id: "YOUR_GA4_MEASUREMENT_ID_HERE",

  // DASHBOARD SETTINGS
  auto_refresh: false,   // Set to true once Google API is connected
  refresh_interval: 86400000,  // 24 hours in milliseconds

};
