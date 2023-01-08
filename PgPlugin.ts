import MigraMonPlugin from '@migramon/migrate/classes/Plugin'
import MigraMonStore from '@migramon/migrate/classes/Store'
import { Client } from 'pg'
import PgStore from './PgStore'

class PgPlugin implements MigraMonPlugin {
  public store: MigraMonStore

  client: Client

  constructor(params: {
    client: Client
  }) {
    const { client } = params
    this.store = new PgStore({ client })
    this.client = client
  }

  async makeSureSchemaSelected(){
    const { rows: schemaRows } = await this.client.query<{ schema: string | null }>(`SELECT current_schema() as schema;`)
    const { schema } = schemaRows[0] || {}

    if(!schema) {
      // current_schema() can be null during initialization of database
      await this.client.query('SET schema \'public\';')
    }
  }

  async onBeforeMigrations() {
    await this.makeSureSchemaSelected()

    await this.client.query('BEGIN TRANSACTION;')
  }

  async onAfterMigrations() {
    await this.client.query('COMMIT;')
  }
}

export default PgPlugin
