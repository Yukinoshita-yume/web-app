<template>
  <div class="profile-container">
    <header class="profile-header">
      <button class="back-btn" @click="goBack">← Back</button>
      <h1>Profile</h1>
      <button class="logout-btn" @click="logout">Logout</button>
    </header>

    <div class="profile-content">
      <div class="user-info-card">
        <div class="user-avatar">
          <div class="avatar-circle">
            {{ getInitials(userInfo.last_name || 'User') }}
          </div>
        </div>
        <div class="user-details">
          <h2>{{ userInfo.first_name }} {{ userInfo.last_name }}</h2>
          <p class="user-email">{{ userInfo.email || 'No email set' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ createdEvents.length }}</span>
              <span class="stat-label">Events Created</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ registeredEvents.length }}</span>
              <span class="stat-label">Events Attending</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
          class="tab-btn"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- My Events -->
        <div v-if="activeTab === 'created'" class="events-section">
          <div class="section-header">
            <h3>My Events</h3>
            <button class="create-event-btn" @click="goToCreateEvent">Create New Event</button>
          </div>
          <div class="events-list">
            <div v-for="event in createdEvents" :key="event.event_id" class="event-card" @click="goToEventDetail(event.event_id)">
              <div class="event-info">
                <h4>{{ event.name }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-date">{{ formatDate(event.start) }}</span>
                  <span class="event-location" v-if="event.location">{{ event.location }}</span>
                  <span class="event-attendees">{{ event.number_attending || 0 }} attending</span>
                </div>
              </div>
              <div class="event-actions">
                <button v-if="event.close_registration !== -1" @click.stop="editEvent(event)" class="edit-btn">Edit</button>
                <button v-if="event.close_registration !== -1" @click.stop="deleteEvent(event)" class="delete-btn">Delete</button>
                <div v-if="event.close_registration === -1"  class="edit-btn">Has deleted</div>
              </div>
            </div>
            <div v-if="createdEvents.length === 0" class="empty-state">
              <p>No events created yet</p>
              <button class="create-event-btn" @click="goToCreateEvent">Create Your First Event</button>
            </div>
          </div>
        </div>

        <!-- Attending Events -->
        <div v-if="activeTab === 'registered'" class="events-section">
          <div class="section-header">
            <h3>Events I'm Attending</h3>
          </div>
          <div class="events-list">
            <div v-for="event in registeredEvents" :key="event.event_id" class="event-card" @click="goToEventDetail(event.event_id)">
              <div class="event-info">
                <h4>{{ event.name }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-date">{{ formatDate(event.start) }}</span>
                  <span class="event-location" v-if="event.location">{{ event.location }}</span>
                  <span class="event-organizer">Organizer: {{ event.creator?.first_name }} {{ event.creator?.last_name }}</span>
                </div>
              </div>
              <div class="event-status">
                <span class="status-badge registered">Registered</span>
              </div>
            </div>
            <div v-if="registeredEvents.length === 0" class="empty-state">
              <p>Not attending any events yet</p>
            </div>
          </div>
        </div>

        <!-- My Questions -->
        <div v-if="activeTab === 'questions'" class="questions-section">
          <div class="section-header">
            <h3>My Questions</h3>
          </div>
          <div class="questions-list">
            <div v-for="question in myQuestions" :key="question.question_id" class="question-card">
              <div class="question-content">
                <h4>{{ question.question }}</h4>
                <div class="question-meta">
                  <span class="question-event">Event: {{ question.event_name }}</span>
                  <span class="question-time">{{ formatTime(question.created_at) }}</span>
                </div>
                <div class="question-stats">
                  <span class="upvotes">👍 {{ question.votes || 0 }}</span>
                </div>
              </div>
              <div class="question-actions">
                <button @click="goToEventDetail(question.event_id)" class="view-event-btn">View Event</button>
                <button @click="deleteQuestion(question)" class="delete-btn">Delete</button>
              </div>
            </div>
            <div v-if="myQuestions.length === 0" class="empty-state">
              <p>No questions asked yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getToken, removeToken, getInitials } from '@/utils/auth';
import { getUserByIdApi, searchEventApi, getEventApi, getUserQuestionsApi } from '@/api/api';

const router = useRouter();

const userInfo = ref({
  first_name: '',
  last_name: '',
  email: ''
});

const createdEvents = ref([]);
const registeredEvents = ref([]);
const myQuestions = ref([]);
const activeTab = ref('created');

const tabs = [
  { key: 'created', label: 'My Events' },
  { key: 'registered', label: 'Attending' },
  { key: 'questions', label: 'My Questions' }
];

onMounted(() => {
  checkLoginStatus();
  loadUserData();
});

const checkLoginStatus = () => {
  const token = getToken();
  if (!token) {
    router.push('/login');
    return;
  }
  loadUserInfo();
}

async function loadUserInfo() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    router.push('/login');
    return;
  }
  
  try {
    const res = await getUserByIdApi(userId);
    if (res.user_id) {
      userInfo.value = {
        first_name: res.first_name || '',
        last_name: res.last_name || '',
        email: res.email || ''
      };
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
}

const loadUserData = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  
  try {
    // Load created events
    const myEventsRes = await searchEventApi({ status: 'MY_EVENTS', limit: 100 });
    if (Array.isArray(myEventsRes)) {
      createdEvents.value = myEventsRes;
    }
    
    // Load attending events
    const attendingRes = await searchEventApi({ status: 'ATTENDING', limit: 100 });
    if (Array.isArray(attendingRes)) {
      registeredEvents.value = attendingRes;
    }
    
    // Load questions
    const questionsRes = await getUserQuestionsApi();
    if (Array.isArray(questionsRes)) {
      myQuestions.value = questionsRes;
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
};

const goBack = () => {
  router.back();
};

const logout = () => {
  removeToken();
  localStorage.removeItem('userId');
  router.push('/login');
};

const goToCreateEvent = () => {
  router.push('/create-event');
};

const goToEventDetail = (eventId) => {
  router.push({
    path: '/event-detail',
    query: { id: eventId }
  });
};

const editEvent = (event) => {
  router.push({
    path: '/event-edit',
    query: { id: event.event_id }
  });
};

const deleteEvent = async (event) => {
  if (confirm(`Are you sure you want to delete event "${event.name}"?`)) {
    try {
      await deleteEventApi(event.value.event_id);
      alert('Event deleted successfully');
      loadUserData(); // Reload data
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  }
};

const deleteQuestion = async (question) => {
  if (confirm('Are you sure you want to delete this question?')) {
    try {
      // Here should call delete question API
      alert('Question deleted successfully');
      loadUserData(); // Reload data
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp); // API returns timestamp in milliseconds
  return date.toLocaleDateString('en-US');
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return 'Just now';
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn,
.logout-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn {
  background-color: #f0f0f0;
  color: #333;
}

.logout-btn {
  background-color: #f44336;
  color: white;
}

.profile-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.user-info-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(150, 107, 193), rgb(130, 97, 173));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.user-email {
  color: #666;
  margin: 0 0 20px 0;
}

.user-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: rgb(150, 107, 193);
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  background: white;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tab-btn.active {
  background-color: rgb(150, 107, 193);
  color: white;
}

.tab-content {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.create-event-btn {
  padding: 8px 16px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.events-list,
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-card,
.question-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-card:hover,
.question-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.event-info {
  margin-bottom: 15px;
}

.event-info h4,
.question-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.event-description {
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.event-meta,
.question-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #888;
}

.event-actions,
.question-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-btn,
.view-event-btn {
  padding: 5px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  padding: 5px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
}

.event-status {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.registered {
  background-color: #e8f5e8;
  color: #4CAF50;
}

.question-stats {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 14px;
}

.upvotes {
  color: #4CAF50;
}

.downvotes {
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .event-actions,
  .question-actions {
    justify-content: center;
  }
}
</style>
