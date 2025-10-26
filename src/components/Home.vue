<template>
  <header>
    <div id="select-box">
      <input
        type="search"
        id="search"
        v-model="searchQuery"
        placeholder="Search events..."
        autocomplete="off"
        @keyup.enter="search"
      />
      <div id="search-icon" @click="search"></div>
    </div>
    <div id="filter-box">
      <select v-model="statusFilter" @change="loadEvents" class="filter-select">
        <option value="">All Events</option>
        <option value="OPEN">Open for Registration</option>
        <option value="ARCHIVE">Past Events</option>
        <option v-if="hasLogin" value="MY_EVENTS">My Events</option>
        <option v-if="hasLogin" value="ATTENDING">Attending</option>
      </select>
    </div>
    <button v-if="hasLogin" class="create-event-header-btn" @click="goToCreateEvent">Create Event</button>
    <div id="user" v-if="hasLogin" @click="goToUser()"></div>
    <div id="user-login" v-if="!hasLogin&&!loading" @click="goToLogin()"></div>
  </header>
  
  <div id="items-box">
    <div
      class="item-box"
      v-for="event in events"
      :key="event.event_id"
      @click="goToDetail(event.event_id)"
    >
      <div class="main-part">
        <div class="left-part">
          <div class="name-part">{{ event.name }}</div>
          <div class="config-part">
            <div v-if="event.location">
              Location: {{ event.location }}&nbsp;&nbsp;|&nbsp;&nbsp;
            </div>
            <div>Start: {{ formatDate(event.start) }}</div>
          </div>
        </div>
        <div class="right-part">
          <div class="item-user"></div>
          <p>{{ event.creator?.first_name }} {{ event.creator?.last_name }}</p>
        </div>
      </div>
      <div class="tags-part">
        <div v-if="event.max_attendees">Max {{ event.max_attendees }} attendees</div>
        <div v-if="event.close_registration">Registration closes: {{ formatDate(event.close_registration) }}</div>
      </div>
    </div>
    <div id="empty-item" v-if="events.length % 2"></div>
    <div class="loadingPage" v-if="loading">Loading...</div>
  </div>
  
  <div id="page-select-box">
    <div id="page-buttons-box">
      <button @click="prevPage()" :disabled="page === 1"><</button>
      <button
        v-for="item in pages"
        :key="item"
        @click="goToPage(item)"
        :class="{ active: item === page }"
      >
        {{ item }}
      </button>
      <button
        @click="nextPage()"
        :disabled="page === totalPages || total === 0"
      >
        >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { searchEventApi, countEventApi } from "@/api/api";
import { removeToken, getToken } from "@/utils/auth";

const router = useRouter();
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("");
const page = ref(1);
const pageSize = ref(10);
const hasLogin = ref(false);
const total = ref(0);
const events = ref([]);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
const pages = computed(() => {
  const range = 2;
  const start = Math.max(1, page.value - range);
  const end = Math.min(totalPages.value, page.value + range);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const search = () => {
  console.log(searchQuery.value);
  loadEvents();
};

const goToPage = (item) => {
  page.value = item;
};

const prevPage = () => {
  if (page.value != 1) page.value--;
};

const nextPage = () => {
  if (page.value != totalPages.value) page.value++;
};

const goToLogin = () => {
  router.push("/login");
};

const goToUser = () => {
  router.push("/profile");
};

const goToCreateEvent = () => {
  router.push("/create-event");
};

const goToDetail = (eventId) => {
  router.push({
    path: "/event-detail",
    query: { id: eventId },
  });
};


const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp); // API returns timestamp in milliseconds
  return date.toLocaleDateString('en-US');
};

const keyEnter = (event) => {
  if (event.key === "Enter") {
    search();
  }
};

onMounted(() => {
  loadEvents();
  checkLoginStatus();
});

window.addEventListener("keydown", keyEnter);

watch([page, pageSize], ([newPage, newPageSize], [oldPage, oldPageSize]) => {
  console.log("page 变化：", newPage);
  loadEvents();
});

async function loadEvents() {
  try {
    loading.value = true;
    const params = {
      q: searchQuery.value,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value
    };
    // Add status filter if selected
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    // Load events
    const res = await searchEventApi(params);
    console.log(res);
    if (Array.isArray(res)) {
      events.value = res;
    } else {
      events.value = [];
    }
    
    // Load count
    const countParams = {
      q: searchQuery.value
    };
    if (statusFilter.value) {
      countParams.status = statusFilter.value;
    }
    const countRes = await countEventApi(countParams);
    if (countRes.event_count !== undefined) {
      total.value = countRes.event_count;
    }
    
    loading.value = false;
  } catch (error) {
    console.error("Search failed:", error);
    events.value = [];
    total.value = 0;
    loading.value = false;
  }
}

