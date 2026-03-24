import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '@/services/SupplierService'

export const useSupplierStore = defineStore('supplier', () => {
  // --- State ---
  const suppliers = ref([])
  const pagination = ref({})
  const currentSupplier = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({}) // إضافة هامة جداً لالتقاط أخطاء الـ Validation من لارافيل

  // --- Actions ---
  async function fetchSuppliers(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await supplierService.get(page, search)
      suppliers.value = response.data.data
      // إذا كنت تستخدم Laravel Resources فهذا هو المسار الصحيح للـ Meta
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات الموردين.'
      console.error(err)
      suppliers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplier(id) {
    loading.value = true
    error.value = null
    currentSupplier.value = null
    try {
      const response = await supplierService.find(id)
      currentSupplier.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المورد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createSupplier(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {} // تصفير الأخطاء السابقة
    try {
      await supplierService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة المورد.')
      throw err // إعادة رمي الخطأ للواجهة
    } finally {
      loading.value = false
    }
  }

  async function updateSupplier(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await supplierService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات المورد.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplier(id) {
    loading.value = true
    error.value = null
    try {
      await supplierService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Helper Function ---
  // دالة مساعدة مركزية للتعامل مع استجابات الخطأ من السيرفر
  function handleServerErrors(err, defaultMessage) {
    if (err.response?.status === 422) {
      // أخطاء التحقق من البيانات (Validation Errors)
      validationErrors.value = err.response.data.errors
      error.value = err.response.data.message || 'يوجد خطأ في البيانات المدخلة.'
    } else if (err.response?.status === 403) {
      error.value = 'عذراً، ليس لديك صلاحية للقيام بهذه العملية.'
    } else {
      error.value = err.response?.data?.message || defaultMessage
    }
    console.error(err)
  }

  // --- Return public API ---
  return {
    suppliers,
    pagination,
    currentSupplier,
    loading,
    error,
    validationErrors,
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
})
