# Mall Parking

Parking API built with NestJS and Postgres

## Requirements

1. Docker
2. Postgres

### Installation

```
yarn install
```

### Running the app

```
# create a copy of .env.example as .env
cp .env.example .env

# then run the app (:3000)
yarn start:dev
```

### Running the tests

```
yarn test
```

### Testing the API

An `insomnia-client.json` import file has been included to quickly tests the endpoints using the [Insomnia client](https://insomnia.rest/download).

### Resetting the database

```
yarn db:dev:reset
```
