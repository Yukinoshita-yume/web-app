<template>
  <div class="event-detail-container">
    <header class="detail-header">
      <button class="back-btn" @click="goBack">← Back</button>
      <h1>{{ event.name || 'Event Details' }}</h1>
      <div v-if="event.close_registration !== -1" class="header-actions">
        <button v-if="isOrganizer" class="edit-btn" @click="editEvent">Edit</button>
        <button v-if="isOrganizer" class="delete-btn" @click="deleteEvent">Delete</button>
        <button v-if="!isOrganizer && !isRegistered" class="register-btn" @click="registerEvent">Register</button>
        <button v-if="!isOrganizer && isRegistered" class="unregister-btn" @click="unregisterEvent">Unregister</button>
      </div>
      <div v-if="event.close_registration === -1" class="header-actions">
        <button class="edit-btn">Has deleted</button>
      </div>
    </header>

    <div class="event-content">
      <div class="event-info">
        <div class="info-card">
          <h3>Event Information</h3>
          <div class="info-item">
            <span class="label">Description:</span>
            <span class="value">{{ event.description || 'No description' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Location:</span>
            <span class="value">{{ event.location || 'TBD' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Start Time:</span>
            <span class="value">{{ formatDateTime(event.start) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Registration Closes:</span>
            <span class="value">{{ formatDateTime(event.close_registration) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Maximum Attendees:</span>
            <span class="value">{{ event.max_attendees || 'Unlimited' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Current Attendees:</span>
            <span class="value">{{ event.number_attending || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">Organizer:</span>
            <span class="value">{{ event.creator?.first_name }} {{ event.creator?.last_name }}</span>
          </div>
        </div>
      </div>

      <div class="questions-section">
        <div class="questions-header">
          <h3>Questions & Discussion</h3>
          <button v-if="isRegistered" class="ask-btn" @click="showAskQuestion = true">Ask Question</button>
        </div>
        
        <div v-if="showAskQuestion" class="ask-question-form">
          <textarea v-model="newQuestion" placeholder="Enter your question..." rows="3"></textarea>
          <div class="form-actions">
            <button @click="submitQuestion" class="submit-btn">Submit</button>
            <button @click="cancelQuestion" class="cancel-btn">Cancel</button>
          </div>
        </div>

        <div class="questions-list">
          <div v-for="question in questions" :key="question.question_id" class="question-item">
            <button v-if="canDeleteQuestion(question)" @click="deleteQuestion(question.question_id)" class="delete-question-btn">
                Delete
              </button>
            <div class="question-content">
              <div class="question-text">{{ question.question }}</div>
              <div class="question-meta">
                <span class="author">Asked by: {{ question.asked_by?.first_name }} {{ question.asked_by?.last_name }}</span>
                <span class="time">{{ formatTime(question.created_at) }}</span>
              </div>
            </div>
            <div class="question-actions">
              <div class="heart-icon-circle">
                <div class="heart"><span style="z-index: 1;">{{ question.votes || 0 }}</span></div>
              </div>
              <button @click="upvoteQuestion(question.question_id)" class="vote-btn upvote">
                👍 
              </button>
              <button @click="downvoteQuestion(question.question_id)" class="vote-btn downvote">
                👎 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getEventApi, updateEventApi, deleteEventApi, registerEventApi, createQuestionApi, deleteQuestionApi, upvoteQuestionApi, downvoteQuestionApi } from '@/api/api';
import { getToken } from '@/utils/auth';
import { filterProfanity } from '@/utils/profanityFilter';

const router = useRouter();
const route = useRoute();

const event = ref({});
const questions = ref([]);
const loading = ref(true);
const showAskQuestion = ref(false);
const newQuestion = ref('');
const isRegistered = ref(false);
const isOrganizer = ref(false);

const canDeleteQuestion = (question) => {
  return isOrganizer.value || question.asked_by.user_id === getCurrentUserId();
};

const getCurrentUserId = () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    return JSON.parse(userId);
  }
  return null;
};

onMounted(() => {
  loadEventDetail();
});

const loadEventDetail = async () => {
  try {
    const eventId = route.query.id;
    if (!eventId) {
      router.push('/home');
      return;
    }
    
    const res = await getEventApi(eventId);
    console.log('Event detail:', res);
    
    if (res.event_id) {
      event.value = res;
      questions.value = res.questions || [];
      // Check if user is registered (this would need to be determined from the API response)
      isRegistered.value = (res.isAttending); // This should be set based on API response
      // Check if user is organizer
      isOrganizer.value = (res.creator.creator_id === getCurrentUserId()); // This should be set based on API response
    }
  } catch (error) {
    console.error('Failed to load event details:', error);
    alert('Failed to load event details');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const editEvent = () => {
  router.push({
    path: '/event-edit',
    query: { id: event.value.event_id }
  });
};

const deleteEvent = async () => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await deleteEventApi(event.value.event_id);
      alert('Event deleted successfully');
      router.push('/home');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  }
};

const registerEvent = async () => {
  try {
    await registerEventApi(event.value.event_id);
    alert('Registration successful!');
    isRegistered.value = true;
    event.value.number_attending = (event.value.number_attending || 0) + 1;
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed: ' + (error.response?.data?.error_message || 'Network error'));
  }
};

const unregisterEvent = async () => {
  if (confirm('Are you sure you want to unregister?')) {
    try {
      // This would need an unregister API endpoint
      alert('Unregistration successful!');
      isRegistered.value = false;
      event.value.number_attending = Math.max(0, (event.value.number_attending || 0) - 1);
    } catch (error) {
      console.error('Unregistration failed:', error);
      alert('Unregistration failed');
    }
  }
};

const submitQuestion = async () => {
  if (!newQuestion.value.trim()) {
    alert('Please enter question content');
    return;
  }
  
  try {
    await createQuestionApi(event.value.event_id, {
      question: filterProfanity(newQuestion.value)
    });
    alert('Question submitted successfully!');
    newQuestion.value = '';
    showAskQuestion.value = false;
    loadEventDetail(); // Reload questions list
  } catch (error) {
    console.error('Failed to submit question:', error);
    alert('Failed to submit question');
  }
};

const cancelQuestion = () => {
  newQuestion.value = '';
  showAskQuestion.value = false;
};

const upvoteQuestion = async (questionId) => {
  try {
    await upvoteQuestionApi(questionId);
    // Update local data
    const question = questions.value.find(q => q.question_id === questionId);
    if (question) {
      question.votes = (question.votes || 0) + 1;
    }
  } catch (error) {
    console.error('Failed to upvote:', error);
    alert(error.response?.data?.error_message || 'Failed to upvote question');
  }
};

const downvoteQuestion = async (questionId) => {
  try {
    await downvoteQuestionApi(questionId);
    // Update local data
    const question = questions.value.find(q => q.question_id === questionId);
    if (question) {
      question.downvotes = (question.downvotes || 0) + 1;
    }
  } catch (error) {
    console.error('Failed to downvote:', error);
    alert(error.response?.data?.error_message || 'Failed to downvote question');
  }
};

const deleteQuestion = async (questionId) => {
  if (confirm('Are you sure you want to delete this question?')) {
    try {
      await deleteQuestionApi(questionId);
      questions.value = questions.value.filter(q => q.question_id !== questionId);
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  }
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'TBD';
  if (timestamp === -1) return 'Deleted';
  const date = new Date(timestamp); // API returns timestamp in milliseconds
  return date.toLocaleString('en-US');
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
.event-detail-container {
  min-height: 100vh;
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.detail-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.register-btn {
  background-color: rgb(150, 107, 193);
  color: white;
}

.unregister-btn {
  background-color: #ff9800;
  color: white;
}

.event-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid rgb(150, 107, 193);
  padding-bottom: 10px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.label {
  font-weight: bold;
  min-width: 120px;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}

.questions-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.questions-header h3 {
  margin: 0;
  color: #333;
  border-bottom: 2px solid rgb(150, 107, 193);
  padding-bottom: 10px;
}

.ask-btn {
  padding: 8px 16px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.ask-question-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.ask-question-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit-btn {
  padding: 8px 16px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.question-item {
  position: relative;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.question-content {
  margin-bottom: 10px;
}

.question-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.question-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.question-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.vote-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.upvote {
  background-color: #e8f5e8;
  color: #4CAF50;
}

.downvote {
  background-color: #ffe8e8;
  color: #f44336;
}

.heart-icon-circle {

  height: 30px; 
  

  aspect-ratio: 1 / 1; 

  border-radius: 50%;
  background-color: #FADADD;
  

  display: grid;
  place-items: center;
}

.heart {
  position: relative;
  width: 60%;
  height: 55.5%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}


.heart::before,
.heart::after {
  content: '';
  position: absolute;
  top: 0;
  width: 52%; 
  height: 100%;
  background: rgba(255,255,255,1); 
  
  border-radius: 50% 50% 0 0;
}

.heart::before {
  left: 50%;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.heart::after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}
.delete-question-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 768px) {
  .event-content {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>
