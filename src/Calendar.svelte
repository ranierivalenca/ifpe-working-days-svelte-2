<script>
  import utils from './utils'

  export let working_days = null

  const DAY = utils.DAY_MS
  const WEEKDAYS = ['dom', ...utils.WEEKDAYS]

  const range = utils.range

  let months = []

  $:(() => {
    update()
    // updateCalendar()
  })(working_days.start_timestamp, working_days.end_timestamp)

  let update = () => {
    months = []
    let last_month = +(new Date(working_days.end_timestamp).getMonth()) + 1
    last_month = `0${+last_month}`.substr(-2)
    let last_year = new Date(working_days.end_timestamp).getFullYear()

    let month = 0
    let year = 0
    month = +(new Date(working_days.start_timestamp).getMonth()) + 1;
    month = `0${+month}`.substr(-2)
    year = new Date(working_days.start_timestamp).getFullYear()
    while (+`${year}${month}` <= +`${last_year}${last_month}`) {
      months.push([month, year])
      month = +month == 12 ? "01" : +month + 1
      month = `0${+month}`.substr(-2)
      year = +month == 1 ? +year + 1 : year
    }
    console.log(months)
  }

  let calendar = (month, year, first = false) => {
    let next_month = +month == 12 ? "01" : +month + 1
    let next_year = +next_month == 1 ? +year + 1 : year

    let initial_ts = Date.parse(`${year}-${month}-01 12:00`)
    let end_ts = Date.parse(`${next_year}-${next_month}-01 12:00`)
    let count_days = (end_ts - initial_ts) / DAY

    let days = Array(count_days).fill(0).map((d, i) => new Date(initial_ts + i * DAY))

    return [
      ...range(days[0].getDay()).fill(null).map((d, i) => {
        return first ? new Date(days[0].getTime() - (days[0].getDay() - i) * DAY) : null
      }),
      ...days,
    ]
  }

  let is_working_day_in_month = (day, month) => {
    return !!(working_days?.getDay(day?.getTime()) && +day.getMonth() + 1 == +month)
    // return !!day && !!working_days && !!working_days.getDay(day.getTime()) && +day.getMonth() + 1 == +month
  }
  let is_holiday = day => {
    return !!(working_days?.holidays.isHoliday(day?.getTime()))
    // return !!day && !!working_days && !!working_days.holidays.isHoliday(day.getTime())
  }
  let is_special = day => {
    return !!working_days?.getDay(day?.getTime())?.special
  }
</script>

{#each months as [month, year], i}
  <h2 class="border-t border-gray-300 pt-4 pb-4 text-lg font-bold text-center mt-2">{month} / {year}</h2>
  <div class="grid grid-cols-7 text-center gap-2">
    {#each WEEKDAYS as day}
      <div class="font-bold">{day}</div>
    {/each}
    {#each calendar(month, year, i == 0) as day}
      <div>
        <div
          class="h-full rounded-lg"
          class:bg-green-300={is_working_day_in_month(day, month)}

          class:text-gray-400={!is_working_day_in_month(day, month) && !is_holiday(day)}

          class:bg-blue-500={is_holiday(day)}
          class:text-white={is_holiday(day)}

          class:text-red-900={is_working_day_in_month(day, month) && is_special(day)}
          class:font-bold={is_working_day_in_month(day, month) && is_special(day)}
        >
          {day ? `0${day.getDate()}`.substr(-2) : ''}
          {#if is_working_day_in_month(day, month) && working_days.getDay(day.getTime()).special}
              ({WEEKDAYS[working_days.getDay(day.getTime()).weekday + 1]})
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/each}