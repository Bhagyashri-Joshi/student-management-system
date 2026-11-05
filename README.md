# Student Management System

A simple full-stack web app to manage student records. An administrator can **add, view, search, edit and delete** students. All data is saved in a **MySQL** database.

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Runs on:** localhost (no login needed)

---

## 1. Features

- Dashboard showing the **total number of students** (read live from MySQL)
- **Add** a student using a pop-up form
- **View** all students in a table, sorted by roll number
- **Search** by name (not case-sensitive) or roll number
- **Edit** a student (the roll number is locked and cannot change)
- **Delete** a student, with a confirmation pop-up first
- Messages for success, errors, duplicate roll numbers and empty results
- Validation in both the browser and the server

## 2. Student Details Stored

| Field | Rule |
| --- | --- |
| Roll Number | Required, whole number above 0, must be unique |
| Name | Required, up to 100 characters |
| Address | Required |
| Date of Birth | Required, valid date, cannot be in the future |
| Marks | Required, between 0 and 100, up to 2 decimal places |
| Class | Required, up to 30 characters |

## 3. Technologies Used

| Part | Technology |
| --- | --- |
| Structure | HTML5 |
| Styling | CSS3 (no frameworks) |
| Frontend logic | Vanilla JavaScript + Fetch API |
| Server | Node.js, Express.js |
| Database | MySQL with the `mysql2` package |
| Settings | `dotenv` (keeps passwords out of the code) |
| Browser access | `cors` |
| Auto-restart (dev) | `nodemon` |

## 4. Folder Structure

```
student-management-system/
├── backend/
│   ├── config/db.js                   # connects to MySQL
│   ├── controllers/studentController.js   # add / get / update / delete logic
│   ├── middleware/errorHandler.js     # handles errors and unknown routes
│   ├── routes/studentRoutes.js        # lists the API URLs
│   ├── .env.example                   # sample settings file
│   ├── package.json
│   └── server.js                      # starts the server
├── frontend/
│   ├── css/style.css                  # design
│   ├── js/script.js                   # talks to the backend
│   ├── assets/
│   └── index.html                     # the dashboard page
├── database/
│   └── student_management.sql         # creates the database and table
└── README.md
```

## 5. What You Need Before Starting

1. **Node.js** version 18 or newer: https://nodejs.org
2. **MySQL** version 8.0.16 or newer, installed and running
3. **VS Code** with the **Live Server** extension (or any simple web server)

To check Node is installed, run `node -v` in a terminal.

## 6. Setup Steps

### Step 1: Create the database

Open a terminal in the project folder and run:

```bash
mysql -u root -p < database/student_management.sql
```

(Or open the file in MySQL Workbench and run it.)
This creates the `student_management` database, the `students` table and 4 sample students.

### Step 2: Set up your settings file

```bash
cd backend
cp .env.example .env
```

On Windows Command Prompt use `copy .env.example .env`.

Open the new `.env` file and put your own MySQL password:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_management
DB_PORT=3306
```

Do not upload `.env` to GitHub. It is already listed in `.gitignore`.

### Step 3: Install the packages

Still inside the `backend` folder:

```bash
npm install
```

### Step 4: Start the backend

```bash
npm run dev
```

You should see these two lines:

```
Server running at http://localhost:5000
MySQL connected successfully
```

Quick check: open http://localhost:5000/api/health in your browser. It should say the API is running.

### Step 5: Start the frontend

In VS Code, right-click `frontend/index.html` and choose **Open with Live Server**.

No Live Server? Use another way:

```bash
cd frontend
python -m http.server 5500
```

then open http://localhost:5500.

> The backend and frontend must both be running at the same time.

## 7. How to Use the App

| To do this | Do this |
| --- | --- |
| Add a student | Click **+ Add Student**, fill in the form, click **Save Student** |
| Search | Type a name or roll number in the search box |
| Edit | Click **Edit** on a row, change details, click **Save Student** |
| Delete | Click **Delete** on a row, then confirm in the pop-up |
| Close a form | Click **Cancel**, press **Esc**, or click outside the box |

## 8. API Documentation

Base URL: `http://localhost:5000/api`

