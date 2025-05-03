/*
 * MPUrawgpssdcard with GSM MQTT and bulk data transmission
 * Modified version that replaces WiFi with GSM and optimizes for bulk data transmission
 */

// GSM Configuration
#define TINY_GSM_MODEM_SIM7600  // Modem is SIM7600
#include <TinyGsmClient.h>
#include <SSLClient.h>
#include <HardwareSerial.h>
#include <Wire.h>
#include <SD.h>
#include <SPI.h>
#include <TinyGPS++.h>
#include "MPU6050_6Axis_MotionApps20.h"
#include "I2Cdev.h"
#define MQTT_MAX_PACKET_SIZE 20000  
#include <PubSubClient.h>  // MQTT library
#include "ca_cert.h"        // Using the existing CA certificate file
#include <TFT_eSPI.h>              // Graphics and font library


// Device identification
const String DEVICE_NAME = "DBAS-001"; // Unique identifier for this device

// MQTT Server credentials
const char* mqtt_server = "af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // Use 8883 for TLS
const char* mqtt_topic = "data";
const char* mqtt_username = "team22";
const char* mqtt_password = "KauKau123";


// Accident detection variables
float accMagnitude = 0;  // Acceleration magnitude
int accidentCounter = 0;  // Counter for consecutive accident readings
const int ACCIDENT_CONFIRM_COUNT = 3;  // Number of consecutive readings needed to confirm an accident
// GSM Modem configuration

#define MODEM_UART_BAUD 115200
#define MODEM_TX 27
#define MODEM_RX 25
#define MODEM_PWRKEY 12

// GPRS credentials
const char apn[] = "jawalnet.com.sa";  // Your APN
const char gprs_user[] = "";          // User
const char gprs_pass[] = "";          // Password
const char simPIN[] = "";             // SIM card PIN code, if any

// Hardware Defines
#define RX_PIN 16  
#define TX_PIN 17  
#define CS_PIN 5

// Update intervals
#define WRITE_INTERVAL 2000
#define MQTT_INTERVAL  100
#define BULK_DATA_SIZE 10

// Hardware Defines
#define RX_PIN 16  
#define TX_PIN 17  
#define CS_PIN 5


// Add this instead:
TFT_eSPI display = TFT_eSPI();     // Create display object

volatile bool updateDisplay = false;

// Sensor objects
HardwareSerial GPS(2);  
MPU6050 mpu;
TinyGPSPlus gps;
File dataFile;

// IMU DMP variables
bool dmpReady = false;
uint8_t devStatus;
uint16_t packetSize;
uint8_t fifoBuffer[1024];  // FIFO storage
Quaternion quat;
VectorFloat gravity;
float ypr[3];

// Data variables
int16_t ax, ay, az;
int16_t gx, gy, gz;
String nmeaLine = "";
String timeG = "";
String latitude = "";
String longitude = "";
float speedKmh = 0.0;
unsigned long lastWriteTime = 0;
unsigned long dataWriteCounter = 0;
unsigned long lastMQTTTime = 0;

// GSM and MQTT objects
#define SerialAT Serial1
TinyGsm modem(SerialAT);     // Use SerialAT instead of Serial1
TinyGsmClient gsmClient(modem);
SSLClient secureClient(&gsmClient);
PubSubClient client(secureClient);

// Buffer size limits

const size_t MAX_MQTT_BUFFER_SIZE = 800000;  
const size_t MAX_SD_BUFFER_SIZE = 40000;   

// Overflow counters
unsigned long mqttBufferOverflowCount = 0;
unsigned long sdCardBufferOverflowCount = 0;

// GPS formatting functions
String formatGPS(String coord, int length) {
  String degrees = coord.substring(0, length);
  String minutes = coord.substring(length);
  float formattedCoord = degrees.toInt() + (minutes.toFloat() / 60.0);
  return String(formattedCoord, 6);
}

