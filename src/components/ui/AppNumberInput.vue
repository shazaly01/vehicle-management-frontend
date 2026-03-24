<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <InputNumber
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      @focus="handleFocus"
      :placeholder="placeholder"
      :required="required"
      :min-fraction-digits="minFractionDigits"
      :max-fraction-digits="maxFractionDigits"
      :suffix="suffix"
      :prefix="prefix"
      class="w-full"
      :pt="{
        root: { class: 'w-full inline-flex' },
        input: {
          root: {
            class: [
              // 1. التنسيقات الأساسية والحجم
              'block w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-200 font-sans',

              // 2. الوضع الفاتح (Light Mode)
              'bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',

              // 3. 🛑 الوضع الداكن (Dark Mode) 🛑
              'dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:placeholder-text-muted',
              'dark:focus:ring-primary dark:focus:border-primary',

              // 4. إخفاء أزرار الأسهم الافتراضية الخاصة بالمتصفح
              'appearance-none m-0',
            ],
          },
        },
      }"
    />
  </div>
</template>

<script setup>
import InputNumber from 'primevue/inputnumber'

defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [Number, null],
    default: null,
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  minFractionDigits: {
    type: Number,
    default: 0,
  },
  maxFractionDigits: {
    type: Number,
    default: 4,
  },
  suffix: {
    type: String,
    default: '',
  },
  prefix: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
const handleFocus = (event) => {
  // التأكد من أن العنصر المستهدف يدعم التظليل ثم تنفيذ الأمر
  if (event && event.target && typeof event.target.select === 'function') {
    event.target.select()
  }
}
</script>

<style scoped>
/* إخفاء أسهم الأرقام الافتراضية في المتصفحات التي قد تتجاهل كلاس appearance-none */
:deep(input[type='text']) {
  -moz-appearance: textfield;
}
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