Every response is JSON and includes `"success": true` or `"success": false`.
Errors look like this:

```json
{ "success": false, "message": "Student not found" }
```

| Method | URL | What it does | Success code | Error codes |
| --- | --- | --- | --- | --- |
| GET | `/health` | Checks the server is running | 200 | none |
| POST | `/students` | Adds a student | 201 | 400 invalid input, 409 duplicate roll number |
| GET | `/students` | Lists all students | 200 | none |
| GET | `/students?search=rahul` | Lists students matching name or roll number | 200 | none |
| GET | `/students/count` | Returns total number of students | 200 | none |
| GET | `/students/:roll_no` | Gets one student | 200 | 400, 404 not found |
| PUT | `/students/:roll_no` | Updates a student | 200 | 400, 404 |
| DELETE | `/students/:roll_no` | Deletes a student | 200 | 400, 404 |

If the database is down, the API returns **503**. Other unexpected problems return **500**.

### Example: add a student

`POST /api/students`

```json
{
  "roll_no": 101,
  "name": "Rahul Sharma",
  "address": "Mumbai, Maharashtra",
  "dob": "2006-05-12",
  "marks": 85.50,
  "class": "10th"
}
```

### Example: update a student

`PUT /api/students/101` (do not send the roll number in the URL body; it never changes)

```json
{
  "name": "Rahul Sharma",
  "address": "Pune, Maharashtra",
  "dob": "2006-05-12",
  "marks": 90.00,
  "class": "11th"
}
```

### Example: count response

```json
{ "success": true, "totalStudents": 4 }
```

You can try all of these in Postman or Thunder Client.

## 9. Database Details

- **Database name:** `student_management`
- **Table name:** `students`

| Column | Type | Notes |
| --- | --- | --- |
| roll_no | INT | Primary key, must be above 0 |
| name | VARCHAR(100) | Required |
| address | TEXT | Required |
| dob | DATE | Required |
| marks | DECIMAL(5,2) | Required, 0 to 100 |
| class | VARCHAR(30) | Required |

## 10. Security Notes

- All database queries use **parameters** (`?`), which protects against SQL injection.
- The database password lives only in `.env`, never in the frontend code.
- Student text is shown on the page as plain text, so HTML typed into a field cannot run.
- Every rule is checked again on the server, even if the browser already checked it.

## 11. Test Checklist

| Test | Expected result |
| --- | --- |
| Add a valid student | Saved, success message, total goes up |
| Add a duplicate roll number | Rejected with an error |
| View all students | Every record appears in the table |
| Search for an existing student | Only matching rows appear |
| Search for a student that does not exist | "No students match" message |
| Edit a student | Changes are saved and shown |
| Delete a student | Row removed, total goes down |
| Cancel a delete | Student stays unchanged |
| Marks below 0 or above 100 | Validation error |
| Date of birth in the future | Validation error |
| Leave a required field empty | Validation error |
| Refresh the page | Records are still there |
| Stop MySQL and reload | Friendly error message, no crash |

## 12. Troubleshooting

| Problem | Fix |
| --- | --- |
| "Cannot reach the server" | The backend is not running. Run `npm run dev` inside `backend/` |
| "Database unavailable" | Make sure MySQL is running and the password in `.env` is correct |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` or `DB_PASSWORD` in `.env` |
| `ER_BAD_DB_ERROR` | The database does not exist yet. Do Step 1 again |
| Table is empty after setup | Re-run the SQL file |
| Port 5000 already in use | Change `PORT` in `.env`, then change `API_BASE_URL` at the top of `frontend/js/script.js` to match |
| Page loads but shows no data | Check the backend terminal for errors and open `/api/health` |



## 14. Out of Scope (Version 1.0)

Login, multiple admins, attendance, fees, exams, report cards, emails, file uploads and cloud deployment are not included.