void parseNMEA(String line) {
  if (line.startsWith("$GNGGA")) {
    int idx1 = 0, idx2 = 0, fieldCount = 0;
    
    while ((idx2 = line.indexOf(',', idx1)) != -1) {
      String field = line.substring(idx1, idx2);
      switch(fieldCount) {
        case 1:
          timeG = field;
          break;
        case 2:
          latitude = field;
          break;
        case 4:
          longitude = field;
          break;
      }
      fieldCount++;
      idx1 = idx2 + 1;
    }

    String formattedLat = formatGPS(latitude, 2);
    String formattedLon = formatGPS(longitude, 3);

    int hours = timeG.substring(0, 2).toInt() + 3;
    if (hours >= 24) hours -= 24;
    
    char formattedTime[20];
    sprintf(formattedTime, "%02d:%02d:%02d.%03d",
            hours,
            timeG.substring(2, 4).toInt(),
            timeG.substring(4, 6).toInt(),
            (timeG.length() > 6) ? timeG.substring(7).toInt() : 0);
    
    timeG = formattedTime;
    latitude = formattedLat;
    longitude = formattedLon;
  } else if (line.startsWith("$GNVTG")) {
    int idx1 = 0, idx2 = 0, fieldCount = 0;
    
    while ((idx2 = line.indexOf(',', idx1)) != -1) {
      String field = line.substring(idx1, idx2);
      if (fieldCount == 7) speedKmh = field.toFloat();
      fieldCount++;
      idx1 = idx2 + 1;
    }
  }
}

// GSM Modem functions
void turnModemOn() {
  pinMode(MODEM_PWRKEY, OUTPUT);
  digitalWrite(MODEM_PWRKEY, LOW);
  delay(1000); // Datasheet Ton minutes = 1S
  digitalWrite(MODEM_PWRKEY, HIGH);
}

void turnModemOff() {
  digitalWrite(MODEM_PWRKEY, LOW);
  delay(1500); // Datasheet Ton minutes = 1.2S
  digitalWrite(MODEM_PWRKEY, HIGH);
}

void setupModem() {
  pinMode(MODEM_PWRKEY, OUTPUT);
  
  Serial.println("Initializing modem...");
  turnModemOff();
  delay(1000);
  turnModemOn();
  delay(5000);
  
  SerialAT.begin(MODEM_UART_BAUD, SERIAL_8N1, MODEM_RX, MODEM_TX);
  delay(3000);
  
  Serial.print("Modem init...");
  if (!modem.init()) {
    Serial.println("failed. Restarting modem...");
    turnModemOff();
    delay(1000);
    turnModemOn();
    delay(5000);
    if (!modem.restart()) {
      Serial.println("Modem restart failed!");
      return;
    }
  }
  Serial.println("OK");
  
  String name = modem.getModemName();
  Serial.println("Modem Name: " + name);
  
  Serial.print("Waiting for network...");
  if (!modem.waitForNetwork()) {
    Serial.println("fail!");
    return;
  }
  Serial.println("OK");
  
  Serial.print("Connecting to APN: " + String(apn));
  if (!modem.gprsConnect(apn, gprs_user, gprs_pass)) {
    Serial.println("fail!");
    return;
  }
  Serial.println("OK");
  
}

// Simplified MQTT reconnect function (publishing only)
void reconnect() {
  int retries = 0;
  while (!client.connected() && retries < 5) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-" + String(random(0xffff));
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      
      // Add debug publish to verify connection
      client.publish("debug", "ESP32 connected");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      // Print more detailed error information
      switch(client.state()) {
        case -4: Serial.println(" (MQTT_CONNECTION_TIMEOUT)"); break;
        case -3: Serial.println(" (MQTT_CONNECTION_LOST)"); break;
        case -2: Serial.println(" (MQTT_CONNECT_FAILED)"); break;
        case -1: Serial.println(" (MQTT_DISCONNECTED)"); break;
        case 1: Serial.println(" (MQTT_CONNECT_BAD_PROTOCOL)"); break;
        case 2: Serial.println(" (MQTT_CONNECT_BAD_CLIENT_ID)"); break;
        case 3: Serial.println(" (MQTT_CONNECT_UNAVAILABLE)"); break;
        case 4: Serial.println(" (MQTT_CONNECT_BAD_CREDENTIALS)"); break;
        case 5: Serial.println(" (MQTT_CONNECT_UNAUTHORIZED)"); break;
        default: Serial.println(" (unknown error)");
      }
      delay(5000);
      retries++;
    }
  }
}
// Function to play a TTS message
void playTTSMessage(const String& message) {
  Serial.println("Playing TTS message: " + message);

  // Set TTS parameters (optional, adjust as needed)
  SerialAT.println("AT+CTTSPARAM=2,3,0,1,1");  // Example: max volume, normal tone, normal speed
  if (waitForResponse(5000)) {
    Serial.println("TTS parameters set successfully.");
  } else {
    Serial.println("Failed to set TTS parameters.");
  }

  // Play the TTS message
  SerialAT.print("AT+CTTS=2,\"");
  SerialAT.print(message);
  SerialAT.println("\"");  // Mode 2: ASCII text
  if (waitForResponse(10000)) {
    Serial.println("TTS message played successfully.");
  } else {
    Serial.println("Failed to play TTS message.");
  }
}
// Minimal callback function (not used but required by PubSubClient)
void callback(char* topic, byte* payload, unsigned int length) {
  // We're not subscribing to any topics, so this function is minimized
}

