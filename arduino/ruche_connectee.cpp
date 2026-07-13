#include <WiFi.h>              
#include <WiFiClientSecure.h> 
#include <HTTPClient.h>
#include "DHT.h"
#include "HX711.h"
#include "esp_sleep.h"

// --- MÉMOIRE RTC (Conservation de la tare après le sommeil) ---
RTC_DATA_ATTR bool isTared = false; 
RTC_DATA_ATTR float tareOffsets[4] = {0, 0, 0, 0}; 

// ---------------- CONFIGURATION RÉSEAU & API ----------------
const char* ssid = "Airbox_5111";
const char* password = "Eae4i72ih93R";
const char* hive_id = "c570d3f8-1cc4-4f2d-92c2-06a82962eb46";
const char* supabase_url = "https://ogciwrvnyrbokcrxdwid.supabase.co/rest/v1/measurements";
const char* supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nY2l3cnZueXJib2tjcnhkd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTAyNzQsImV4cCI6MjA4MzA4NjI3NH0.SF1dx5QHPaqin9__NMW3d0zREl-TLFY5N95SwV16t-I";

// ---------------- FACTEURS DE CALIBRAGE INDIVIDUELS ----------------
const float CALIB_FACTORS[4] = {100.0, 103.5, 102.0, 102.5}; // C1, C2, C3, C4

// ---------------- PARAMÈTRES DE CORRECTION D'ERREUR ----------------
// Utilise ici les coefficients que nous avons ajustés ensemble
const float COEFF_A = 0.1753; 
const float COEFF_B = -10.832;

// ---------------- MATÉRIEL (PINS) ----------------
#define DHTPIN_INT 27
#define DHTPIN_EXT 14
#define DHTTYPE DHT11
DHT dht_int(DHTPIN_INT, DHTTYPE);
DHT dht_ext(DHTPIN_EXT, DHTTYPE);

#define HX711_SCK_GLOBAL 22 
#define DOUT_1 18
#define DOUT_2 19
#define DOUT_3 13
#define DOUT_4 12

HX711 scale1, scale2, scale3, scale4;
HX711* allScales[] = {&scale1, &scale2, &scale3, &scale4};

// Fonction de sécurité pour le JSON (évite les erreurs 400 si nan)
String formatVal(float val) {
  if (isnan(val)) return "0.0";
  return String(val, 2);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== SYSTÈME RUCHE COMPLET : CALIBRAGE INDIVIDUEL ===");

  dht_int.begin();
  dht_ext.begin();

  scale1.begin(DOUT_1, HX711_SCK_GLOBAL); 
  scale2.begin(DOUT_2, HX711_SCK_GLOBAL); 
  scale3.begin(DOUT_3, HX711_SCK_GLOBAL); 
  scale4.begin(DOUT_4, HX711_SCK_GLOBAL);

  // --- GESTION DE LA TARE ---
  if (!isTared) {
    Serial.println("Initialisation de la tare...");
    for (int i = 0; i < 4; i++) {
      allScales[i]->set_scale(CALIB_FACTORS[i]);
      allScales[i]->tare();
      tareOffsets[i] = allScales[i]->get_offset();
    }
    isTared = true;
    Serial.println("✅ Tare sauvegardée.");
  } else {
    for (int i = 0; i < 4; i++) {
      allScales[i]->set_scale(CALIB_FACTORS[i]);
      allScales[i]->set_offset(tareOffsets[i]);
    }
    Serial.println("🔄 Offsets de tare restaurés.");
  }

  // --- MESURES DE POIDS ---
  float somme_brute = 0;
  for (int i = 0; i < 4; i++) {
    float lecture = allScales[i]->get_units(20); // Moyenne de 20 lectures
    somme_brute += lecture;
    Serial.printf("Pied %d : %.1f g\n", i+1, lecture);
  }

  // Application de ta logique : Soustraction de l'erreur
  float erreur = (somme_brute * COEFF_A) + COEFF_B;
  float poids_corrige_g = somme_brute - erreur;
  
  if (poids_corrige_g < 0) poids_corrige_g = 0;
  float poids_final_kg = poids_corrige_g / 1000.0;

  Serial.printf("> SOMME BRUTE : %.1f g\n", somme_brute);
  Serial.printf("> ERREUR ESTIMÉE : %.1f g\n", erreur);
  Serial.printf("> POIDS FINAL : %.3f kg\n", poids_final_kg);

  // --- MESURES ENVIRONNEMENT ---
  float ti = dht_int.readTemperature();
  float hi = dht_int.readHumidity();
  float te = dht_ext.readTemperature();
  float he = dht_ext.readHumidity();
  Serial.printf("Temp Int: %s°C | Hum Ext: %s%%\n", formatVal(ti).c_str(), formatVal(he).c_str());

  // --- CONNEXION ET ENVOI ---
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) { delay(500); retry++; }

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, supabase_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", "Bearer " + String(supabase_key));

    String json = "{";
    json += "\"hive_id\":\"" + String(hive_id) + "\",";
    json += "\"temp_int\":" + formatVal(ti) + ",\"hum_int\":" + formatVal(hi) + ",";
    json += "\"temp_ext\":" + formatVal(te) + ",\"hum_ext\":" + formatVal(he) + ",";
    json += "\"weight\":" + String(poids_final_kg, 3) + ",\"battery\":100";
    json += "}";

    int httpCode = http.POST(json);
    Serial.printf("HTTP Supabase : %d\n", httpCode);
    http.end();
  } else {
    Serial.println("❌ Échec WiFi");
  }

  // --- MISE EN VEILLE ---
  Serial.println("😴 Sommeil profond...");
  Serial.flush();
  esp_sleep_enable_timer_wakeup(60 * 60 * 1000000ULL); 
  esp_deep_sleep_start();
}

void loop() {}