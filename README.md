## POI

POI Application

#### Prerequisites
1. Install docker desktop v4.23.0 >
2. Install docker compose
3. Install git if you haven't done so

#### Instructions

1. Repository setup
```
    git clone repository-name
    cd repository-name
```
2. Spinning up the app

In the project directory you should see this structure
```
├── poi                    # Root directory
    ├── gateway         # Gateway
    ├── db        # Database
    ├── poi    # Poi service
    ├── web            # Frontend
    └── docker-compose.yml
    └── README.md
```

In the root directory create a file .env with this definition

```
CONFIG_MODE = development
DEVELOPMENT_DATABASE_URL = 
TEST_DATABASE_URL        =
STAGING_DATABASE_URL     =
PRODUCTION_DATABASE_URL  =
SECRET_KEY = 

```

Still in the root directory

```
run this commands in this order
docker compose build
docker compose up -d
```

Check if your containers are running

```
docker ps
```

## Setup Services
```
docker exec -it poi-service flask db init
docker exec -it poi-service flask db migrate
docker exec -it poi-service flask db upgrade
```

## Setup Services (on Server)
```
docker exec -it poi-service flask --app src.app db migrate
docker exec -it poi-service flask --app src.app db upgrade
```

## Run Seeder
```
{url}/poi/seed

username: admin
password: 1234