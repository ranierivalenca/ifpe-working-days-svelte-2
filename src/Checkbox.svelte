<script>
  export let status = false
  export let color_on = 'bg-green-500'
  export let color_off = 'bg-gray-500'
  export let disabled = false
</script>


<label class="relative pr-2">
  <!-- Hack for tailwind build (this is about how tailwind purge works) -->
  <span class="left-1 right-1"></span>
  <input type="checkbox" class="hidden" disabled="{disabled}" bind:checked="{status}" />

  <div class="absolute bg-gray-400 opacity-50 w-full h-full rounded-full z-10" class:hidden={!disabled}></div>

  <div class="flex cursor-pointer">
    <slot></slot>
    <div class="h-6 w-14 flex items-center relative ml-2">
      <div class="bg-gray-300 rounded-full w-14 h-6">
      </div>
      <div
        class="w-5 h-5 {status ? `${color_on}` : `${color_off}`} rounded-full absolute"
        class:left-1={status}
        class:right-1={!status}
      >
      </div>
    </div>

  </div>
</label>