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

  async onBeforeMigrations() {
    await this.client.query('BEGIN TRANSACTION;')
  }

  async onAfterMigrations() {
    await this.client.query('COMMIT;')
  }
}

export default PgPlugin
