/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.table('pronunciations', (table) => {
    table.index(['phonetic', 'word'], 'idx_phonetic_word')
  })
}

exports.down = async function (knex) {
  await knex.schema.table('pronunciations', (table) => {
    table.dropIndex(['phonetic', 'word'], 'idx_phonetic_word')
  })
}
