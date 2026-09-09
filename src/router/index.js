import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'

import UnitView from '../views/UnitView.vue'

import UsersView from '../views/UsersView.vue'

import JadwalServiceView from '../views/JadwalServiceView.vue'
import JadwalServiceForm from '../views/JadwalServiceForm.vue'

import KeluhanView from '../views/KeluhanView.vue'
import KeluhanForm from '../views/KeluhanForm.vue'

import SparepartView from '../views/SparepartView.vue'

import GantiSparepartView from '../views/GantiSparepartView.vue'
import GantiSparepartForm from '../views/GantiSparepartForm.vue'

import EmisiKarbonView from '../views/EmisiKarbonView.vue'

import SpkView from '../views/SpkView.vue'
import SpkForm from '../views/SpkForm.vue'
import SpkDetailView from '../views/SpkDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [

    // =========================
    // LOGIN
    // =========================

    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView
    },

    // =========================
    // UNIT
    // =========================

    {
      path: '/unit',
      name: 'unit',
      component: UnitView
    },
    
    // =========================
    // USERS
    // =========================

    {
      path: '/users',
      name: 'users',
      component: UsersView
    },

    // =========================
    // JADWAL SERVICE
    // =========================

    {
      path: '/jadwal-service',
      name: 'jadwal-service',
      component: JadwalServiceView
    },

    {
      path: '/jadwal-service/tambah',
      name: 'jadwal-service-tambah',
      component: JadwalServiceForm
    },

    {
      path: '/jadwal-service/edit/:id',
      name: 'jadwal-service-edit',
      component: JadwalServiceForm
    },

    // =========================
    // SPK
    // =========================
    {
      path: '/spk',
      name: 'spk',
      component: SpkView
    },
    {
      path: '/spk/tambah',
      name: 'spk-tambah',
      component: SpkForm
    },
    {
      path: '/spk/edit/:id',
      name: 'spk-edit',
      component: SpkForm
    },
    {
      path: '/spk/:id',
      name: 'spk-detail',
      component: SpkDetailView
    },

    // =========================
    // KELUHAN
    // =========================

    {
      path: '/keluhan',
      name: 'keluhan',
      component: KeluhanView
    },

    {
      path: '/keluhan/tambah',
      name: 'keluhan-tambah',
      component: KeluhanForm
    },

    {
      path: '/keluhan/edit/:id',
      name: 'keluhan-edit',
      component: KeluhanForm
    },

    // =========================
    // SPAREPART
    // =========================

    {
      path: '/sparepart',
      name: 'sparepart',
      component: SparepartView
    },

    // =========================
    // GANTI SPAREPART
    // =========================

    {
      path: '/ganti-sparepart',
      name: 'ganti-sparepart',
      component: GantiSparepartView
    },

    {
      path: '/ganti-sparepart/tambah',
      name: 'ganti-sparepart-tambah',
      component: GantiSparepartForm
    },

    {
      path: '/ganti-sparepart/edit/:id',
      name: 'ganti-sparepart-edit',
      component: GantiSparepartForm
    },

    // =========================
    // EMISI KARBON
    // =========================

    {
      path: '/emisi-karbon',
      name: 'emisi-karbon',
      component: EmisiKarbonView
    }

  ]
})

export default router