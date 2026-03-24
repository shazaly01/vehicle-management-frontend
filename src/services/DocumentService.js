import apiClient from './apiClient'

const resource = '/documents'

export default {
  // جلب المستندات الخاصة بكيان معين
  get(target_type, target_id, page = 1) {
    return apiClient.get(resource, {
      params: {
        target_type: target_type,
        target_id: target_id,
        page: page,
      },
    })
  },

  // رفع ملف جديد (تمت إضافة onUploadProgress لربطه بشريط التحميل)
  upload(formData, onUploadProgress) {
    return apiClient.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress, // <--- السطر الجديد هنا
    })
  },

  // حذف مستند
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
