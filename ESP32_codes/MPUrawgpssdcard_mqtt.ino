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
#include <PubSubClient.h>  // MQTT library
#include "ca_cert.h"        // Using the existing CA certificate file

// Device identification
const String DEVICE_NAME = "DBAS-001"; // Unique identifier for this device

// MQTT Server credentials
const char* mqtt_server = "af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // Use 8883 for TLS
const char* mqtt_topic = "data";
const char* mqtt_username = "team22";
const char* mqtt_password = "KauKau123";

// GSM Modem configuration
#define MODEM_UART_BAUD 115200
#define MODEM_DTR 25
#define MODEM_TX 17
#define MODEM_RX 16
#define MODEM_PWRKEY 4
#define LED_PIN 12

// GPRS credentials
const char apn[] = "jawalnet.com.sa";  // Your APN
const char gprs_user[] = "";          // User
const char gprs_pass[] = "";          // Password
const char simPIN[] = "";             // SIM card PIN code, if any

// Hardware Defines
#define RX_PIN 16  // Same as MODEM_RX
#define TX_PIN 17  // Same as MODEM_TX
#define CS_PIN 5

// Update intervals
#define WRITE_INTERVAL 2000
#define MQTT_INTERVAL 10000     // Increased to 10 seconds for GSM optimization
#define BULK_DATA_SIZE 4096     // Maximum size for bulk data transmission (4KB)

// Sensor objects
HardwareSerial GPS(1);
MPU6050 mpu;
TinyGPSPlus gps;
File dataFile;

// IMU DMP variables
bool dmpReady = false;
uint8_t devStatus;
uint16_t packetSize;
uint8_t fifoBuffer[64];
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
TinyGsm modem(Serial1);
TinyGsmClient gsmClient(modem);
SSLClient secureClient(&gsmClient);
PubSubClient client(secureClient);

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
  digitalWrite(LED_PIN, LOW);
  pinMode(MODEM_PWRKEY, OUTPUT);
  digitalWrite(MODEM_PWRKEY, LOW);
  delay(1000); // Datasheet Ton minutes = 1S
  digitalWrite(MODEM_PWRKEY, HIGH);
}

void turnModemOff() {
  digitalWrite(MODEM_PWRKEY, LOW);
  delay(1500); // Datasheet Ton minutes = 1.2S
  digitalWrite(MODEM_PWRKEY, HIGH);
  digitalWrite(LED_PIN, LOW);
}

void setupModem() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(MODEM_PWRKEY, OUTPUT);
  
  Serial.println("Initializing modem...");
  turnModemOff();
  delay(1000);
  turnModemOn();
  delay(5000);
  
  Serial1.begin(MODEM_UART_BAUD, SERIAL_8N1, MODEM_RX, MODEM_TX);
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
  
  digitalWrite(LED_PIN, HIGH); // Turn on LED to show connected
}

// Simplified MQTT reconnect function (publishing only)
void reconnect() {
  int retries = 0;
  while (!client.connected() && retries < 5) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-" + String(random(0xffff));
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
      retries++;
    }
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
SemaphoreHandle_t dataMutex;

// Separate buffers for MQTT and SD card
String mqttBuffer = "";
String sdCardBuffer = "";

// Task for sensor reading (MPU6050 & GPS)
void sensorTask(void *parameter) {
  while (true) {
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    while (GPS.available() > 0) {
      char c = GPS.read();
      if (c == '\n') {
        parseNMEA(nmeaLine);
        nmeaLine = "";
      } else {
        nmeaLine += c;
      }
    }

    if (dmpReady && mpu.dmpGetCurrentFIFOPacket(fifoBuffer)) {
      mpu.dmpGetQuaternion(&quat, fifoBuffer);
      mpu.dmpGetGravity(&gravity, &quat);
      mpu.dmpGetYawPitchRoll(ypr, &quat, &gravity);
    }

    String dataLine = DEVICE_NAME + "," + String(dataWriteCounter++) + "," 
                    + timeG + "," + latitude + "," + longitude + "," + String(speedKmh) + ","
                    + String(ax) + "," + String(ay) + "," + String(az) + ","
                    + String(ypr[0] * 180 / M_PI) + "\n";

    // Protect MQTT and SD card buffers with mutex
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      mqttBuffer += dataLine;
      sdCardBuffer += dataLine;
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(10 / portTICK_PERIOD_MS);  // Run at ~100Hz
  }
}

