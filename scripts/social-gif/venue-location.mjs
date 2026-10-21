// Where an arena is, for the GIF's scorebug: "Seattle, WA", "Vancouver, BC, Canada", "Stockholm, Sweden".
//
// The NHL feed only gives the arena name and its city ("Seattle"); there is no state, province, or country.
// So this table supplies the region. Arenas are keyed by name rather than city because city names are
// ambiguous (Ontario, California vs the province of Ontario). A venue that is not listed falls back to the
// city alone: it is never guessed.
//
// US arenas show the state, Canadian arenas the province and "Canada", other countries just the country.

const US = (state) => state
const CA = (province) => `${province}, Canada`

// Arena name -> region, as the feed spells them. Source: the 2026-27 feed's venue and venueLocation.
const VENUES = {
  'Honda Center': US('CA'),
  'TD Garden': US('MA'),
  'KeyBank Center': US('NY'),
  'Scotiabank Saddledome': CA('AB'),
  'Lenovo Center': US('NC'),
  'United Center': US('IL'),
  'Ball Arena': US('CO'),
  'Nationwide Arena': US('OH'),
  'American Airlines Center': US('TX'),
  'Little Caesars Arena': US('MI'),
  'Rogers Place': CA('AB'),
  'Amerant Bank Arena': US('FL'),
  'Toyota Arena': US('CA'), // Ontario, California
  'Grand Casino Arena': US('MN'),
  'Centre Bell': CA('QC'),
  'Bridgestone Arena': US('TN'),
  'Prudential Center': US('NJ'),
  'UBS Arena': US('NY'),
  'Madison Square Garden': US('NY'),
  'Canadian Tire Centre': CA('ON'),
  'Xfinity Mobile Arena': US('PA'),
  'PPG Paints Arena': US('PA'),
  'SAP Center at San Jose': US('CA'),
  'Climate Pledge Arena': US('WA'),
  'Enterprise Center': US('MO'),
  'Benchmark International Arena': US('FL'),
  'Scotiabank Arena': CA('ON'),
  'Delta Center': US('UT'),
  'Rogers Arena': CA('BC'),
  'T-Mobile Arena': US('NV'),
  'GIANT Center': US('PA'),
  'Canada Life Centre': CA('MB'),
}

// Neutral-site and international games: city -> country, for venues not in the table above.
const INTERNATIONAL_CITIES = {
  Stockholm: 'Sweden',
  Gothenburg: 'Sweden',
  Helsinki: 'Finland',
  Tampere: 'Finland',
  Prague: 'Czechia',
  Berlin: 'Germany',
  Munich: 'Germany',
  Zurich: 'Switzerland',
  Bern: 'Switzerland',
  Melbourne: 'Australia',
  Tokyo: 'Japan',
}

/** "City, ST", "City, PROV, Canada", "City, Country", or just "City"; '' when there is no city. */
export function formatVenueLocation(venue, city) {
  if (!city) return ''
  const region = VENUES[venue] ?? INTERNATIONAL_CITIES[city]
  return region ? `${city}, ${region}` : city
}
