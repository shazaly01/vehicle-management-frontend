import { defineStore } from 'pinia'
import { ref } from 'vue'
import projectService from '@/services/ProjectService'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const pagination = ref({})
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  async function fetchProjects(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await projectService.get(page, search)
      projects.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات المشاريع.'
      console.error(err)
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id) {
    loading.value = true
    error.value = null
    currentProject.value = null
    try {
      const response = await projectService.find(id)
      currentProject.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المشروع.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await projectService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة المشروع.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await projectService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات المشروع.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null
    try {
      await projectService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المشروع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function handleServerErrors(err, defaultMessage) {
    if (err.response?.status === 422) {
      validationErrors.value = err.response.data.errors
      error.value = err.response.data.message || 'يوجد خطأ في البيانات المدخلة.'
    } else if (err.response?.status === 403) {
      error.value = 'عذراً، ليس لديك صلاحية للقيام بهذه العملية.'
    } else {
      error.value = err.response?.data?.message || defaultMessage
    }
    console.error(err)
  }

  return {
    projects,
    pagination,
    currentProject,
    loading,
    error,
    validationErrors,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
})
