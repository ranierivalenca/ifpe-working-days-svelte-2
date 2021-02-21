<script>
  import Checkbox from './Checkbox.svelte'

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let close = () => {
    dispatch('close')
  }

  let update = () => {
    holidays = holidays
    dispatch('update')
  }

  let remove = date => {
    holidays.remove(date)
    update()
  }

  let add = () => {
    if (!day || !description) {
      return
    }
    holidays.add(day, description, fixed)
    update()
  }

  export let holidays

  let day
  let description
  let fixed
</script>

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
        <span class="float-right text-sm border border-gray-800 px-1.5 pb-1 hover:text-white hover:bg-gray-800 cursor-pointer" on:click={close}>&times;</span>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {#each holidays.holidays.filter(h => h.fixed) as holiday}
          {#if !holiday.national}
            <div class="p-1 bg-blue-100 rounded-md h-16">
              <div>
                {holiday.day}
                <div class="float-right bg-white rounded-xl inline-block px-2 py-1 text-xs cursor-pointer hover:shadow-lg" on:click={() => confirm("Quer mesmo remover o feriado?") ? remove(holiday.day) : ''}>remover</div>
              </div>
              <div class="text-xs">{holiday.desc}</div>
            </div>
          {:else}
            <div class="p-1 bg-blue-300 rounded-md h-16">
              <div>{holiday.day}</div>
              <div class="text-xs">{holiday.desc}</div>
            </div>
          {/if}
        {/each}
      </div>
      <div class="font-bold my-2">
        Feriados móveis
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {#each holidays.holidays.filter(h => !h.fixed) as holiday}
          <div class="p-1 bg-blue-100 rounded-md h-16">
            <div>
              {holiday.day}
              <div class="float-right bg-white rounded-xl inline-block px-2 py-1 text-xs cursor-pointer hover:shadow-lg" on:click={() => confirm("Quer mesmo remover o feriado?") ? remove(holiday.day) : ''}>remover</div>
            </div>
            <div class="text-xs">{holiday.desc}</div>
          </div>
        {/each}
      </div>
      <div class="font-bold my-2">
        Adicionar feriado
      </div>
      <form class="grid grid-cols-2 gap-2 p-2 border rounded-md shadow-lg bg-white" on:submit|preventDefault={add}>
        <div class="h-20">
          <label for="holiday_date" class="text-md block">Dia:</label>
          <input class="border p-2 w-full rounded-md" id="holiday_date" type="date" bind:value={day}>
        </div>
        <div class="p-2 flex items-center justify-center">
          <Checkbox color_on="blue-500" bind:status={fixed}>
            Feriado fixo
          </Checkbox>
        </div>
        <div>
          <label for="holiday_desc" class="text-md block">Descrição:</label>
          <input class="border p-2 w-full rounded-md" id="holiday_desc" type="text" bind:value={description}>
        </div>
        <div class="align-center">
          <label class="text-md block">&nbsp;</label>
          <div class="block w-full flex justify-center">
            <button class="border p-2 px-12 bg-blue-200 rounded-md">Salvar</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>