// Modified MQTT task for bulk data transmission
void mqttTask(void *parameter) {
  unsigned long lastConnectionCheck = 0;
  
  while (true) {
    unsigned long currentMillis = millis();
    
    // Periodically check GSM and MQTT connection status
    if (currentMillis - lastConnectionCheck > 60000) {
      lastConnectionCheck = currentMillis;
      
      // Check if GSM is still connected
      if (!modem.isGprsConnected()) {
        Serial.println("GPRS disconnected. Reconnecting...");
        modem.gprsConnect(apn, gprs_user, gprs_pass);
      }
      
      // Print connection details periodically
      IPAddress ip = modem.localIP();
      Serial.println("Local IP: " + String(ip[0]) + "." + String(ip[1]) + "." + 
                    String(ip[2]) + "." + String(ip[3]));
      int csq = modem.getSignalQuality();
      Serial.println("Signal quality: " + String(csq));
    }
    
    if (!client.connected()) {
      reconnect();
    }
    client.loop();

    // Protect MQTT buffer with mutex
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      // Send data in bulk if we have enough data or enough time has passed
      if (mqttBuffer.length() > 0 && 
         (mqttBuffer.length() >= BULK_DATA_SIZE || 
          currentMillis - lastMQTTTime >= MQTT_INTERVAL)) {
        
        // Send accumulated data in a single MQTT message
        Serial.println("Publishing " + String(mqttBuffer.length()) + " bytes of data");
        
        // For larger payloads, we might need to chunk the data
        if (mqttBuffer.length() > 5000) {
          // Split into chunks of 5000 bytes
          int chunks = (mqttBuffer.length() / 5000) + 1;
          for (int i = 0; i < chunks; i++) {
            int startPos = i * 5000;
            int endPos = min((i + 1) * 5000, (int)mqttBuffer.length());
            String chunk = mqttBuffer.substring(startPos, endPos);
            
            // Add chunk number to topic for proper reassembly
            String chunkTopic = String(mqtt_topic) + "/chunk/" + String(i+1) + "/" + String(chunks);
            client.publish(chunkTopic.c_str(), chunk.c_str());
            delay(200); // Small delay between chunks
          }
        } else {
          // Send as a single message
          client.publish(mqtt_topic, mqttBuffer.c_str());
        }
        
        mqttBuffer = "";  // Clear MQTT buffer after publishing
        lastMQTTTime = currentMillis;
      }
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(1000 / portTICK_PERIOD_MS);  // Check every second
  }
}

// Task for SD card writing
void sdCardTask(void *parameter) {
  while (true) {
    // Protect SD card buffer with mutex
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (sdCardBuffer.length() > 0) {
        dataFile = SD.open("/datalog.csv", FILE_APPEND);
        if (dataFile) {
          dataFile.print(sdCardBuffer);
          dataFile.close();
        }
        sdCardBuffer = "";  // Clear SD card buffer after writing
      }
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(WRITE_INTERVAL / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);
  delay(5000);
  Serial.println("\nStarting MPUraw with GSM and bulk data transmission");
  
  // Initialize GSM modem first
  setupModem();
  
  // Setup MQTT client
  secureClient.setCACert(root_ca); // Using the CA certificate
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Initialize GPS at lower baud rate first
  Serial.println("Initializing GPS...");
  GPS.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100); 
  GPS.print("$PCAS03,1,0,0,0,0,1,0,0*02\r\n"); // Enable only the GGA and VTG sentences
  GPS.print("$PCAS01,5*19\r\n"); // Set GPS to 115200 bps
  GPS.print("$PCAS02,100*1E\r\n"); // Set GPS update rate to 10Hz
  delay(100);
  GPS.end();
  delay(100); 
  GPS.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100); 
  GPS.print("$PCAS03,1,0,0,0,0,1,0,0*02\r\n"); // Enable only the GGA and VTG sentences
  GPS.print("$PCAS01,5*19\r\n"); // Set GPS to 115200 bps
  GPS.print("$PCAS02,100*1E\r\n"); // Set GPS update rate to 10Hz
  Serial.println("GPS initialized");

  // Initialize I2C for MPU6050
  Serial.println("Initializing MPU6050...");
  Wire.begin();
  Wire.setClock(400000);
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed!");
    while(1);
  }

  // Initialize DMP on the MPU6050
  devStatus = mpu.dmpInitialize();
  if (devStatus == 0) {
    // Enhanced calibration for better accuracy
    mpu.CalibrateAccel(30);
    mpu.CalibrateGyro(30);
    
    // Set DMP configuration options for optimal filtering
    mpu.setDMPEnabled(true);
    
    // Set DMP output rate - lower rate = more filtering
    // 9 = ~100Hz output, 19 = ~50Hz output (more filtering)
    mpu.setRate(9);
    
    // Configure DMP filtering strength for motion sensors
    // Lower values = stronger filtering
    mpu.setDLPFMode(6);  // Set to maximum filtering (MPU6050_DLPF_BW_5)
    
    dmpReady = true;
    packetSize = mpu.dmpGetFIFOPacketSize();
    Serial.println("MPU6050 DMP initialized with enhanced filtering!");
  } else {
    Serial.println("DMP initialization failed!");
  }

  // Initialize SD card
  Serial.println("Initializing SD card...");
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD card initialization failed!");
    while(1);
  }
  
  dataFile = SD.open("/datalog.csv", FILE_WRITE);
  if (dataFile) {
    // Streamlined header with only the needed fields
    dataFile.println("Device,Counter,Time,Latitude,Longitude,Speed(km/h),Ax,Ay,Az,Yaw");
    dataFile.close();
    Serial.println("SD card ready!");
  } else {
    Serial.println("Failed to create file!");
  }

  // Create mutex
  dataMutex = xSemaphoreCreateMutex();

  // Create FreeRTOS tasks with adjusted priorities
  xTaskCreatePinnedToCore(sensorTask, "Sensor Task", 8192, NULL, 3, &sensorTaskHandle, 1);
  xTaskCreatePinnedToCore(mqttTask, "MQTT Task", 8192, NULL, 2, &mqttTaskHandle, 0);
  xTaskCreatePinnedToCore(sdCardTask, "SD Card Task", 4096, NULL, 1, &sdCardTaskHandle, 0);
  
  Serial.println("Setup complete, tasks running");
}

void loop() {
  // Empty loop as tasks handle all functionality
}