<script setup>
import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter
} from 'vue-router'

import { computed, ref } from 'vue'

import Toast from './components/Toast.vue'
import { useToast } from './composables/useToast'


// =========================
// TOAST
// =========================

const { show, message, type } = useToast()


// =========================
// ROUTER
// =========================

const route = useRoute()
const router = useRouter()


// =========================
// USER LOGIN
// =========================

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
})

const role = computed(() => {
  return currentUser.value?.role?.toLowerCase() || ''
})

const isAdmin = computed(() => {
  return role.value === 'admin'
})

const isUid = computed(() => {
  return role.value === 'uid'
})

const isDriver = computed(() => {
  return role.value === 'driver'
})

const isLoginPage = computed(() => {
  return route.name === 'login'
})


// =========================
// SIDEBAR
// =========================

const sidebarOpen = ref(false)

const closeSidebar = () => {
  sidebarOpen.value = false
}


// =========================
// LOGOUT
// =========================

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  sidebarOpen.value = false

  router.push('/login')
}
</script>


<template>

  <div id="app">

    <!-- ========================= -->
    <!-- SIDEBAR -->
    <!-- ========================= -->

    <template v-if="!isLoginPage">

      <!-- HAMBURGER -->

      <button
        class="hamburger"
        @click="sidebarOpen = !sidebarOpen"
        aria-label="Buka menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      <!-- OVERLAY -->

      <div
        v-if="sidebarOpen"
        class="overlay"
        @click="closeSidebar"
      ></div>


      <!-- SIDEBAR -->

      <aside
        class="sidebar"
        :class="{ open: sidebarOpen }"
      >

        <!-- HEADER -->

        <div class="sidebar-header">

          <h1>
            EV Monitoring
          </h1>

        </div>


        <!-- NAVIGATION -->

        <nav class="sidebar-nav">

          <!-- ========================= -->
          <!-- ADMIN -->
          <!-- ========================= -->

          <template v-if="isAdmin">

            <RouterLink
              to="/unit"
              @click="closeSidebar"
            >
              Unit
            </RouterLink>

            <RouterLink
              to="/users"
              @click="closeSidebar"
            >
              Users
            </RouterLink>

            <RouterLink
              to="/jadwal-service"
              @click="closeSidebar"
            >
              Jadwal Service
            </RouterLink>

            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
            >
              Keluhan
            </RouterLink>

            <RouterLink
              to="/sparepart"
              @click="closeSidebar"
            >
              Sparepart
            </RouterLink>

            <RouterLink
              to="/ganti-sparepart"
              @click="closeSidebar"
            >
              Ganti Sparepart
            </RouterLink>

            <RouterLink
              to="/emisi-karbon"
              @click="closeSidebar"
            >
              Emisi Karbon
            </RouterLink>

          </template>


          <!-- ========================= -->
          <!-- UID -->
          <!-- ========================= -->

          <template v-else-if="isUid">

            <RouterLink
              to="/unit"
              @click="closeSidebar"
            >
              Unit
            </RouterLink>

            <RouterLink
              to="/users"
              @click="closeSidebar"
            >
              Users
            </RouterLink>

            <RouterLink
              to="/jadwal-service"
              @click="closeSidebar"
            >
              Jadwal Service
            </RouterLink>

            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
            >
              Keluhan
            </RouterLink>

            <RouterLink
              to="/sparepart"
              @click="closeSidebar"
            >
              Sparepart
            </RouterLink>

            <RouterLink
              to="/ganti-sparepart"
              @click="closeSidebar"
            >
              Ganti Sparepart
            </RouterLink>

            <RouterLink
              to="/emisi-karbon"
              @click="closeSidebar"
            >
              Emisi Karbon
            </RouterLink>

          </template>


          <!-- ========================= -->
          <!-- DRIVER -->
          <!-- ========================= -->

          <template v-else-if="isDriver">

            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
            >
              Keluhan
            </RouterLink>

          </template>

        </nav>


        <!-- ========================= -->
        <!-- SIDEBAR FOOTER -->
        <!-- ========================= -->

        <div class="sidebar-footer">

          <div
            v-if="currentUser"
            class="user-info"
          >

            <div class="user-name">
              {{ currentUser.namaLengkap || currentUser.username }}
            </div>

            <span class="role-badge">
              {{ currentUser.role }}
            </span>

          </div>


          <button
            @click="handleLogout"
            class="logout-btn"
          >
            Logout
          </button>

        </div>

      </aside>

    </template>


    <!-- ========================= -->
    <!-- MAIN CONTENT -->
    <!-- ========================= -->

    <main
      :class="{
        'full-width': isLoginPage
      }"
    >
      <RouterView />
    </main>


    <!-- ========================= -->
    <!-- TOAST -->
    <!-- ========================= -->

    <Toast
      :show="show"
      :message="message"
      :type="type"
    />

  </div>

