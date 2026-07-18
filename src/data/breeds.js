import breedData from './breeds.json'

/**
 * @typedef {'small' | 'medium' | 'large' | 'giant'} DogSize
 * @typedef {object} Breed
 * @property {string} name
 * @property {number} lifespan
 * @property {[number, number]} lifespan_range
 * @property {string} lifespan_source
 * @property {string} lifespan_source_url
 * @property {[number, number]} weight_lb
 * @property {number} weight_midpoint_lb
 * @property {string} weight_source
 * @property {string} weight_source_url
 * @property {string} access_date
 * @property {DogSize} size
 * @property {string | null} dogceo_breed
 * @property {string | null} dogceo_sub_breed
 * @property {boolean} image_is_substitute
 * @property {string} notes
 */

/** @type {Breed[]} */
export const breeds = breedData
