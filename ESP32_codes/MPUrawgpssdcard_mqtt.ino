#include <HardwareSerial.h>
#include <Wire.h>
#include <SD.h>
#include <SPI.h>
#include <TinyGPS++.h>
#include "MPU6050_6Axis_MotionApps20.h"
#include "I2Cdev.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>  // MQTT library

// Device identification
const String DEVICE_NAME = "DBAS-001"; // Unique identifier for this device

// WiFi and MQTT Server credentials
const char* ssid = "hj";
const char* password = "noobnoob";
const char* mqtt_server = "af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // Use 1883 for non-TLS
const char* mqtt_topic = "data";
const char *mqtt_username = "team22";
const char *mqtt_password = "KauKau123";

const char *root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFBjCCAu6gAwIBAgIRAIp9PhPWLzDvI4a9KQdrNPgwDQYJKoZIhvcNAQELBQAw\n" \
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n" \
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMjQwMzEzMDAwMDAw\n" \
"WhcNMjcwMzEyMjM1OTU5WjAzMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNTGV0J3Mg\n" \
"RW5jcnlwdDEMMAoGA1UEAxMDUjExMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\n" \
"CgKCAQEAuoe8XBsAOcvKCs3UZxD5ATylTqVhyybKUvsVAbe5KPUoHu0nsyQYOWcJ\n" \
"DAjs4DqwO3cOvfPlOVRBDE6uQdaZdN5R2+97/1i9qLcT9t4x1fJyyXJqC4N0lZxG\n" \
"AGQUmfOx2SLZzaiSqhwmej/+71gFewiVgdtxD4774zEJuwm+UE1fj5F2PVqdnoPy\n" \
"6cRms+EGZkNIGIBloDcYmpuEMpexsr3E+BUAnSeI++JjF5ZsmydnS8TbKF5pwnnw\n" \
"SVzgJFDhxLyhBax7QG0AtMJBP6dYuC/FXJuluwme8f7rsIU5/agK70XEeOtlKsLP\n" \
"Xzze41xNG/cLJyuqC0J3U095ah2H2QIDAQABo4H4MIH1MA4GA1UdDwEB/wQEAwIB\n" \
"hjAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwEgYDVR0TAQH/BAgwBgEB\n" \
"/wIBADAdBgNVHQ4EFgQUxc9GpOr0w8B6bJXELbBeki8m47kwHwYDVR0jBBgwFoAU\n" \
"ebRZ5nu25eQBc4AIiMgaWPbpm24wMgYIKwYBBQUHAQEEJjAkMCIGCCsGAQUFBzAC\n" \
"hhZodHRwOi8veDEuaS5sZW5jci5vcmcvMBMGA1UdIAQMMAowCAYGZ4EMAQIBMCcG\n" \
"A1UdHwQgMB4wHKAaoBiGFmh0dHA6Ly94MS5jLmxlbmNyLm9yZy8wDQYJKoZIhvcN\n" \
"AQELBQADggIBAE7iiV0KAxyQOND1H/lxXPjDj7I3iHpvsCUf7b632IYGjukJhM1y\n" \
"v4Hz/MrPU0jtvfZpQtSlET41yBOykh0FX+ou1Nj4ScOt9ZmWnO8m2OG0JAtIIE38\n" \
"01S0qcYhyOE2G/93ZCkXufBL713qzXnQv5C/viOykNpKqUgxdKlEC+Hi9i2DcaR1\n" \
"e9KUwQUZRhy5j/PEdEglKg3l9dtD4tuTm7kZtB8v32oOjzHTYw+7KdzdZiw/sBtn\n" \
"UfhBPORNuay4pJxmY/WrhSMdzFO2q3Gu3MUBcdo27goYKjL9CTF8j/Zz55yctUoV\n" \
"aneCWs/ajUX+HypkBTA+c8LGDLnWO2NKq0YD/pnARkAnYGPfUDoHR9gVSp/qRx+Z\n" \
"WghiDLZsMwhN1zjtSC0uBWiugF3vTNzYIEFfaPG7Ws3jDrAMMYebQ95JQ+HIBD/R\n" \
"PBuHRTBpqKlyDnkSHDHYPiNX3adPoPAcgdF3H2/W0rmoswMWgTlLn1Wu0mrks7/q\n" \
"pdWfS6PJ1jty80r2VKsM/Dj3YIDfbjXKdaFU5C+8bhfJGqU3taKauuz0wHVGT3eo\n" \
"6FlWkWYtbt4pgdamlwVeZEW+LM7qZEJEsMNPrfC03APKmZsJgpWCDWOKZvkZcvjV\n" \
"uYkQ4omYCTX5ohy+knMjdOmdH9c7SpqEWBDC86fiNex+O0XOMEZSa8DA\n" \
"-----END CERTIFICATE-----\n";


