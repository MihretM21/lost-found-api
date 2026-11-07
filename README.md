# Lost and Found API

A backend API for a campus Lost and Found board, built with Node.js, Express and MySQL. Built as the Week 9 assignment of the Hiruy Full-Stack Bootcamp.

## Features

- Store lost and found items in a MySQL database
- Get all items, get one item, add, update and delete
- Validation of the data (required text, date format, valid id)
- Clear status codes: 200, 201, 400, 404, 500
- Safe queries: every SQL query uses `?` placeholders, which stops SQL injection

## Database

Table `items`:

| Column         | Type                             | Meaning                             |
| -------------- | -------------------------------- | ----------------------------------- |
| id             | INT, auto increment, primary key | Unique number of the item           |
| name           | VARCHAR(100)                     | What the item is                    |
| category       | VARCHAR(50)                      | For example Electronics, Keys, Bags |
| location_found | VARCHAR(150)                     | Where it was found                  |
| date_found     | DATE                             | When it was found (YYYY-MM-DD)      |
| claimed        | BOOLEAN                          | true if the owner has collected it  |

## API

| Method | Path         | What it does   | Success | Errors                            |
| ------ | ------------ | -------------- | ------- | --------------------------------- |
| GET    | `/items`     | All items      | 200     |                                   |
| GET    | `/items/:id` | One item       | 200     | 400 bad id, 404 not found         |
| POST   | `/items`     | Add an item    | 201     | 400 bad data                      |
| PUT    | `/items/:id` | Update an item | 200     | 400 bad data or id, 404 not found |
| DELETE | `/items/:id` | Delete an item | 200     | 400 bad id, 404 not found         |

Example body for POST and PUT:

```json
{
  "name": "Black phone",
  "category": "Electronics",
  "location_found": "Library, 2nd floor",
  "date_found": "2026-11-05",
  "claimed": false
}
```

## How to run it

1. Clone the repository and open the folder.
2. Install the packages:
   ```
   npm install
   ```
3. Create the database by running `lost-found.sql` in MySQL Workbench.
4. Open `server.js` and put your own MySQL password in `password: "YOUR_MYSQL_PASSWORD"`.
5. Start the server:
   ```
   node server.js
   ```
6. Open `http://localhost:3000/items` in the browser.

## Testing

Import `lost-found.postman_collection.json` into Postman and send the requests. It has requests for all five operations and error cases (item that does not exist, missing name, bad date, invalid id).

## Built with

Node.js, Express, MySQL (mysql2)

## Author

Mihret Dula, [@MihretM21](https://github.com/MihretM21)
