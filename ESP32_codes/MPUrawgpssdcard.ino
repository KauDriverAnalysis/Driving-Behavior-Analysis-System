#include <HardwareSerial.h>
#include <Wire.h>
#include <SD.h>
#include <SPI.h>
#include <TinyGPS++.h>
#include "MPU6050_6Axis_MotionApps20.h"
#include "I2Cdev.h"

#define RX_PIN 16
#define TX_PIN 17
#define CS_PIN 5 // Chip select pin for SD card

HardwareSerial GPS(1);
MPU6050 mpu;
File dataFile;
TinyGPSPlus gps;

int16_t ax, ay, az;
int16_t gx, gy, gz;
unsigned long lastWriteTime = 0;
const unsigned long writeInterval = 100; // Adjust the interval as needed
String dataBuffer = "";
unsigned long dataWriteCounter = 0;

// Parsing GPS data
static String timeG = "";
static String nmeaLine = "";
static String latitude = "";
static String longitude = "";
static float speedKmh = 0.0;

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
      if (fieldCount == 1) timeG = field;
      else if (fieldCount == 2) latitude = field;
      else if (fieldCount == 4) longitude = field;
      fieldCount++;
      idx1 = idx2 + 1;
    }
    
    // Format latitude and longitude
    String formattedLat = formatGPS(latitude, 2);
    String formattedLon = formatGPS(longitude, 3);

    // Convert GPS time to Saudi Arabian Standard Time (UTC+3)
    int hours = timeG.substring(0, 2).toInt() + 3; // Adjusting time zone
    int minutes = timeG.substring(2, 4).toInt();
    int seconds = timeG.substring(4, 6).toInt();
    int milliseconds = (timeG.length() > 6) ? timeG.substring(7).toInt() : 0;

    // Handle overflow in hours
    if (hours >= 24) hours -= 24;

    char formattedTime[20];
    sprintf(formattedTime, "%02d:%02d:%02d.%03d", hours, minutes, seconds, milliseconds);
    timeG = formattedTime;
    latitude = formattedLat;
    longitude = formattedLon;
    Serial.print("GGA Time (AST): "); Serial.print(formattedTime);
    //Serial.print(" Lat: "); Serial.print(formattedLat);
    //Serial.print(" Lon: "); Serial.println(formattedLon);
  } else if (line.startsWith("$GNVTG")) {
    int idx1 = 0, idx2 = 0, fieldCount = 0;
    while ((idx2 = line.indexOf(',', idx1)) != -1) {
      String field = line.substring(idx1, idx2);
      if (fieldCount == 7) speedKmh = field.toFloat();
      fieldCount++;
      idx1 = idx2 + 1;
    }
    //Serial.print("VTG Speed(km/h): ");
    //Serial.println(speedKmh);
  }
}

//=========================
// Add these global DMP variables:
bool DMPReady = false;
uint8_t devStatus;
uint16_t packetSize;
uint8_t FIFOBuffer[64];
Quaternion q;
VectorFloat gravity;
float ypr[3];

void setup() {
  Serial.begin(115200);
  GPS.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);
  GPS.print("$PCAS03,1,0,0,0,0,1,0,0*02\r\n"); // Enable only the GGA and VTG sentences
  GPS.print("$PCAS01,5*19\r\n"); // Set GPS to 115200 bps
  GPS.print("$PCAS02,100*1E\r\n"); // Set GPS update rate to 10Hz

  Wire.begin();
  Wire.setClock(400000); // Set I2C clock frequency to 400 kHz
  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed");
    while (true);
  }

  Serial.println("MPU6050 connection successful");

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
    DMPReady = true;
    packetSize = mpu.dmpGetFIFOPacketSize();
  }

  // Initialize SD card
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD card initialization failed! Check connections and CS pin.");
    while (true);
  }
  Serial.println("SD card initialized.");

  // Open the file for writing and create the CSV header
  dataFile = SD.open("/datalog.csv", FILE_WRITE);
  if (!dataFile) {
    Serial.println("Failed to open datalog.csv");
    while (true);
  }
  dataFile.println("Counter,Time,Latitude,Longitude,Speed(km/h),Ax,Ay,Az,Gx,Gy,Gz,Yaw,Pitch,Roll");
  dataFile.close();
}

void loop() {
  // Collect MPU6050 data
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    // Read and parse GPS data
    while (GPS.available() > 0) {
      char c = GPS.read();
      if (c == '\n') {
        parseNMEA(nmeaLine);
        nmeaLine = "";
      } else {
        nmeaLine += c;
      }
    }

  // Use the latest parsed GPS data
  if (DMPReady && mpu.dmpGetCurrentFIFOPacket(FIFOBuffer)) {
    mpu.dmpGetQuaternion(&q, FIFOBuffer);
    mpu.dmpGetGravity(&gravity, &q);
    mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);
  }

  // Buffer data
  dataWriteCounter++;
  dataBuffer += String(dataWriteCounter) + "," + String(timeG) + "," + latitude + "," + longitude + "," + 
                String(speedKmh) + "," + String(ax) + "," + String(ay) + "," + 
                String(az) + "," + String(gx) + "," + String(gy) + "," + String(gz) + "," +
                String(ypr[0] * 180/M_PI) + "," +
                String(ypr[1] * 180/M_PI) + "," +
                String(ypr[2] * 180/M_PI) + "\n";

  // Write data to SD card at the specified interval
  if (millis() - lastWriteTime >= writeInterval) {
    lastWriteTime = millis();

    // Write buffered data to SD card
    dataFile = SD.open("/datalog.csv", FILE_APPEND);
    Serial.println("uploading");
    Serial.println(dataWriteCounter);

    if (dataFile) {
      dataFile.print(dataBuffer);
      dataFile.close();
      dataBuffer = ""; // Clear the buffer
    } else {
      Serial.println("Error opening datalog.csv");
    }

    // Print data to Serial Monitor (optional)
    Serial.print(String(dataWriteCounter) + "," + timeG + "," + latitude + "," + longitude + "," + 
                 String(speedKmh) + "," + String(ax) + "," + String(ay) + "," + 
                 String(az) + "," + String(gx) + "," + String(gy) + "," + String(gz) + "," +
                 String(ypr[0] * 180/M_PI) + "," +
                 String(ypr[1] * 180/M_PI) + "," +
                 String(ypr[2] * 180/M_PI) + "\n");
                 
  }
}
