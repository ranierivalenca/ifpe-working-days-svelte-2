const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const WEEK_MS = 7 * DAY_MS
const WEEKDAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']


let formatDate = (timestamp, year = true) => {
  let date = new Date(timestamp)
  return `${(date.getDate() < 10 ? '0' : '') + date.getDate()}/${(date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)}` + (year ? `/${date.getFullYear()}` : '')
}

// get week day starting on Monday (so, Sunday is 6)
let weekDay = timestamp => new Date(timestamp).getDay() == 0 ? 6 : new Date(timestamp).getDay() - 1

let range = (els) => [...Array(els).keys()]

export default {
    HOUR_MS,
    DAY_MS,
    WEEK_MS,
    WEEKDAYS,
    weekDay,
    formatDate,
    range,
}
