<script>
  import utils from './utils'

  export let working_days = null

  const DAY = utils.DAY_MS
  const WEEKDAYS = ['dom', ...utils.WEEKDAYS]

  const range = utils.range


  $:(() => {
    update()
    updateCalendar()
  })(working_days.start_timestamp)

  let month, year
  let next_month, next_year

  let update = () => {
    month = +(new Date(working_days.start_timestamp).getMonth()) + 1;
    year = new Date(working_days.start_timestamp).getFullYear()
  }

  let updateNext = () => {
    next_month = +month == 12 ? "01" : +month + 1
    next_year = +next_month == 1 ? +year + 1 : year
  }

  let next = () => {
    month = +month == 12 ? "01" : +month + 1
    year = +month == 1 ? +year + 1 : year
    updateNext()
    updateCalendar()
  }
  let prev = () => {
    month = +month == 1 ? "12" : +month - 1
    year = +month == 12 ? +year - 1 : year
    updateNext()
    updateCalendar()
  }

  let calendar = []

  let updateCalendar = () => {
    updateNext()

    let initial_ts = Date.parse(`${year}-${month}-01 12:00`)
    let end_ts = Date.parse(`${next_year}-${next_month}-01 12:00`)
    let count_days = (end_ts - initial_ts) / DAY
    let days = Array(count_days).fill(0).map((d, i) => new Date(initial_ts + i * DAY))

    calendar = [
      ...range(days[0].getDay()).fill(null).map((d, i) => {
        return new Date(days[0].getTime() - (days[0].getDay() - i) * DAY)
      }),
      ...days,
      ...range(6 - days[days.length - 1].getDay()).fill(null).map((d, i) => {
        return new Date(days[days.length - 1].getTime() + (i + 1) * DAY)
      })
    ]
  }
  update()
  updateCalendar()
</script>

<div class="grid grid-cols-3 mb-2 text-center">
  <a class="font-bold" href="#" on:click|preventDefault={prev}>Anterior</a>
  <span>{month} / {year}</span>
  <a class="font-bold" href="#" on:click|preventDefault={next}>Próximo</a>
</div>
<div class="grid grid-cols-7 text-center gap-2">
  {#each WEEKDAYS as day}
    <div class="font-bold">{day}</div>
  {/each}
  {#each calendar as day}
    <div>
      <div
        class="h-full rounded-lg"
        class:bg-green-300={
          !!day && !!working_days && !!working_days.getDay(day.getTime()) && +day.getMonth() + 1 == +month
        }
        class:text-gray-400={
          !!day &&
          !!working_days &&
          (!!!working_days.getDay(day.getTime()) || +day.getMonth() + 1 != +month) &&
          !!!working_days.holidays.isHoliday(day.getTime())
        }
        class:bg-blue-500|text-white={!!day && !!working_days && !!working_days.holidays.isHoliday(day.getTime())}
      >
        {day ? day.getDate() : ''}
      </div>
    </div>
  {/each}
</div>