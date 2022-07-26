
It provides postgres connection for Migramon.

[![npm](https://img.shields.io/npm/v/@migramon/postgres-plugin)](https://www.npmjs.com/package/@migramon/postgres-plugin)

## Install

Make sure you have [migramon](https://www.npmjs.com/package/@migramon/migrate) installed

``yarn add @migramon/postgres-plugin``

or

```npm i -S @migramon/postgres-plugin```

## Usage

Update Migramon migrator file:

```ts
import pg from 'pg'
import Migrator from '@migramon/migrate'
import { PgPlugin, PgStore } from '@migramon/postgres-plugin'

const client = new pg.Client({ ... })

async function setup() {
  // here you can wait for db connection
  await client.connect()

  const pgPlugin = new PgPlugin({client})
  // you can use store only variant (without plugin)
  // const store = new PgStore({client})

  const migrator = new Migrator({
    store: pgPlugin.store, // migration state will be stored in postgres
    plugins: [pgPlugin], // plugin will wrap migrations into transaction
  })

  return migrator
}

export default setup
```


### Advanced Example


Update Migramon migrator file:

```ts
import pg from 'pg'
import Migrator from '@migramon/migrate'
import { PgPlugin, PgStore } from '@migramon/postgres-plugin'
import * as fs from "fs";

const client = new pg.Client({ ... })

async function setup() {
  // here you can wait for db connection
  await client.connect()

  const pgPlugin = new PgPlugin({client})
  // you can use store only variant (without plugin)
  const store = new PgStore({
    client,
    async onInit() {
      /** 
       * When migration is not initialized, you can upload your custom dump
            to init database with initial schema.
         It can be nice to rollout full database in one action.
        @Note: Dump should be created with --insert option. 
       */
      const dumpFile = fs.readFileSync('./migrations/.config/init-dump.sql', 'utf8')
      await client.query(dumpFile)
    }
  })

  const migrator = new Migrator({
    store, // migration state will be stored in postgres
    plugins: [pgPlugin], // plugin will wrap migrations into transaction
  })

  return migrator
}

export default setup
```
