import { defineStore } from 'pinia'
import { ref } from 'vue'
import documentService from '@/services/DocumentService'

export const useDocumentStore = defineStore('document', () => {
  const documents = ref([])
  const pagination = ref({})
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})
  const uploadProgress = ref(0) // <--- جديد: مطلوب لواجهة الـ Form

  // جلب المستندات (تم ترتيب المعاملات لتناسب النافذة Modal)
  async function fetchDocuments(target_id, target_type, page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await documentService.get(target_type, target_id, page)
      documents.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب المرفقات.'
      console.error(err)
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  // رفع مستند جديد (تم تغيير الاسم لـ createDocument ليتطابق مع الـ Modal)
  async function createDocument(formData) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    uploadProgress.value = 0

    try {
      const response = await documentService.upload(formData, (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      })

      // التحديث المباشر للواجهة: إضافة المستند فوراً للمصفوفة بدون جلبها من جديد
      if (response.data && response.data.data) {
        documents.value.unshift(response.data.data)
      }
    } catch (err) {
      handleServerErrors(err, 'فشل في رفع المستند.')
      throw err // لكي يظهر إشعار الخطأ في الواجهة
    } finally {
      loading.value = false
      setTimeout(() => (uploadProgress.value = 0), 1000) // تصفير شريط التقدم بعد ثانية
    }
  }

  // حذف مستند
  async function deleteDocument(id) {
    loading.value = true
    error.value = null
    try {
      await documentService.delete(id)
      // التحديث المباشر للواجهة: حذف المستند من المصفوفة المحلية فوراً
      documents.value = documents.value.filter((doc) => doc.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المستند.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function handleServerErrors(err, defaultMessage) {
    if (err.response?.status === 422) {
      validationErrors.value = err.response.data.errors
      error.value = err.response.data.message || 'يوجد خطأ في الملف المرفوع.'
    } else if (err.response?.status === 403) {
      error.value = 'عذراً، ليس لديك صلاحية للقيام بهذه العملية.'
    } else if (err.response?.status === 413) {
      error.value = 'حجم الملف كبير جداً يتجاوز الحد المسموح به في السيرفر.'
    } else {
      error.value = err.response?.data?.message || defaultMessage
    }
    console.error(err)
  }

  return {
    documents,
    pagination,
    loading,
    error,
    validationErrors,
    uploadProgress,
    fetchDocuments,
    createDocument, // تأكدنا من تصديرها بالاسم الذي تتوقعه الواجهة
    deleteDocument,
  }
})
