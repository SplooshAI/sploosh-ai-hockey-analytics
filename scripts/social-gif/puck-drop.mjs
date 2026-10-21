// "Thursday, November 12th, 2026 @ 7:00 PM EET": the puck drop in the arena's own time zone.
//
// The feed gives the start time in UTC and the arena's UTC offset ("-07:00"), but no zone name.
// International venues are found by city; North American ones by matching the offset.

const NORTH_AMERICA = ['America/Los_Angeles', 'America/Vancouver', 'America/Denver', 'America/Edmonton', 'America/Phoenix', 'America/Chicago', 'America/Winnipeg', 'America/New_York', 'America/Toronto', 'America/Halifax']

// City -> zone for neutral-site and international games. Add cities as new ones come up.
const CITY_ZONES = {
  Helsinki: 'Europe/Helsinki',
  Tampere: 'Europe/Helsinki',
  Stockholm: 'Europe/Stockholm',
  Gothenburg: 'Europe/Stockholm',
  Prague: 'Europe/Prague',
  Berlin: 'Europe/Berlin',
  Munich: 'Europe/Berlin',
  Zurich: 'Europe/Zurich',
  Bern: 'Europe/Zurich',
  Melbourne: 'Australia/Melbourne',
  Tokyo: 'Asia/Tokyo',
}

// English short names only exist for US zones ("PDT"); elsewhere Intl says "GMT+2", so name them here by UTC offset hours.
const ABBREVIATIONS = {
  'Europe/Helsinki': { 2: 'EET', 3: 'EEST' },
  'Europe/Stockholm': { 1: 'CET', 2: 'CEST' },
  'Europe/Prague': { 1: 'CET', 2: 'CEST' },
  'Europe/Berlin': { 1: 'CET', 2: 'CEST' },
  'Europe/Zurich': { 1: 'CET', 2: 'CEST' },
  'Australia/Melbourne': { 10: 'AEST', 11: 'AEDT' },
  'Asia/Tokyo': { 9: 'JST' },
}

const offsetLabel = (zone, date) =>
  new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || ''

const wantedOffsetLabel = (utcOffset) => {
  const [, sign, hours, minutes] = /^([+-])(\d{2}):(\d{2})$/.exec(utcOffset || '') || []
  if (!sign) return ''
  return `GMT${sign}${Number(hours)}${minutes === '00' ? '' : `:${minutes}`}`
}

export function formatPuckDrop(startTimeUTC, utcOffset, city) {
  if (!startTimeUTC) return ''
  const start = new Date(startTimeUTC)
  const want = wantedOffsetLabel(utcOffset)
  const zone = CITY_ZONES[city] || NORTH_AMERICA.find((z) => offsetLabel(z, start) === want) || 'America/New_York'

  const part = (options) => new Intl.DateTimeFormat('en-US', { timeZone: zone, ...options }).format(start)
  const day = Number(part({ day: 'numeric' }))
  const ordinal = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : day % 10]
  const offsetHours = Number((offsetLabel(zone, start).match(/GMT([+-]\d+)/) || [])[1] || 0)
  const abbreviation = ABBREVIATIONS[zone]?.[offsetHours] || part({ timeZoneName: 'short' }).split(' ').pop()

  return `${part({ weekday: 'long' })}, ${part({ month: 'long' })} ${day}${ordinal}, ${part({ year: 'numeric' })} @ ${part({ hour: 'numeric', minute: '2-digit' })} ${abbreviation}`
}
