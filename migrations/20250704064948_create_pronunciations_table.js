/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('pronunciations', function (table) {
    table.increments('id').primary()
    table.string('word', 255).notNullable() // The base word (e.g., "AARONSON")
    table.string('word_variant', 255).notNullable() // The full variant (e.g., "AARONSON(1)")
    table.integer('variant_number').nullable() // The variant number (e.g., 1, 2, null for base)
    table.string('phonetic', 255).notNullable() // The phonetic pronunciation
    table.string('audio_url', 255)
    table.string('source', 255)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())

    // Indexes for efficient lookups
    table.index('word')
    table.index('word_variant')
    table.index('phonetic')
    table.index(['word', 'variant_number']) // Composite index for finding all variants of a word
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pronunciations')
}
