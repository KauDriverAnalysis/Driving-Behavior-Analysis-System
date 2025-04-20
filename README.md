

# Driving Behavior Analysis System

This project is a **graduation project** aimed at analyzing driving behavior using a combination of advanced hardware and software technologies. The system is designed to collect, process, and analyze data from various sensors, and present actionable insights to ensure flexibility, ease of use, and reliability.

---

## Project Overview

The Driving Behavior Analysis System is comprised of two major parts:

### 1. **Hardware Components**
- **IMU (Inertial Measurement Unit) + GPS**: 
  - The IMU collects acceleration and angular velocity data for motion analysis.
  - The GPS operates at **10 Hz**, providing high-frequency and precise location tracking.
- **ESP Microcontroller**: Utilizes **FreeRTOS** for efficient multitasking and real-time data processing.
- **GSM Module (SIM7600)**: A 4G-enabled communication module that ensures fast and reliable data transmission to the cloud.

### 2. **Software Components**
- **MQTT Protocol**: Ensures lightweight and efficient data transfer between the hardware and backend systems.
- **Django Backend Framework**: Processes and organizes incoming data, prepares it for analysis, and renders the results.
- **React Frontend**: A user-friendly interface for visualizing analyzed data, deployed seamlessly on **Netlify** for easy access.

---

## Data Flow Overview

The system follows a structured data processing pipeline to ensure high performance and accuracy:

1. **Sensors (IMU + GPS)**: Collect raw motion and location data from the vehicle.
2. **ESP Microcontroller**: Processes the data locally using **FreeRTOS** and sends it via the GSM module.
3. **GSM Module (SIM7600)**: Transmits data over a **4G network** to the cloud using the **MQTT protocol**.
4. **Django Backend**: Receives, processes, and organizes the data for analysis.
5. **React Frontend**: Visualizes the analyzed data in an interactive and flexible manner, offering insights into driving behavior.
6. **Netlify Deployment**: Ensures the frontend is accessible on any device, providing a seamless user experience.

---

## Features

- **Real-Time Data Collection**: 
  - IMU and GPS sensors capture high-frequency data for precise driving behavior analysis.
  - The GPS operates at **10 Hz**, ensuring accurate location tracking.
- **Robust Communication**: 
  - The **SIM7600 GSM Module** enables fast and reliable **4G** data transmission.
  - The **MQTT protocol** ensures lightweight and efficient communication.
- **Advanced Backend Processing**: Built with Django, ensuring scalable and secure data handling capabilities.
- **Interactive Frontend**: Developed using React, offering a responsive and intuitive user interface.
- **Cloud Deployment**: Hosted on **Netlify**, ensuring quick and easy access from anywhere.
- **Real-Time Efficiency**: Uses **FreeRTOS** on the ESP microcontroller for multitasking and real-time processing.

---

## Why This System Stands Out

- **Ease of Use**: The software interface is designed to be user-friendly, requiring minimal technical expertise.
- **Flexibility**: The modular architecture allows for easy integration of new sensors and features in the future.
- **Technical Excellence**: Incorporates cutting-edge tools like **FreeRTOS**, **Django**, **React**, **MQTT**, and **Netlify**, demonstrating advanced development skills.

---

## Technologies Used

- **Hardware**: IMU, GPS (10 Hz), ESP Microcontroller, GSM Module (SIM7600 4G)
- **Software**:
  - **FreeRTOS**: Real-time operating system for efficient microcontroller task management.
  - **MQTT**: Lightweight messaging protocol for efficient data communication.
  - **Django**: Backend framework for scalable and secure data processing.
  - **React**: Frontend library for building an interactive user interface.
  - **Netlify**: Cloud platform for seamless frontend deployment.

---

## Conclusion

The Driving Behavior Analysis System is a robust, flexible, and user-friendly solution for analyzing driving behavior. Its seamless integration of advanced hardware and software demonstrates technical expertise and innovation, making it a valuable tool for ensuring safer driving practices.