// FreeRTOS handles
TaskHandle_t sensorTaskHandle;
TaskHandle_t mqttTaskHandle;
TaskHandle_t sdCardTaskHandle;
TaskHandle_t displayTaskHandle;
SemaphoreHandle_t dataMutex;


// Use these fixed arrays instead
#define MQTT_BUFFER_SIZE 20000
char mqttBuffer[MQTT_BUFFER_SIZE];
size_t mqttBufferIndex = 0;

#define SD_BUFFER_SIZE 20000
char sdCardBuffer[SD_BUFFER_SIZE];
size_t sdCardBufferIndex = 0;

// Define the BOOT button pin
#define BOOT_BUTTON 0  // ESP32 WROOM32D BOOT button is GPIO 0

// Add variables for accident confirmation
volatile bool accidentConfirmed = false;
volatile bool accidentDetected = false;
unsigned long accidentStartTime = 0;
const unsigned long ACCIDENT_RESPONSE_TIME = 30000;  // 30 seconds
const char* emergencyNumber = "0565151278";  // Emergency contact number

volatile unsigned long lastInterruptTime = 0;

const unsigned long ACCIDENT_COOLDOWN_TIME = 60000;  // 1 minute cooldown
unsigned long lastAccidentTime = 0;

volatile bool isEmergencyCallActive = false;  // Flag to indicate if an emergency call is active

// Function to handle the BOOT button press
void IRAM_ATTR handleBootButtonPress() {
  unsigned long interruptTime = millis();
  if (interruptTime - lastInterruptTime > 200) {  // 200ms debounce
    accidentConfirmed = true;  // Mark the driver as safe
  }
  lastInterruptTime = interruptTime;
}

// Function to make an emergency call with TTS
void makeEmergencyCall() {
  Serial.println("Making emergency call...");
  isEmergencyCallActive = true;  // Mark the emergency call as active

  if (latitude.isEmpty() || longitude.isEmpty()) {
    Serial.println("Invalid GPS data. Skipping emergency call.");
    isEmergencyCallActive = false;  // Reset the flag
    return;
  }

  // Dial the emergency number
  SerialAT.print("ATD");
  SerialAT.print(emergencyNumber);
  SerialAT.println(";");
  if (waitForResponse(10000)) {  // Wait for call initiation
    Serial.println("Call initiated. Waiting for connection...");
    delay(5000);  // Wait for the call to connect

    // Set TTS play path to remote (over the call)
    SerialAT.println("AT+CDTAM=1");
    if (waitForResponse(5000)) {
      Serial.println("TTS play path set to remote.");
    } else {
      Serial.println("Failed to set TTS play path.");
    }

    // Play TTS message
    playTTSMessage("There was an accident. The driver is not responding. Please send help. Location: Latitude " + latitude + ", Longitude " + longitude);

    // Hang up the call
    SerialAT.println("ATH");
    waitForResponse(5000);  // Wait for hang-up confirmation
    Serial.println("Call ended.");
  } else {
    Serial.println("Failed to initiate the call.");
  }

  isEmergencyCallActive = false;  // Reset the flag after the call ends
}

