import Holidays from './Holidays'

import utils from './utils'

const weekDay = utils.weekDay
const formatDate = utils.formatDate

const HOUR = utils.HOUR_MS
const DAY = utils.DAY_MS
const WEEK = utils.WEEK_MS
const WEEKDAYS = utils.WEEKDAYS

const _MON = 0
const _TUE = 1
const _WED = 2
const _THU = 3
const _FRI = 4
const _SAT = 5
const _SUN = 6

class WorkingDays {
  // global objects
  holidays

  // data
  start_date
  saturdays
  days_per_week
  min_working_days

  // generated
  start_timestamp
  end_timestamp
  last_day

  number_of_weeks
  working_days

  weekdays
  weekdays_holidays

  constructor(holidays, days_per_week = 5, min_days = 100) {
    this.holidays = holidays
    if (!holidays) {
      this.holidays = new Holidays()
    }

    // initialization
    this.days_per_week = days_per_week
    this.min_working_days = min_days
    this.saturdays = true

    this.number_of_weeks = Math.ceil(this.min_working_days / this.days_per_week)
    this.working_days = Array(this.number_of_weeks * this.days_per_week).fill(null)

    this.weekdays = [] // updated later
    this.weekdays_holidays = [] // updated later

    this.setStartDay(formatDate(new Date()).split('/').reverse().join('-'))
  }

  setStartDay(start_date) {
    if (start_date) {
      this.start_date = start_date
    }
    this.start_timestamp = Date.parse(this.start_date) + 12 * HOUR
    if (!this.start_timestamp) {
      throw Error("Could not proceed")
    }
    this.end_timestamp = 0
    this.last_day = null
    this.fillDays()
  }

  setSaturdays(saturdays) {
    this.saturdays = saturdays
    this.fillDays()
  }

  updateLastDay() {
    this.end_timestamp = 0
    for (let day of this.working_days) {
      if (day.timestamp > this.end_timestamp) {
        this.end_timestamp = day.timestamp
        this.last_day = day
      }
    }
  }

  getDays(only_available = false) {
    let ts = this.start_timestamp
    let days = []
    let use_saturdays = this.saturdays

    while (ts <= this.end_timestamp) {
      if (!this.holidays.isHoliday(ts)) {
        if (weekDay(ts) < this.days_per_week || (weekDay(ts) == _SAT && use_saturdays)) {
          let is_day_available = !this.working_days.find(d => d.timestamp == ts)
          days.push({available: is_day_available, timestamp: ts})
        }

      }
      ts += DAY
    }
    if (only_available) {
      return days.filter(d => d.available)
    }
    return days
  }

  fillDays() {
    // finding first working days for each week day
    let firsts = Array(this.days_per_week).fill(this.start_timestamp)

    for (let week_day = 0; week_day < this.days_per_week; week_day++) {
      for (let i = 0; weekDay(firsts[week_day]) != week_day; i++) {
        firsts[week_day] = this.start_timestamp + DAY * i
      }
    }

    // allocating the next working days for each week day
    for (let i = 0; i < this.working_days.length; i++) {
      let day_of_week = i % this.days_per_week
      let week = Math.floor((i - day_of_week) / this.days_per_week)
      let ts = firsts[day_of_week] + week * WEEK;


      while (
        this.holidays.isHoliday(ts) ||
        (i > this.days_per_week && this.working_days[i - this.days_per_week].timestamp >= ts)
      ) {
        ts += WEEK
      }
      this.working_days[i] = {date: formatDate(ts, false), timestamp: ts}
    }

    this.updateLastDay()
    this.compactDays()
    this.updateWeekdays()
  }

  compactDays() {
    let available_days = this.getDays(true)
    while (available_days.length > 0) {
      let last_day_index = this.working_days.findIndex(d => d.timestamp == this.end_timestamp)
      let day_to_move = available_days.pop()
      let new_ts = day_to_move.timestamp
      // console.log(`moving ${days[last_day_index].date} to ${formatDate(day_to_move.timestamp)}`)
      this.working_days[last_day_index] = {date: formatDate(new_ts, false), timestamp: new_ts, special: true}

      this.updateLastDay()
      available_days = this.getDays(true)
    }
  }

  updateWeekdays() {
    let getDayWeek = (day, week) => this.working_days[day + this.days_per_week * week]

    this.weekdays = Array(this.days_per_week).fill(null).map((weekday, day) => {
      let days = []
      for (let week = 0; week < this.number_of_weeks; week++) {
        days.push(getDayWeek(day, week))
      }
      days.sort((d1, d2) => d1.timestamp - d2.timestamp)
      return days
    })

    this.weekdays_holidays = Array(this.days_per_week).fill(null).map(h => [])
    let holidays = this.holidays.getHolidaysBetween(this.start_timestamp, this.end_timestamp)
    for (let holiday of holidays) {
      let weekday = weekDay(holiday.timestamp)
      if (weekday < this.days_per_week) {
        this.weekdays_holidays[weekday].push(holiday)
      }
    }
  }

  getDay(ts) {
    return this.working_days.find(d => d.date == formatDate(ts, false))
  }
}

export default WorkingDays