<script>
  import Tailwindcss from './Tailwind.svelte'
  import Checkbox from './Checkbox.svelte'
  import HolidaysModal from './HolidaysModal.svelte'
  import Calendar from './Calendar.svelte'

  import WorkingDays from './WorkingDays'
  import Holidays from './Holidays'


  import utils from './utils'
  const range = utils.range
  const weekDay = utils.weekDay
  const formatDate = utils.formatDate
  const WEEKDAYS = utils.WEEKDAYS

  let holidays = new Holidays(JSON.parse(localStorage.getItem('holidays')) ?? [])
  // let holidays = new Holidays()
  let workingDays = new WorkingDays(holidays)

  let show_holidays = false
  let show_calendar = false

  let update = (day = null) => {
    workingDays.setStartDay(day)
    workingDays = workingDays
    localStorage.setItem('holidays', JSON.stringify(holidays.holidays))
    localStorage.setItem('start_date', workingDays.start_date)
  }

  update(localStorage.getItem('start_date'))

  $:(() => {
    update()
  })(workingDays.start_date, workingDays.saturdays)

</script>

<Tailwindcss />

<div class="flex flex-col justify-between max-w-7xl bg-gray-100 m-auto min-h-screen">
  <nav class="p-2 py-4 bg-green-600">
    <h1 class="text-xl text-white">Dias Letivos</h1>
  </nav>

  <main class="p-2 mb-auto">
    <div class="border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-3">
      <div>
        <label for="start_date" class="text-sm block">Dia Inicial:</label>
        <input id="start_date" bind:value={workingDays.start_date} type="date">
      </div>

      <div class="flex items-center">
        <Checkbox bind:status={workingDays.saturdays}>
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
      <HolidaysModal
        bind:holidays={holidays}
        on:close={() => show_holidays = false}
        on:update={() => update()}
      />
    {/if}

    <div class="overflow-x-auto mt-4">
      <table class="min-w-full border-2 border-green-900">
        <tr>
          <th class="border-2 border-green-900 p-1">Semana</th>
          {#each range(workingDays.number_of_weeks) as week}
            <th class="border-2 border-green-900 p-1">{week + 1}</th>
          {/each}
          <th class="border-2 border-green-900 p-1">Feriados</th>
        </tr>
        {#each workingDays.weekdays as weeks, day}
          <tr>
            <td class="border-2 border-green-900 p-1">{WEEKDAYS[day]}</td>
            {#each weeks as working_day}
              {#if working_day.special}
                <td class="border-2 border-green-900 p-1 text-red-900 font-bold">{working_day.date} <br>({WEEKDAYS[weekDay(working_day.timestamp)]})</td>
              {:else}
                <td class="border-2 border-green-900 p-1">{working_day.date}</td>
              {/if}
            {/each}
            <td class="border-2 border-green-900 p-1">
              {#each workingDays.weekdays_holidays[day] as holiday}
                <div>{formatDate(holiday.timestamp, false)}</div>
              {/each}
            </td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="text-lg">
      Último dia letivo: <span class="font-bold">{workingDays.last_day.date}</span>
    </div>

    <div class="bg-gray-200 border border-gray-200">
      <h1 class="text-xl p-2 cursor-pointer hover:bg-gray-300" on:click={() => show_calendar = !show_calendar}>Calendário</h1>
      <div class="bg-white p-2" class:hidden={!show_calendar}>
        <Calendar bind:working_days={workingDays} />
      </div>
    </div>
  </main>




  <footer class="bg-green-900 text-white h-16 p-4 flex items-center text-xs">
    <div class="flex justify-between w-full">
      <div>Made by <a href="https://github.com/ranierivalenca" class="font-bold">Ranieri Valença</a></div>
      <div>
        <p>
          Powered by
          <a href="https://svelte.dev" class="font-bold"><img alt="svelte icon" src="https://svelte.dev/favicon.png" class="inline h-5"> Svelte</a> and
          <a href="https://tailwindcss.com" class="font-bold"><img alt="tailwind icon" src="https://tailwindcss.com/favicon-32x32.png" class="inline h-5"> Tailwindcss</a>
        </p>
        <p>
          Hosted on
          <a href="https://vercel.com" class="font-bold"><img alt="vercel icon" src="https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/57x57.png" class="inline h-5">  Vercel</a>
        </p>
      </div>
      <div>
        Available on <a href="https://github.com/ranierivalenca/ifpe-working-days-svelte-2" class="font-bold">github.com</a>
      </div>
    </div>
  </footer>
</div>