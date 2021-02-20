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

class Holidays {
  holidays = []

  constructor() {
    let sortKey = h => parseInt(h.day.split('/').reverse().join(''))
    this.holidays = [
      ...Object.keys(NATIONAL_HOLIDAYS).map(d => {
        return {
          'day': d,
          'fixed': true,
          'national': true
        }
      }),
      ...Object.keys(DEFAULT_HOLIDAYS).map(d => {
        return {
          'day': d,
          'fixed': d.length == 10,
          'national': false
        }
      })
    ].sort((h1, h2) => sortKey(h1) - sortKey(h2))
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
    this.holidays = [...this.holidays.splice(0, idx), ...this.holidays.splice(idx + 1)]
  }

  isHoliday(timestamp) {
    let formatted = formatDate(timestamp, false)
    let formatted_full = formatDate(timestamp)

    return !!this.holidays.find(h => h.day == formatted || h.day == formatted_full)
  }
}

export default Holidays