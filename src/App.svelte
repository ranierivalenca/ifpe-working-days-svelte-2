<script>
  import Tailwindcss from './Tailwind.svelte'
  import Checkbox from './Checkbox.svelte'



  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY
  const WEEKDAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab']
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
  const HOLIDAYS = ['21/04', '01/05', '03/06', '07/09', '11/10', '12/10', '28/10', '01/11', '02/11', '15/11', '08/12', '24/12', '25/12', '31/12', '01/01', '01/02', '02/02']

  let holidays = {
    '03/06/2021': 'Corpus Christi',
    '29/09': 'Feriado local',
    '11/10': 'Nossa Senhora Aparecida',
    '28/10': 'Dia do Servidor Público',
    '24/12': 'Natal',
    '31/12': 'Ano Novo',
    '01/02/2022': 'Carnaval',
    '02/02/2022': 'Carnaval'
  }

  let fixed_holidays_dates = []
  let moving_holidays_dates = []
  let setHolidaysDates = () => {
    fixed_holidays_dates = [...Object.keys(holidays), ...Object.keys(NATIONAL_HOLIDAYS)]
      .filter(date => date.length == 5)
      .map(date => date.split('/').reverse().join('-'))
      .sort()
      .map(date => date.split('-').reverse().join('/'))
    moving_holidays_dates = [...Object.keys(holidays), ...Object.keys(NATIONAL_HOLIDAYS)]
      .filter(date => date.length == 10)
      .map(date => date.split('/').reverse().join('-'))
      .sort()
      .map(date => date.split('-').reverse().join('/'))
  }
  setHolidaysDates()


  let start_date = '2021-10-22'
  let use_saturdays = true
  let days_per_week = 5

  // setted on main function
  let start_timestamp = 0
  let end_timestamp = 0
  let number_of_weeks = 0

  let dias_letivos = []
  let days = []
  let formatted_days = []
  let formatted_holidays = []

  let show_holidays = false


  let removeHoliday = key => {
    delete holidays[key]
    setHolidaysDates()
    console.log(holidays)
  }

  let isHoliday = timestamp => {
    let formatted = formatDate(timestamp, false)
    let formatted_full = formatDate(timestamp)

    return !!NATIONAL_HOLIDAYS[formatted] || !!holidays[formatted] || !!holidays[formatted_full]
  }

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
      if (isHoliday(ts)) {
        formatted_holidays[myWeekDay(ts)].push({date: formatDate(ts, false), timestamp: ts})
      }

      while (isHoliday(ts) || (i > days_per_week && days[i - days_per_week].timestamp >= ts)) {
        ts += WEEK
      }
      days[i] = {date: formatDate(ts, false), timestamp: ts}
    }
  }

  let updateLastDay = () => {
    end_timestamp = 0
    for (let i = 0; i < days.length; i++) {
      if (days[days.length - 1 - i].timestamp > end_timestamp) {
        end_timestamp = days[days.length - 1 - i].timestamp
      }
    }
  }

  let getWorkingDays = () => {
    let ts = start_timestamp
    let working_days = []

    while (ts <= end_timestamp) {
      if (myWeekDay(ts) != 6 && !isHoliday(ts)) {
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
    formatted_holidays = Array(days_per_week).fill(0).map(h => [])

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
    formatted_days = Array(days_per_week).fill(null).map((weekday, day) => {
      let days = []
      for (let i = 0; i < number_of_weeks; i++) {
        days.push(getDay(day, i))
      }
      days.sort((d1, d2) => d1.timestamp - d2.timestamp)
      return days
    })

//    days_per_week++
//    days_per_week--
    // console.log(days)
    // console.log(formatted_days)
    // console.log(formatDate(end_timestamp))
    // console.log(formatted_holidays)

  })(days_per_week, use_saturdays, start_date, fixed_holidays_dates)
  //  $: (() => setup(dias_por_semana))(usar_sabados)


</script>

<Tailwindcss />

<div class="max-w-7xl bg-gray-100 m-auto min-h-screen">
  <nav class="p-2 py-4 bg-green-600">
    <h1 class="text-xl text-white">Dias Letivos</h1>
  </nav>

  <main class="p-2">

    <div class="border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-3">
      <div>
        <label for="start_date" class="text-sm block">Dia Inicial:</label>
        <input id="start_date" bind:value={start_date} type="date">
      </div>

      <div class="flex items-center">
        <Checkbox bind:status={use_saturdays}>
          Usar Sábados
        </Checkbox>
      </div>

      <button class="bg-green-200 hover:bg-green-400 rounded-md" on:click={() => show_holidays = true}>Feriados</button>
    </div>

    <!-- <button class:active="{days_per_week == 5}" on:click={() => days_per_week = 5}>
      Segunda a Sexta (5 dias letivos)
    </button>
    <button class:active="{days_per_week == 6}" on:click={() => days_per_week = 6}>
      Segunda a Sábado (6 dias letivos)
    </button> -->

    {#if show_holidays}
      <div class="fixed z-10 inset-0 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <!-- modal -->
          <div class="inline-block align-bottom bg-gray-100 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg lg:max-w-2xl sm:w-full p-3">
            <div class="text-lg font-bold mb-2">
              Feriados
              <span class="float-right text-sm border border-gray-800 px-1.5 pb-1 hover:text-white hover:bg-gray-800 cursor-pointer" on:click={() => show_holidays = false}>&times;</span>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {#each fixed_holidays_dates as holiday}
                {#if holidays[holiday]}
                  <div class="p-1 bg-blue-100 rounded-md h-16">
                    <div>
                      {holiday}
                      <div class="float-right bg-white rounded-xl inline-block px-2 py-1 text-xs cursor-pointer hover:shadow-lg" on:click={() => confirm("Quer mesmo remover o feriado?") ? removeHoliday(holiday) : ''}>remover</div>
                    </div>
                    <div class="text-xs">{holidays[holiday]}</div>
                  </div>
                {:else}
                  <div class="p-1 bg-blue-300 rounded-md h-16">
                    <div>{holiday}</div>
                    <div class="text-xs">{NATIONAL_HOLIDAYS[holiday]}</div>
                  </div>
                {/if}
              {/each}
            </div>
            <div class="font-bold my-2">
              Feriados móveis
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {#each moving_holidays_dates as holiday}
                <div class="p-1 bg-blue-100 rounded-md h-16">
                  <div>
                    {holiday}
                    <div class="float-right bg-white rounded-xl inline-block px-2 py-1 text-xs cursor-pointer hover:shadow-lg" on:click={() => confirm("Quer mesmo remover o feriado?") ? removeHoliday(holiday) : ''}>remover</div>
                  </div>
                  <div class="text-xs">{holidays[holiday]}</div>
                </div>
              {/each}
            </div>
            <div class="font-bold my-2">
              Adicionar feriado
            </div>
            <div class="grid grid-cols-2 gap-2 p-2 border rounded-md shadow-lg bg-white">
              <div class="h-20">
                <label for="holiday_date" class="text-md block">Dia:</label>
                <input class="border p-2 w-full rounded-md" id="holiday_date" bind:value={start_date} type="date">
              </div>
              <div class="p-2 flex items-center justify-center">
                <Checkbox color_on="blue-500">
                  Feriado fixo
                </Checkbox>
              </div>
              <div>
                <label for="holiday_desc" class="text-md block">Descrição:</label>
                <input class="border p-2 w-full rounded-md" id="holiday_desc" type="text">
              </div>
              <div class="align-center">
                <label class="text-md block">&nbsp;</label>
                <div class="block w-full flex justify-center">
                  <button class="border p-2 px-12 bg-blue-200 rounded-md">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="overflow-x-auto mt-4">

      <table class="min-w-full border-2 border-green-900">
        <tr>
          <th class="border-2 border-green-900 p-1">Semana</th>
          {#each range(number_of_weeks) as week}
            <th class="border-2 border-green-900 p-1">{week + 1}</th>
          {/each}
          <th class="border-2 border-green-900 p-1">Feriados</th>
        </tr>
        {#each formatted_days as day, day_i}
          <tr>
            <td class="border-2 border-green-900 p-1">{WEEKDAYS[day_i]}</td>
            {#each day as working_day}
              {#if working_day.special}
                <td class="border-2 border-green-900 p-1 text-red-900 font-bold">{working_day.date} <br>({WEEKDAYS[myWeekDay(working_day.timestamp)]})</td>
              {:else}
                <td class="border-2 border-green-900 p-1">{working_day.date}</td>
              {/if}
            {/each}
            <td>
              {#if formatted_holidays[day_i].length}
                {#each formatted_holidays[day_i] as holiday}
                  <div>{formatDate(holiday.timestamp, false)}</div>
                {/each}
              {/if}
            </td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="text-lg">
      Último dia letivo: <span class="font-bold">{formatDate(end_timestamp)}</span>
    </div>
  </main>
</div>