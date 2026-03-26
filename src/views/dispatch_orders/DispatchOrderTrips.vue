<template>
  <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
    <div
      class="bg-gray-700/50 px-5 py-3 flex justify-between items-center border-b border-gray-600"
    >
      <h3 class="text-white font-bold flex items-center gap-2">🚚 قائمة الشاحنات وتكاليف الملاك</h3>
      <button
        type="button"
        @click="addTripRow"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
      >
        + إضافة آلية
      </button>
    </div>

    <div class="max-h-[300px] overflow-y-auto">
      <table class="w-full text-right border-collapse text-sm">
        <thead class="sticky top-0 bg-gray-900 text-gray-400 text-xs z-10">
          <tr>
            <th class="p-3">الآلية (الشاحنة)</th>
            <th class="p-3 w-32">نوع الحساب</th>
            <th class="p-3 w-28">سعر المالك</th>
            <th class="p-3 w-24">الكمية</th>
            <th class="p-3 w-32">إجمالي المالك</th>
            <th class="p-3 w-10"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="(trip, index) in modelValue || []" :key="index" class="hover:bg-gray-700/20">
            <td class="p-2">
              <MachineriesDropdown
                v-model="trip.machinery_id"
                @update:modelValue="(val) => onMachinerySelect(index, val)"
                required
              />
            </td>
            <td class="p-2">
              <span
                v-if="trip.cost_type_label"
                class="bg-gray-700 text-indigo-300 px-2 py-1 rounded text-xs font-bold border border-indigo-500/30"
              >
                {{ trip.cost_type_label }}
              </span>
              <span v-else class="text-gray-600 text-xs">---</span>
            </td>
            <td class="p-2">
              <input
                type="number"
                v-model="trip.transport_unit_price"
                class="w-full bg-gray-900 border-gray-600 rounded p-2 text-amber-400 font-bold"
                placeholder="0.00"
              />
            </td>
            <td class="p-2">
              <div class="relative">
                <input
                  type="number"
                  v-model="trip.quantity"
                  class="w-full bg-gray-900 border-gray-600 rounded p-2 text-white pr-2"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </td>
            <td class="p-2 font-bold text-green-400">
              {{
                (
                  Number(trip.quantity || 0) * Number(trip.transport_unit_price || 0)
                ).toLocaleString()
              }}
            </td>
            <td class="p-2 text-center">
              <button
                type="button"
                @click="removeTripRow(index)"
                class="text-rose-500 hover:text-rose-400 text-xl"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="bg-gray-900/50 p-3 flex justify-end items-center gap-4 border-t border-gray-700 font-bold"
    >
      <span class="text-gray-400 text-xs">إجمالي تكاليف الملاك:</span>
      <span class="text-amber-500 text-lg">{{ calculatedTotalOwnersCost }} دينار</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMachineryStore } from '@/stores/machineryStore'
import MachineriesDropdown from '@/components/forms/MachineriesDropdown.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])
const machineryStore = useMachineryStore()

onMounted(async () => {
  // حماية إضافية من الـ store
  if (!machineryStore.machineries || machineryStore.machineries.length === 0) {
    await machineryStore.fetchMachineries()
  }
})

const addTripRow = () => {
  const newTrips = [...(props.modelValue || [])]
  newTrips.push({
    machinery_id: '',
    transport_unit_price: 0,
    quantity: 1,
    status: 'dispatched',
    cost_type_label: '',
  })
  emit('update:modelValue', newTrips)
}

const onMachinerySelect = (index, machineryId) => {
  const newTrips = [...(props.modelValue || [])]
  const machinery = machineryStore.machineries?.find((m) => m.id === machineryId)
  if (machinery) {
    newTrips[index].transport_unit_price = machinery.unit_price || 0
    newTrips[index].cost_type_label = machinery.cost_type_label || machinery.cost_type
  }
  emit('update:modelValue', newTrips)
}

const removeTripRow = (index) => {
  const newTrips = [...(props.modelValue || [])]
  newTrips.splice(index, 1)
  emit('update:modelValue', newTrips)
}

const calculatedTotalOwnersCost = computed(() => {
  const trips = props.modelValue || []
  const total = trips.reduce(
    (sum, trip) => sum + Number(trip.quantity || 0) * Number(trip.transport_unit_price || 0),
    0,
  )
  return total.toLocaleString()
})
</script>
