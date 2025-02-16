import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="abdullah",
    passwd="2136692",
    database="mydatabase"
)

cursor = db.cursor()

# Create Customer Table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS Customer (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        gender ENUM('male', 'female') NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        address VARCHAR(255),
        Password VARCHAR(255) NOT NULL  # Increased length for hashed passwords
    )
""")

# Create Company Table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS Company (
        company_id INT AUTO_INCREMENT PRIMARY KEY,
        Company_name VARCHAR(255) NOT NULL,
        Contact_number VARCHAR(20) NOT NULL,  # Changed to VARCHAR
        Email VARCHAR(255) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        Password VARCHAR(255) NOT NULL  # Increased length
    )
""")

# Create Car Table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS Car (
        car_id INT AUTO_INCREMENT PRIMARY KEY,
        Model_of_car VARCHAR(255) NOT NULL,
        TypeOfCar VARCHAR(255) NOT NULL,
        Plate_number VARCHAR(20) UNIQUE NOT NULL,  # Changed to VARCHAR (plates often include letters)
        Release_Year_car INT NOT NULL,  # Changed to INT for year
        State_of_car ENUM('online', 'offline') NOT NULL,
        customer_id INT,  # Added for Customer relationship
        company_id INT,  # Added for Company relationship
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE SET NULL
    )
""")

# Create Driver Table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS Driver (
        driver_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        gender ENUM('male', 'female') NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        company_id INT NOT NULL,  # Added for Company relationship
        FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
    )
""")

# Create DrivingData Table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS DrivingData (
        driving_id INT AUTO_INCREMENT PRIMARY KEY,
        speed FLOAT NOT NULL,
        high_acceleration FLOAT NOT NULL,
        harsh_braking FLOAT NOT NULL,
        accident_detection TINYINT(1) NOT NULL,  # Changed to TINYINT(1) for boolean
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        car_id INT NOT NULL,  # Added for Car relationship
        FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE CASCADE
    )
""")
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()

print("\nTables in the database:")
for table in tables:
    print(f"- {table[0]}")

# Describe each table's structure
for table in tables:
    table_name = table[0]
    print(f"\nStructure of table '{table_name}':")
    cursor.execute(f"DESCRIBE {table_name}")
    columns = cursor.fetchall()
    for column in columns:
        print(column)

db.close()