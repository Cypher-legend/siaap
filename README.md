# SIAAP Project Setup Guide

## **Prerequisites**
Before running this project, ensure you have the following installed on your system:

1. **Node.js (Version 16)**
   - Download from [Node.js Official Website](https://nodejs.org/)
   - Install it following the setup instructions for your OS
   - Verify installation:
     - Open **Command Line/Windows PowerShell/Terminal**
     - Type:
       ```sh
       node -v
       ```
     - You should see `v16.x.x`

2. **MongoDB**
   - Download MongoDB Community Server from [MongoDB Official Website](https://www.mongodb.com/try/download/community)
   - Install it following the setup instructions for your OS
   - Start MongoDB service:
     - **On Windows:**
       - Open Command Prompt and run:
         ```sh
         net start MongoDB
         ```
     - **On macOS/Linux:**
       - Open Terminal and run:
         ```sh
         mongod --dbpath=/path/to/your/db/folder
         ```

## **Project Setup**

### **1. Clone the Repository**
Open **Command Line/Windows PowerShell/Terminal** and run:
```sh
git clone <your-repo-url>
```

### **2. Navigate to the Project Folder**
```sh
cd siaap
```

## **Backend Setup**

### **3. Install Backend Dependencies**
Navigate to the backend folder and install the required dependencies:
```sh
cd backend
npm install express mongoose dotenv cors body-parser bcryptjs jsonwebtoken cookie-parser
```

### **4. Set Up Environment Variables**
- Inside the `backend` folder, create a `.env` file:
  ```sh
  touch .env
  ```
- Open `.env` and add:
  ```env
  MONGO_URI=mongodb://localhost:27017/siaap
  PORT=5000
  ```

### **5. Start the Backend Server**
```sh
npm start
```
- If using `nodemon` (recommended):
  ```sh
  npm install -g nodemon
  nodemon server.js
  ```

## **Frontend Setup**

### **6. Install Frontend Dependencies**
Navigate to the frontend folder and install the required dependencies:
```sh
cd frontend
npm install axios react-router-dom
```

### **7. Start the React Frontend**
```sh
npm start
```

## **Accessing the Application**
- **Backend API** runs on: `http://localhost:5000`
- **Frontend React App** runs on: `http://localhost:3000`

## **Stopping the Application**
To stop both the backend and frontend servers, press:
```sh
CTRL + C
```

