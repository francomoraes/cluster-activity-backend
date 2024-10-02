# Project Setup Guide for Local Testing

Follow these steps to run the project locally:

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

## 2. Install Dependencies (Not needed for testing)

```bash
npm install
```

## 3. Create and Configure `.env` File

-   Create a `.env` file in the project root directory.
-   Add the following environment variables:
    ```
    DATABASE_NAME=cluster-activity-app-type-orm
    DATABASE_USER=postgres
    DATABASE_PASSWORD=QWERTY2000
    DATABASE_HOST=localhost
    JWT_SECRET=JWT_SECRET
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    BASE_URL=http://localhost:5000/
    BASE_IP_URL=http://127.0.0.1:5000/
    CLIENT_URL=http://localhost:5173/
    EMAIL_USER=activityappclustertest@gmail.com
    EMAIL_PASS=
    ```

## 4. Run the Project using Docker

-   Make sure Docker is installed and running on your system.
-   Build and run the Docker containers:
    ```bash
    docker-compose up --build --force-recreate
    ```

## 5. Run the Database Seed Script (Optional)

-   To populate the database with initial data, run:
    ```bash
    npm run seed
    ```

## 6. Access the Backend

-   Once the Docker containers are running, access the backend at:
    ```
    http://localhost:5000/users/all
    ```

## 7. Stop the Containers

-   To stop the Docker containers, run:
    ```bash
    docker-compose down
    ```

## Additional Notes

-   Ensure that port `5000` is not in use by another application.
-   Modify environment variables in the `.env` file if necessary.

That's it! Your project should now be running locally for testing.