function checkLoginStatus() {
  const token = getToken();
  hasLogin.value = !!token;
}
</script>

<style scoped>
div {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

header {
  display: flex;
  position: fixed;
  align-items: center;
  width: 100%;
  height: 100px;
  z-index: 10;
  background: linear-gradient(
    to top,
    rgba(248, 237, 226, 1),
    rgba(255, 240, 221, 1)
  );
}

#select-box {
  display: flex;
  position: absolute;
  left: 20%;
  width: 40%;
  height: 50%;
}

#filter-box {
  display: flex;
  position: absolute;
  right: 250px;
  width: 180px;
  height: 50%;
}

.filter-select {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: none;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 1);
  outline: none;
  font-size: 14px;
  cursor: pointer;
}

#user,
#user-login {
  display: flex;
  position: absolute;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  right: 50px;
  background-repeat: no-repeat;
  background-position: center;
}

#user {
  background-size: 90%;
  background-image: url(../assets/user.svg);
}

#user-login {
  background-size: cover;
  background-image: url(../assets/login.svg);
}

#search {
  border: none;
  display: flex;
  padding-inline-start: 25px;
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
  background-color: rgba(255, 255, 255, 1);
  outline: none;
  box-sizing: border-box;
  flex: 1;
  font-size: 16px;
  text-overflow: ellipsis;
  min-width: 0;
}

input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

#search-icon {
  height: 100%;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
  width: 60px;
  background-color: rgba(255, 255, 255, 1);
  background-image: url(../assets/search.svg);
  background-size: 60%;
  background-repeat: no-repeat;
  background-position: 0, center;
}

#items-box {
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 100px;
  justify-content: center;
}

.item-box {
  display: flex;
  width: 40%;
  height: 200px;
  flex-direction: column;
  margin: 10px;
  background-color: rgba(248, 255, 255, 0.3);
  border-radius: 10px;
}

.item-box:hover {
  position: relative;
  top: -5px;
  left: -5px;
  box-shadow: 5px 5px 5px 0 rgba(225, 214, 240, 1);
}

#empty-item {
  border: none;
  display: flex;
  width: 40%;
  height: 200px;
  margin: 10px;
}

.main-part {
  display: flex;
  height: 160px;
  width: 100%;
}

.tags-part {
  display: flex;
  height: 40px;
  width: 100%;
  padding-inline-start: 16px;
}

.tags-part div {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 40px;
  margin-right: 16px;
}

.left-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  container-type: inline-size;
  flex: 1;
}

.right-part {
  display: flex;
  width: 100px;
  font-size: 18px;
  color: rgba(240, 135, 132, 0.6);
  flex-direction: column;
  align-items: center;
}

.right-part p {
  margin-top: 20px;
}

.item-user {
  display: flex;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  right: 50px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 90%;
  background-image: url(../assets/user.svg);
}

.name-part {
  padding-inline-start: 16px;
  padding-inline-end: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100cqw;
  font-size: 24px;
}

.config-part {
  padding-inline-start: 16px;
  color: gray;
  width: 100%;
}

#page-select-box {
  display: flex;
  height: 60px;
  justify-content: center;
}

#page-buttons-box {
  display: flex;
  align-items: center;
}

#page-buttons-box button {
  border: 0;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  margin: 5px;
}

#page-buttons-box button:disabled:hover {
  background-color: initial;
  color: initial;
}

#page-buttons-box button.active,
#page-buttons-box button:hover {
  background-color: rgba(177, 211, 203, 1);
  color: #fff;
}

#page-buttons-box button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.loadingPage{
  display: flex;
  height: 600px;
  width: 100%;
  max-width: 1200px;
  color: #999;
  font-size: 4.2em;
  font-style: italic;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

@media (max-width: 750px) {
  #user {
    right: 25px;
  }
  .item-box {
    width: 100%;
    margin: 10px 30px;
  }
}

#select-box {
  left: 20%;
  width: 40%;
}

.create-event-header-btn {
  position: absolute;
  left: 150px;
  top: 30%;
  padding: 8px 16px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.create-event-header-btn:hover {
  transform: scale(1.05);
  background-color: rgb(130, 97, 173);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.create-event-header-btn:active {
  transform: scale(0.98);
}
</style>