</template>


<style>

* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

body {
  margin: 0;
}

</style>


<style scoped>

#app {
  display: flex;
  min-height: 100vh;
}


/* =========================
   HAMBURGER
========================= */

.hamburger {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 60;

  background: #1e2a3a;
  border: none;
  border-radius: 8px;

  width: 42px;
  height: 42px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 4px;
  cursor: pointer;
}

.hamburger span {
  width: 20px;
  height: 2px;

  background: white;
  border-radius: 2px;
}


/* =========================
   OVERLAY
========================= */

.overlay {
  display: none;
}


/* =========================
   SIDEBAR
========================= */

.sidebar {
  width: 240px;

  background-color: #1e2a3a;

  display: flex;
  flex-direction: column;

  position: sticky;
  top: 0;

  height: 100vh;

  flex-shrink: 0;
}


/* =========================
   SIDEBAR HEADER
========================= */

.sidebar-header {
  padding: 24px 20px;

  border-bottom: 1px solid
    rgba(255, 255, 255, 0.08);
}

.sidebar-header h1 {
  color: white;

  font-size: 18px;
  margin: 0;
}


/* =========================
   NAVIGATION
========================= */

.sidebar-nav {
  flex: 1;

  display: flex;
  flex-direction: column;

  padding: 16px 12px;

  gap: 4px;
}

.sidebar-nav a {
  color: #b8c4d4;

  text-decoration: none;

  font-weight: 500;
  font-size: 14px;

  padding: 10px 14px;

  border-radius: 8px;

  transition: all 0.2s;
}

.sidebar-nav a:hover {
  background-color:
    rgba(74, 158, 235, 0.12);

  color: white;
}

.sidebar-nav a.router-link-active {
  background-color: #4a9eeb;
  color: white;
}


/* =========================
   SIDEBAR FOOTER
========================= */

.sidebar-footer {
  padding: 16px 20px;

  border-top: 1px solid
    rgba(255, 255, 255, 0.08);
}

.user-info {
  margin-bottom: 12px;
}

.user-name {
  color: white;

  font-size: 14px;
  font-weight: 600;

  margin-bottom: 4px;
}

.role-badge {
  background-color: #4a9eeb;

  color: white;

  padding: 2px 10px;

  border-radius: 12px;

  font-size: 11px;
  font-weight: 600;

  text-transform: uppercase;
}


/* =========================
   LOGOUT
========================= */

.logout-btn {
  width: 100%;

  background-color:
    rgba(231, 76, 60, 0.15);

  color: #ff6b5c;

  border: none;

  padding: 9px;

  border-radius: 8px;

  cursor: pointer;

  font-weight: 600;

  font-family: inherit;

  transition:
    background-color 0.2s;
}

.logout-btn:hover {
  background-color:
    rgba(231, 76, 60, 0.25);
}


/* =========================
   MAIN
========================= */

main {
  flex: 1;

  padding: 32px 40px;

  background-color: #f7fafd;

  min-height: 100vh;

  min-width: 0;
}

main.full-width {
  padding: 0;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 768px) {

  .hamburger {
    display: flex;
  }

  .sidebar {
    position: fixed;

    left: -260px;
    top: 0;

    height: 100vh;

    z-index: 50;

    transition:
      left 0.25s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .overlay {
    display: block;

    position: fixed;

    inset: 0;

    background:
      rgba(0, 0, 0, 0.4);

    z-index: 40;
  }

  main {
    padding: 70px 16px 24px;

    width: 100%;
  }

}

</style>