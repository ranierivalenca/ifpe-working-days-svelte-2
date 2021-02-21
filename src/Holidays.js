const NATIONAL_HOLIDAYS = {
  '01/01': 'Confraternização Universal',
  '21/04': 'Tiradentes',
  '01/05': 'Dia do Trabalhador',
  '07/09': 'Independência',
  '12/10': 'Nossa Senhora Aparecida',
  '02/11': 'Finados',
  '15/11': 'Proclamação da República',
  '25/12': 'Natal'
}

const DEFAULT_HOLIDAYS = {
  '03/06/2021': 'Corpus Christi',
  '29/09': 'Feriado local',
  '11/10/2021': 'Nossa Senhora Aparecida',
  '28/10': 'Dia do Servidor Público',
  '24/12': 'Natal',
  '31/12': 'Ano Novo',
  '01/02/2022': 'Carnaval',
  '02/02/2022': 'Carnaval'
}

import utils from './utils'
const formatDate = utils.formatDate
const DAY = utils.DAY_MS
const HOUR = utils.HOUR_MS

class Holidays {
  holidays = []

  constructor() {

    this.holidays = [
      ...Object.keys(NATIONAL_HOLIDAYS).map(d => {
        return {
          'day': d,
          'fixed': true,
          'national': true,
          'desc': NATIONAL_HOLIDAYS[d]
        }
      }),
      ...Object.keys(DEFAULT_HOLIDAYS).map(d => {
        return {
          'day': d,
          'fixed': d.length == 5,
          'national': false,
          'desc': DEFAULT_HOLIDAYS[d]
        }
      })
    ]
    this.sort()
  }

  sort() {
    let sortKey = h => parseInt(h.day.split('/').reverse().join(''))
    this.holidays = this.holidays.sort((h1, h2) => sortKey(h1) - sortKey(h2))
  }

  setHolidaysDates() {
    this.fixed_holidays_dates = [...Object.keys(this.holidays), ...Object.keys(NATIONAL_HOLIDAYS)]
      .filter(date => date.length == 5)
      .map(date => date.split('/').reverse().join('-'))
      .sort()
      .map(date => date.split('-').reverse().join('/'))
    this.moving_holidays_dates = [...Object.keys(this.holidays), ...Object.keys(NATIONAL_HOLIDAYS)]
      .filter(date => date.length == 10)
      .map(date => date.split('/').reverse().join('-'))
      .sort()
      .map(date => date.split('-').reverse().join('/'))
  }

  remove(date) {
    let idx = this.holidays.findIndex(h => h.day == date)
    this.holidays = [...this.holidays.slice(0, idx), ...this.holidays.slice(idx + 1)]
  }

  add(date, description, fixed) {
    let ts = Date.parse(date) + 12 * HOUR
    let formatted = formatDate(ts)
    if (fixed) {
      formatted = formatDate(ts, false)
    }
    this.holidays.push({
      'day': formatted,
      'fixed': fixed,
      'national': false,
      'desc': description
    })
    this.sort()
  }

  getHoliday(timestamp) {
    let formatted = formatDate(timestamp, false)
    let formatted_full = formatDate(timestamp)

    return this.holidays.find(h => h.day == formatted || h.day == formatted_full)
  }

  isHoliday(timestamp) {
    return !!this.getHoliday(timestamp)
  }

  getHolidaysBetween(start, end) {
    let holidays = []
    for (let ts = start; ts <= end; ts += DAY) {
      let holiday = this.getHoliday(ts)
      if (!!holiday) {
        holiday.timestamp = ts
        holidays.push(holiday)
      }
    }
    return holidays
  }
}

export default Holidays