// Hardware Defines
#define RX_PIN 16
#define TX_PIN 17
#define CS_PIN 5

// Update intervals
#define WRITE_INTERVAL 100
#define MQTT_INTERVAL 2000  // Interval to send data to MQTT server (ms)

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
String dataBuffer = "";
unsigned long dataWriteCounter = 0;
unsigned long lastMQTTTime = 0;

// WiFi and MQTT objects
WiFiClientSecure espClient;
PubSubClient client(espClient);

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

// WiFi and MQTT setup
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-" + String(random(0xffff));
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      // Subscribe to topic
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  Serial.println("-----------------------");
}



void setup() {
  Serial.begin(115200);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  espClient.setCACert(root_ca);
  reconnect();
  
  GPS.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100); 
  GPS.print("$PCAS03,1,0,0,0,0,1,0,002\r\n"); // Enable only the GGA and VTG sentences
  GPS.print("$PCAS01,519\r\n"); // Set GPS to 115200 bps
  GPS.print("$PCAS02,1001E\r\n"); // Set GPS update rate to 10Hz
  delay(100);
  GPS.end();
  delay(100); 
  GPS.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  delay(100); 
  GPS.print("$PCAS03,1,0,0,0,0,1,0,002\r\n"); // Enable only the GGA and VTG sentences
  GPS.print("$PCAS01,519\r\n"); // Set GPS to 115200 bps
  GPS.print("$PCAS02,1001E\r\n"); // Set GPS update rate to 10Hz

  Wire.begin();
  Wire.setClock(400000);
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed!");
    while(1);
  }

  // Replace the current dmpInitialize section in setup() with this enhanced version
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
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
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

  dataWriteCounter++;
  
  // Streamlined data line with device name at the beginning and only needed fields
  String dataLine = DEVICE_NAME + "," + String(dataWriteCounter) + "," 
                  + timeG + "," + latitude + "," + longitude + "," + String(speedKmh) + ","
                  + String(ax) + "," + String(ay) + "," + String(az) + ","
                  + String(ypr[0] * 180/M_PI) + "\n";  // Only keep yaw from orientation
  dataBuffer += dataLine;

  if (millis() - lastWriteTime >= WRITE_INTERVAL) {
    lastWriteTime = millis();

    dataFile = SD.open("/datalog.csv", FILE_APPEND);
    if (dataFile) {
      dataFile.print(dataBuffer);
      dataFile.close();
      Serial.printf("Data written! Counter: %d\n", dataWriteCounter);
    } else {
      Serial.println("Error writing to SD card!");
    }

    Serial.printf("Current Heap: %d bytes\n", ESP.getFreeHeap());
    Serial.printf("Buffer size: %d characters\n", dataBuffer.length());
  }

  if (millis() - lastMQTTTime >= MQTT_INTERVAL) {
    lastMQTTTime = millis();

    // Split dataBuffer into individual lines and publish each line
    int startIndex = 0;
    int endIndex = dataBuffer.indexOf('\n');
    while (endIndex != -1) {
      String line = dataBuffer.substring(startIndex, endIndex);
      client.publish(mqtt_topic, line.c_str());
      startIndex = endIndex + 1;
      endIndex = dataBuffer.indexOf('\n', startIndex);
    }

    // Clear the buffer after sending
    dataBuffer = "";
  }
}

