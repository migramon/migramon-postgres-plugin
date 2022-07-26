import PgStoreCore from './src/PgStoreCore'
import { Client } from 'pg'

interface PgStoreConfig {
  onInit?(): any
}

class PgStore extends PgStoreCore {
  config: PgStoreConfig

  constructor(params: {
    client:Client
  } & PgStoreConfig) {
    const { onInit } = params
    super(params)

    this.config = {
      onInit,
    }
  }

  private async initUserConfig() {
    if (!this.config.onInit) return null
    const info = await this.models.configModel.checkIfTableExists()
    if (info.exists) return null

    await this.config.onInit()
  }

  private async initLibConfig() {
    const info = await this.models.configModel.checkIfTableExists()
    if (info.exists) return null

    await this.client.query(`
      create schema if not exists system;
      create table system.migrations
        (
        \tkey varchar(100) not null,
        \tstate json,
        \tcreated_at timestamptz default now()
        );

create unique index migrations_key_uindex on system.migrations (key);
alter table system.migrations add constraint migrations_pk primary key (key);
    `)
  }

  public isInitialized = false

  async init() {
    if (this.isInitialized) return null
    await this.initUserConfig()
    await this.initLibConfig()
    this.isInitialized = true
  }
}

export default PgStore