void makeEmergencyCallWithRetries() {
  int callRetries = 0;
  const int MAX_CALL_RETRIES = 3;

  while (callRetries < MAX_CALL_RETRIES) {
    makeEmergencyCall();
    if (waitForResponse(10000)) {
      break;  // Call succeeded
    }
    callRetries++;
    delay(5000);  // Wait before retrying
  }

  if (callRetries == MAX_CALL_RETRIES) {
    Serial.println("Emergency call failed after multiple attempts.");
  }
}

// Global variables for GPS updates (remove volatile)
String globalTimeG = "";
String globalLatitude = "";
String globalLongitude = "";
float globalSpeedKmh = 0.0;

// Task for GPS data handling
void gpsTask(void *parameter) {
  while (true) {
    while (GPS.available() > 0) {
      char c = GPS.read();
      if (c == '\n') {
        parseNMEA(nmeaLine);
        Serial.println("GPS data available");
        // Directly update global variables without mutex
        globalTimeG = timeG;
        globalLatitude = latitude;
        globalLongitude = longitude;
        globalSpeedKmh = speedKmh;

        nmeaLine = "";
      } else {
        nmeaLine += c;
      }

      // Add a small delay to prevent blocking
      vTaskDelay(1 / portTICK_PERIOD_MS);
    }

    // Yield to other tasks
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// Task for MPU data handling
void mpuTask(void *parameter) {
  while (true) {
    // Read data from MPU6050
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    if (dmpReady && mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) {
      mpu.dmpGetQuaternion(&quat, fifoBuffer);
      mpu.dmpGetGravity(&gravity, &quat);
      mpu.dmpGetYawPitchRoll(ypr, &quat, &gravity);
      Serial.println("entered the dmp loop");

      // Accident indicator: 1 if accidentDetected, 0 otherwise
      int accidentIndicator = accidentDetected ? 1 : 0;

      // Create data line using global GPS variables
      char dataLine[256]; // Fixed buffer for data line
      int lineLength = snprintf(dataLine, sizeof(dataLine), 
        "%s,%lu,%s,%s,%s,%.2f,%d,%d,%d,%.2f,%d\n",
        DEVICE_NAME.c_str(), dataWriteCounter++, 
        globalTimeG.c_str(), globalLatitude.c_str(), 
        globalLongitude.c_str(), globalSpeedKmh,
        ax, ay, az, 
        ypr[0] * 180/M_PI, // Yaw only
        accidentIndicator   // 1 for accident, 0 for no accident
      );

      // Take mutex with timeout instead of MAX_DELAY
      if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(500))) {
        // Check MQTT buffer size
        if (mqttBufferIndex + lineLength >= MQTT_BUFFER_SIZE) {
          mqttBufferOverflowCount++;
          Serial.println("MQTT buffer overflow! Resetting buffer.");
          mqttBufferIndex = 0; // Reset buffer instead of trying to salvage partial data
        }
        
        // Copy data into buffer directly - no String operations
        memcpy(&mqttBuffer[mqttBufferIndex], dataLine, lineLength);
        mqttBufferIndex += lineLength;
        
        // Similar approach for SD card buffer
        if (sdCardBufferIndex + lineLength >= SD_BUFFER_SIZE) {
          sdCardBufferOverflowCount++;
          Serial.println("SD buffer overflow! Resetting buffer.");
          sdCardBufferIndex = 0;
        }
        
        memcpy(&sdCardBuffer[sdCardBufferIndex], dataLine, lineLength);
        sdCardBufferIndex += lineLength;
        
        xSemaphoreGive(dataMutex);
      }
    } else if (mpu.getIntStatus() & 0x10) {  // Check overflow flag
      Serial.println("FIFO overflow! Resetting...");
      mpu.resetFIFO();  // Reset the FIFO
      continue; // Skip this iteration but stay in the task
    }

    vTaskDelay(30 / portTICK_PERIOD_MS);  // Run at ~20Hz
  }
}
// Revised MQTT task to send entire buffer at once
void mqttTask(void *parameter) {
  unsigned long lastConnectionCheck = 0;
  int failedPublishCount = 0;
  
  while (true) {
    // Check if an emergency call is active
    if (isEmergencyCallActive) {
      vTaskDelay(1000 / portTICK_PERIOD_MS);
      continue;
    }

    unsigned long currentMillis = millis();

    // More frequent connection checks when publishing fails
    if (failedPublishCount > 3 || currentMillis - lastConnectionCheck > 60000) {
      lastConnectionCheck = currentMillis;
      failedPublishCount = 0;
      
      Serial.print("Checking network status... ");
      if (!modem.isNetworkConnected()) {
        Serial.println("Network disconnected! Waiting for network...");
        if (!modem.waitForNetwork(60000L)) {
          Serial.println("Network reconnection failed");
          continue;
        }
      }
      
      Serial.print("Checking GPRS status... ");
      if (!modem.isGprsConnected()) {
        Serial.println("GPRS disconnected. Reconnecting...");
        if (!modem.gprsConnect(apn, gprs_user, gprs_pass)) {
          Serial.println("GPRS reconnection failed");
          continue;
        }
      }
      
      int csq = modem.getSignalQuality();
      Serial.println("Signal quality: " + String(csq));
    }

    if (!client.connected()) {
      reconnect();
    }
    client.loop();

    // Use a timeout for mutex taking
    if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(500))) {
      if (mqttBufferIndex > 0 &&
          (mqttBufferIndex >= BULK_DATA_SIZE || currentMillis - lastMQTTTime >= MQTT_INTERVAL)) {
          
        // Must add null terminator for C-string
        mqttBuffer[mqttBufferIndex] = '\0';

        // Count lines for logging
        int totalLines = 0;
        for (size_t i = 0; i < mqttBufferIndex; i++) {
          if (mqttBuffer[i] == '\n') totalLines++;
        }

        Serial.println("Attempting to publish " + String(totalLines) + 
                       " lines of data (" + String(mqttBufferIndex) + " bytes)");
                       
        // Try publishing with more detailed error handling
        boolean published = client.publish(mqtt_topic, mqttBuffer);

        if (published) {
          Serial.println("Successfully published data");
          mqttBufferIndex = 0;  // Reset buffer after successful publish
          failedPublishCount = 0;
        } else {
          failedPublishCount++;
          Serial.println("Failed to publish data - error code: " + String(client.state()));
          
          // Force reconnect on repeated failures
          if (failedPublishCount >= 3) {
            Serial.println("Multiple publish failures - forcing reconnection");
            client.disconnect();
          }
        }
        
        lastMQTTTime = currentMillis;
      }
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

void sdCardTask(void *parameter) {
  while (true) {
    // Protect SD card buffer with mutex
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (sdCardBufferIndex > 0) {
        dataFile = SD.open("/datalog.csv", FILE_APPEND);
        if (dataFile) {
          // Add the cast to uint8_t* here
          dataFile.write(reinterpret_cast<const uint8_t*>(sdCardBuffer), sdCardBufferIndex);
          dataFile.close();
          Serial.println("Data written to SD card.");
          sdCardBufferIndex = 0;  // Clear SD card buffer after writing
        } else {
          Serial.println("Failed to write data to SD card. Retaining data in buffer.");
        }
      }
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

void displayTask(void *parameter) {
  bool accident_enter = false;  // Track if the accident screen is active

  while (true) {
    if (updateDisplay && !accident_enter) {
      // Enter accident warning screen
      accident_enter = true;
      drawWarningScreen();
    } else if (!updateDisplay && accident_enter) {
      // Return to normal system OK screen
      accident_enter = false;
      drawSystemOkScreen();
    }

    if (!accidentDetected && !updateDisplay) {
        drawSystemOkScreen();
    }

    vTaskDelay(3000 / portTICK_PERIOD_MS);  // Check every 500ms
  }
}

// Enhanced warning screen with decorations
void drawWarningScreen() {
  // Animated warning effect
  for (int i = 0; i < 3; i++) {
    display.fillScreen(TFT_RED);
    vTaskDelay(100 / portTICK_PERIOD_MS);
    display.fillScreen(TFT_BLACK);
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
  
  // Set main background
  display.fillScreen(TFT_BLACK);
  
  // Draw warning triangles - shifted 30px right
  display.fillTriangle(60, 60, 130, 30, 200, 60, TFT_YELLOW);
  display.fillTriangle(60, 60, 130, 90, 200, 60, TFT_YELLOW);
  
  // Draw exclamation mark - shifted 30px right
  display.fillRect(125, 40, 10, 30, TFT_RED);
  display.fillCircle(130, 80, 5, TFT_RED);
  
  // Draw decorative borders
  for (int i = 0; i < 10; i += 3) {
    display.drawRect(i, i, 400-i*2, 400-i*2, TFT_RED);
  }
  
  // Set text properties - larger and more prominent
  display.setTextSize(4);
  display.setTextColor(TFT_WHITE, TFT_RED);
  
  // Create text background for better readability - shifted 30px right
  display.fillRoundRect(50, 120, 200, 50, 10, TFT_RED);
  display.fillRoundRect(70, 180, 160, 50, 10, TFT_RED);
  
  // Draw text - shifted 30px right
  display.setCursor(60, 130);
  display.print("ARE YOU");
  display.setCursor(80, 190);
  display.print("OKAY?");
}

// Enhanced system OK screen with decorations
void drawSystemOkScreen() {
  // Start with clean background
  display.fillScreen(TFT_BLUE);
  
  // Draw decorative circular border - shifted 30px right
  for (int r = 190; r >= 180; r--) {
    display.drawCircle(130, 100, r, TFT_CYAN);
  }
  
  // Add gradient background effect with concentric circles - shifted 30px right
  for (int r = 170; r > 0; r -= 15) {
    uint16_t color;
    if (r > 120) color = TFT_BLUE;
    else if (r > 60) color = TFT_WHITE;
    else color = TFT_BLUE;
    display.fillCircle(130, 100, r, color);
  }
  
  // Draw DBAS system logo - shifted 30px right
  display.fillTriangle(100, 40, 130, 20, 160, 40, TFT_CYAN);
  display.fillRoundRect(105, 40, 50, 30, 5, TFT_CYAN);
  
  // Draw decorative lines
  for (int i = 0; i < 400; i += 20) {
    display.drawLine(0, i, i, 0, TFT_BLUE);
    display.drawLine(400-i, 0, 400, i, TFT_BLUE);
  }
  
  // Draw status box with shadow effect - shifted 30px right
  display.fillRoundRect(55, 115, 155, 50, 10, TFT_DARKGREEN);
  display.fillRoundRect(50, 110, 155, 50, 10, TFT_GREEN);
  
  // Draw text with better contrast - changed from "SYSTEM OK" to "AWAKE"
  display.setTextSize(3);
  display.setTextColor(TFT_BLACK);
  display.setCursor(70, 122);
  display.print("AWAKE");
  
  // Draw DBAS text at bottom - shifted 30px right
  display.setTextSize(2);
  display.setTextColor(TFT_WHITE);
  display.setCursor(40, 200);
  display.print("DBAS ACTIVE");
}

void handleAccidentFlow() {
  if (accidentDetected) {
    if (accidentConfirmed) {
      // Driver confirmed they are safe
      Serial.println("Driver confirmed safe.");
      accidentDetected = false;  // Reset accident state
      accidentConfirmed = false;  // Reset confirmation state
      showNormalScreen();  // Show the normal screen
    } else if (millis() - accidentStartTime > ACCIDENT_RESPONSE_TIME) {
      // No response from the driver within the response time
      Serial.println("No response from driver. Initiating emergency call...");
      makeEmergencyCall();
      accidentDetected = false;  // Reset accident state
      showNormalScreen();  // Show the normal screen after the call
    }
  } else if (accidentCounter >= ACCIDENT_CONFIRM_COUNT) {
    // Accident detected based on sensor readings
    Serial.println("ACCIDENT DETECTED! Magnitude: " + String(accMagnitude) + "G");
    showEmergencyScreen();  // Show the emergency screen
    accidentDetected = true;
    accidentStartTime = millis();  // Start the 30-second timer
    accidentCounter = 0;  // Reset counter
  }
}

// Function to show the normal system OK screen
void showNormalScreen() {
  // Start with a clean background
  display.fillScreen(TFT_BLUE);

  // Draw decorative circular border
  for (int r = 190; r >= 180; r--) {
    display.drawCircle(130, 100, r, TFT_CYAN);
  }

  // Add gradient background effect with concentric circles
  for (int r = 170; r > 0; r -= 15) {
    uint16_t color;
    if (r > 120) color = TFT_BLUE;
    else if (r > 60) color = TFT_WHITE;
    else color = TFT_BLUE;
    display.fillCircle(130, 100, r, color);
  }

  // Draw DBAS system logo
  display.fillTriangle(100, 40, 130, 20, 160, 40, TFT_CYAN);
  display.fillRoundRect(105, 40, 50, 30, 5, TFT_CYAN);

  // Draw decorative lines
  for (int i = 0; i < 400; i += 20) {
    display.drawLine(0, i, i, 0, TFT_BLUE);
    display.drawLine(400 - i, 0, 400, i, TFT_BLUE);
  }

  // Draw status box with shadow effect
  display.fillRoundRect(55, 115, 155, 50, 10, TFT_DARKGREEN);
  display.fillRoundRect(50, 110, 155, 50, 10, TFT_GREEN);

  // Draw text with better contrast
  display.setTextSize(3);
  display.setTextColor(TFT_BLACK);
  display.setCursor(70, 122);
  display.print("AWAKE");

  // Draw DBAS text at the bottom
  display.setTextSize(2);
  display.setTextColor(TFT_WHITE);
  display.setCursor(40, 200);
  display.print("DBAS ACTIVE");
}

// Function to show the emergency warning screen
void showEmergencyScreen() {
  // Animated warning effect
  for (int i = 0; i < 3; i++) {
    display.fillScreen(TFT_RED);
    delay(100);
    display.fillScreen(TFT_BLACK);
    delay(100);
  }

  // Set main background
  display.fillScreen(TFT_BLACK);

  // Draw warning triangles
  display.fillTriangle(60, 60, 130, 30, 200, 60, TFT_YELLOW);
  display.fillTriangle(60, 60, 130, 90, 200, 60, TFT_YELLOW);

  // Draw exclamation mark
  display.fillRect(125, 40, 10, 30, TFT_RED);
  display.fillCircle(130, 80, 5, TFT_RED);

  // Draw decorative borders
  for (int i = 0; i < 10; i += 3) {
    display.drawRect(i, i, 400 - i * 2, 400 - i * 2, TFT_RED);
  }

  // Set text properties
  display.setTextSize(4);
  display.setTextColor(TFT_WHITE, TFT_RED);

  // Create text background for better readability
  display.fillRoundRect(50, 120, 200, 50, 10, TFT_RED);
  display.fillRoundRect(70, 180, 160, 50, 10, TFT_RED);

  // Draw text
  display.setCursor(60, 130);
  display.print("ARE YOU");
  display.setCursor(80, 190);
  display.print("OKAY?");
}

bool waitForResponse(unsigned long timeout) {
  unsigned long start = millis();
  while (millis() - start < timeout) {
    if (SerialAT.available()) {
      String response = SerialAT.readString();
      Serial.println("Modem Response: " + response);
      if (response.indexOf("OK") != -1 || response.indexOf("+CTTS: 0") != -1) {
        return true;
      }
    }
  }
  return false;
}

// Function to reset the I2C bus
void resetI2CBus() {
  pinMode(SCL, OUTPUT);  // Set SCL as output
  pinMode(SDA, INPUT_PULLUP);  // Keep SDA as input with pull-up

  // Toggle SCL line 9 times to release any stuck devices
  for (int i = 0; i < 9; i++) {
    digitalWrite(SCL, HIGH);
    delayMicroseconds(5);
    digitalWrite(SCL, LOW);
    delayMicroseconds(5);
  }

  // Generate a STOP condition
  pinMode(SDA, OUTPUT);
  digitalWrite(SDA, LOW);
  delayMicroseconds(5);
  digitalWrite(SCL, HIGH);
  delayMicroseconds(5);
  digitalWrite(SDA, HIGH);
  delayMicroseconds(5);

  // Reinitialize I2C
  Wire.begin();
  Serial.println("I2C bus reset complete.");
}

void setup() {
  Serial.begin(115200);
  delay(5000);
  Serial.println("\nStarting MPUraw with GSM and bulk data transmission");

  // Initialize GSM modem first
  setupModem();

  // Setup MQTT client
  secureClient.setCACert(root_ca);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setBufferSize(8192);

  // Initialize GPS at lower baud rate first
  Serial.println("Initializing GPS...");
  GPS.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100);
  GPS.print("$PCAS03,1,0,0,0,0,1,0,0*02\r\n");
  GPS.print("$PCAS01,5*19\r\n");
  GPS.print("$PCAS02,100*1E\r\n");
  delay(100);
  GPS.end();
  delay(100);
  GPS.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100);
  GPS.print("$PCAS03,1,0,0,0,0,1,0,0*02\r\n");
  GPS.print("$PCAS01,5*19\r\n");
  GPS.print("$PCAS02,100*1E\r\n");
  Serial.println("GPS initialized");

  // Initialize I2C for MPU6050
  Serial.println("Initializing MPU6050...");
  Wire.begin();
  Wire.setClock(400000);  // Set I2C clock speed to 100kHz
  Wire.setTimeout(3);  // 3 milliseconds timeout (not microseconds)
  mpu.initialize();

  static int failureCount = 0;  // Move declaration outside the if statement
  if (!mpu.testConnection()) {
    failureCount++;
    if (failureCount > 5) {  // Only reset after multiple failures
      Serial.println("MPU6050 not responding. Resetting I2C bus...");
      resetI2CBus();
      mpu.initialize();
      failureCount = 0;  // Reset failure count after reinitialization
    }
  } else {
    failureCount = 0;  // Now this is in scope
  }

  // Initialize DMP on the MPU6050
  devStatus = mpu.dmpInitialize();
  mpu.setXGyroOffset(0);
  mpu.setYGyroOffset(0);
  mpu.setZGyroOffset(0);
  mpu.setXAccelOffset(0);
  mpu.setYAccelOffset(0);
  mpu.setZAccelOffset(0);
  if (devStatus == 0) {
    mpu.CalibrateAccel(30);
    mpu.CalibrateGyro(30);
    mpu.setDMPEnabled(true);
    mpu.setRate(9);
    mpu.setDLPFMode(4);
    dmpReady = true;
    packetSize = mpu.dmpGetFIFOPacketSize();
    Serial.println("MPU6050 DMP initialized with enhanced filtering!");
  } else {
    Serial.println("DMP initialization failed!");
  }

  // Add these to your setup() after DMP initialization
  mpu.setFIFOEnabled(true);
  mpu.setXGyroFIFOEnabled(true);
  mpu.setYGyroFIFOEnabled(true);
  mpu.setZGyroFIFOEnabled(true);
  mpu.setAccelFIFOEnabled(true);

  // Initialize SD card
  Serial.println("Initializing SD card...");
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD card initialization failed!");
    while (1);
  }

  dataFile = SD.open("/datalog.csv", FILE_WRITE);
  if (dataFile) {
    dataFile.println("Device,Counter,Time,Latitude,Longitude,Speed(km/h),Ax,Ay,Az,Yaw");
    dataFile.close();
    Serial.println("SD card ready!");
  } else {
    Serial.println("Failed to create file!");
  }

  // Initialize display
  Serial.println("Initializing display...");
  display.init();

  // Show the normal system OK screen
  showNormalScreen();
  Serial.println("Display initialized with system OK screen");

  // Attach interrupt to the BOOT button
  pinMode(BOOT_BUTTON, INPUT_PULLUP);
  attachInterrupt(BOOT_BUTTON, handleBootButtonPress, FALLING);

  // Create mutex
  dataMutex = xSemaphoreCreateMutex();

  // Create FreeRTOS tasks with adjusted priorities
  xTaskCreatePinnedToCore(gpsTask, "GPS Task", 8192, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(mpuTask, "MPU Task", 16384, NULL, 3, NULL, 1);
  xTaskCreatePinnedToCore(mqttTask, "MQTT Task", 8192, NULL, 3, &mqttTaskHandle, 0);
  xTaskCreatePinnedToCore(sdCardTask, "SD Card Task", 8192, NULL, 2, &sdCardTaskHandle, 0);

  Serial.println("Setup complete, tasks running");
}

void loop() {
  // Empty loop as tasks handle all functionality
}

