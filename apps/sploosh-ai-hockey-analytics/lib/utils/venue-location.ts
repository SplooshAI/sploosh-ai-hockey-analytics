/**
 * Where an arena is, for the game header and cards: "Seattle, WA", "Vancouver, BC, Canada",
 * "Helsinki, Finland".
 *
 * The NHL feed only gives the arena name and its city ("Seattle"), with no state, province, or country,
 * so tables supply the region. Arenas are looked up by name first because city names are ambiguous
 * (Ontario, California vs the province of Ontario). A venue that matches nothing shows just its city:
 * the region is never guessed. US arenas show the state, Canadian arenas the province and "Canada",
 * other countries the country.
 *
 * This table is also kept in scripts/social-gif/venue-location.mjs (plain Node, for the share GIF);
 * update both when an arena or city is added.
 */

const US = (state: string) => state
const CA = (province: string) => `${province}, Canada`

// Arena name -> region, as the feed spells them (2026-27 season).
const VENUES: Record<string, string> = {
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
  // neutral-site preseason arena
  'First Horizon Coliseum': US('NC'),
}

// A special-event venue (a stadium for the Stadium Series or Winter Classic) is not in the table above,
// but it is often in an NHL city, so fall back to that city's region. "Ontario" is left out on purpose:
// it is both a California city and a Canadian province.
const CITY_REGIONS: Record<string, string> = {
  Anaheim: US('CA'), Boston: US('MA'), Buffalo: US('NY'), Calgary: CA('AB'), Raleigh: US('NC'), Chicago: US('IL'),
  Denver: US('CO'), Columbus: US('OH'), Dallas: US('TX'), Detroit: US('MI'), Edmonton: CA('AB'), Sunrise: US('FL'),
  'St. Paul': US('MN'), Montreal: CA('QC'), Nashville: US('TN'), Newark: US('NJ'), Elmont: US('NY'), 'New York': US('NY'),
  Ottawa: CA('ON'), Philadelphia: US('PA'), Pittsburgh: US('PA'), 'San Jose': US('CA'), Seattle: US('WA'), 'St. Louis': US('MO'),
  Tampa: US('FL'), Toronto: CA('ON'), 'Salt Lake City': US('UT'), Vancouver: CA('BC'), Paradise: US('NV'), Hershey: US('PA'),
  Winnipeg: CA('MB'),
}

// Neutral-site and international games: city -> country.
const INTERNATIONAL_CITIES: Record<string, string> = {
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
export function formatVenueLocation(venue: string | undefined, city: string | undefined | null): string {
  if (!city) return ''
  const region = (venue && VENUES[venue]) ?? CITY_REGIONS[city] ?? INTERNATIONAL_CITIES[city]
  return region ? `${city}, ${region}` : city
}

/** "Arena · City, ST" for a game's venue and venueLocation; just the arena when there is no city. */
export function formatVenueLine(venue?: { default?: string } | null, venueLocation?: { default?: string } | null): string {
  const arena = venue?.default
  if (!arena) return ''
  const location = formatVenueLocation(arena, venueLocation?.default)
  return location ? `${arena} · ${location}` : arena
}
