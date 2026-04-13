```markdown
# 🎓 Student Management API (Firebase + Node.js)

A robust RESTful API built with **Node.js**, **Express**, and **Firebase Realtime Database**. This project uses a centralized "Command Center" approach to handle CRUD operations through a single dynamic POST endpoint.

## 🚀 Features
* **Centralized Dispatcher:** Manage Search, Add, Update, Delete, and Stats via a single endpoint.
* **Firebase Integration:** Real-time data synchronization.
* **Secure Configuration:** Environment variables for sensitive credentials.
* **Analytics:** Built-in statistics for total student counts and city-wise breakdowns.

---

## 🛠️ Prerequisites
* [Node.js](https://nodejs.org/) (v14 or higher)
* A [Firebase Project](https://console.firebase.google.com/)
* A Service Account Key JSON file from Firebase

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd studentData
## 📡 API Reference Table

All operations are handled via a `POST` request to the central management endpoint.

**Endpoint:** `POST /api/students/manage`

| qType | Action Description | Body Parameters (Required) | Optional Parameters |
| :--- | :--- | :--- | :--- |
| **add** | Register a new student | `studentID`, `name`, `city` | `age`, `course`, `email`, etc. |
| **search** | Query student records | `studentID` OR `city` | — |
| **update** | Modify existing data | `studentID` | Any field you wish to change |
| **delete** | Remove from database | `studentID` | — |
| **readAll** | Fetch full database | — | — |
| **stats** | Analytics & Totals | — | — |

---
