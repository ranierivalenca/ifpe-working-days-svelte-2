<script>
  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY
  const WEEKDAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  const HOLLIDAYS = ['21/04', '01/05', '03/06', '07/09', '11/10', '12/10', '28/10', '01/11', '02/11', '15/11', '08/12', '24/12', '25/12', '31/12', '01/01', '01/02', '02/02']

  let start_date = '2021-04-22'
  let use_saturdays = true
  let days_per_week = 5

  // setted on main function
  let start_timestamp = 0
  let end_timestamp = 0
  let number_of_weeks = 0

  let dias_letivos = []
  let days = []
  let final_days = []
  let hollidays = []



  let range = (els) => [...Array(els).keys()]

  let formatDate = (timestamp, year = true) => {
    let date = new Date(timestamp)
    return `${(date.getDate() < 10 ? '0' : '') + date.getDate()}/${(date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)}` + (year ? `/${date.getFullYear()}` : '')
    }

  let myWeekDay = timestamp => new Date(timestamp).getDay() == 0 ? 6 : new Date(timestamp).getDay() - 1

  let getDay = (day, week) => days[day + days_per_week * week]

  let fillDays = () => {
    let firsts = Array(days_per_week).fill(start_timestamp)
    for (let week_day = 0; week_day < days_per_week; week_day++) {
      for (let i = 0; myWeekDay(firsts[week_day]) != week_day; i++) {
        firsts[week_day] = start_timestamp + DAY * i
      }
    }

    for (let i = 0; i < days.length; i++) {
      let day = i % days_per_week
      let week = Math.floor((i - day) / days_per_week)
      let ts = firsts[day] + week * WEEK;

//      (i < days_per_week) ? null : console.log(days[i - days_per_week].timestamp, formatDate(days[i - days_per_week].timestamp), ts, formatDate(ts))
      if (HOLLIDAYS.includes(formatDate(ts, false))) {
        hollidays[myWeekDay(ts)].push({date: formatDate(ts, false), timestamp: ts})
      }

      while (HOLLIDAYS.includes(formatDate(ts, false)) || (i > days_per_week && days[i - days_per_week].timestamp >= ts)) {
        ts += WEEK
      }
      days[i] = {date: formatDate(ts, false), timestamp: ts}
    }
  }

  let updateLastDay = () => {
    end_timestamp = 0
    for (i = 0; i < days.length; i++) {
      if (days[days.length - 1 - i].timestamp > end_timestamp) {
        end_timestamp = days[days.length - 1 - i].timestamp
      }
    }
  }

  let getWorkingDays = () => {
    let ts = start_timestamp
    let working_days = []

    while (ts <= end_timestamp) {
      if (myWeekDay(ts) != 6 && !HOLLIDAYS.includes(formatDate(ts, false))) {
        if (myWeekDay(ts) < 5 || days_per_week == 6 || use_saturdays) {
//          let available = !days.map(d => formatDate(d.timestamp)).includes(formatDate(ts))
          let available = days.filter(d => d.timestamp == ts).length == 0
          working_days.push({available: available, timestamp: ts})
        }

      }
      ts += DAY
    }
    return working_days
  }



  $:(() => {
    console.clear()
    number_of_weeks = Math.ceil(100 / days_per_week)
    start_timestamp = Date.parse(start_date) + 12 * HOUR
    if (!start_timestamp || start_timestamp < 0) {
      return
    }
    days = Array(number_of_weeks * days_per_week).fill(null)
    hollidays = Array(days_per_week).fill(0).map(h => [])

    fillDays()
    updateLastDay()

    let working_days = getWorkingDays()
    let available_working_days = working_days.filter(d => d.available)
    let i = 100;
    while (i > 0 && available_working_days.length > 0) {
      let last_day_index = days.findIndex(d => d.timestamp == end_timestamp)
      let day_to_move = available_working_days.pop()
      let new_ts = day_to_move.timestamp
      console.log(`moving ${days[last_day_index].date} to ${formatDate(day_to_move.timestamp)}`)
      days[last_day_index] = {date: formatDate(new_ts, false), timestamp: new_ts, special: true}

      updateLastDay()
      working_days = getWorkingDays()
      available_working_days = working_days.filter(d => d.available)
//      console.log(available_working_days.length)
      i--;
    }
    final_days = Array(days_per_week).fill(null).map((weekday, day) => {
      let days = []
      for (let i = 0; i < number_of_weeks; i++) {
        days.push(getDay(day, i))
      }
      days.sort((d1, d2) => d1.timestamp - d2.timestamp)
      return days
    })

//    days_per_week++
//    days_per_week--
    console.log(days)
    console.log(final_days)
    console.log(formatDate(end_timestamp))
    console.log(hollidays)

  })(days_per_week, use_saturdays, start_date)
  //  $: (() => setup(dias_por_semana))(usar_sabados)


</script>

<style>
  table, td {
    border: 1px solid black;
    border-collapse: collapse
  }
  td {
    padding: .5em;
  }
  td.dia {
    background: hsl
  }
  td.special {
    color: hsl(0, 100%, 30%)
  }
  button {
    background: hsl(0, 0%, 100%);
    padding: 0.5em 1em;
  }
  button:hover {
    cursor: pointer;
    background: hsl(120, 100%, 95%)
  }
  button.active {
    background: hsl(120, 100%, 80%)
  }
  .disabled {
    color: hsl(0, 0%, 80%)
  }
</style>

<input bind:value={start_date} type="date">
<button class:active="{days_per_week == 5}" on:click={() => days_per_week = 5}>
  Segunda a Sexta (5 dias letivos)
</button>
<button class:active="{days_per_week == 6}" on:click={() => days_per_week = 6}>
  Segunda a Sábado (6 dias letivos)
</button>
<label class:disabled="{days_per_week != 5}">
  <input type="checkbox" disabled="{days_per_week != 5}" bind:checked="{use_saturdays}" /> Usar sábados
</label>
<hr />
<table>
  {#each final_days as day, day_i}
    <tr>
      <td class="dia">{WEEKDAYS[day_i]}</td>
      {#each day as working_day}
        {#if working_day.special}
          <td class="special">{working_day.date} <br>({WEEKDAYS[myWeekDay(working_day.timestamp)]})</td>
        {:else}
          <td>{working_day.date}</td>
        {/if}
      {/each}
    </tr>
  {/each}
</table>
Último dia letivo: {formatDate(end_timestamp)}