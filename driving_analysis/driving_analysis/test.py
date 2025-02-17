import pymysql

# Database connection details
endpoint = 'database-1.cj26egwukn4n.us-east-1.rds.amazonaws.com'  # Replace with your RDS endpoint
username = 'admin'
password = '12ABDo34'
port = 3306

# Connect to the RDS instance
connection = pymysql.connect(
    host=endpoint,
    user=username,
    password=password,
    port=port
)

try:
    with connection.cursor() as cursor:
        # Create a new database
        cursor.execute("CREATE DATABASE database1")  # Replace with your actual database name
        print("Database created successfully.")
finally:
    connection.close()
