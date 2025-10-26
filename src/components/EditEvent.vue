<template>
  <div class="edit-event-container">
    <div class="edit-event-box">
      <h1>Edit Event</h1>
      <form @submit.prevent="handleSubmit">
        <div class="input-field">
          <input type="text" v-model="eventData.name" placeholder="Event Name" required />
        </div>
        
        <div class="input-field">
          <textarea v-model="eventData.description" placeholder="Event Description" rows="4" required></textarea>
        </div>
        
        <div class="input-field">
          <input type="text" v-model="eventData.location" placeholder="Location" required />
        </div>
        
        <div class="input-row">
          <div class="input-field half">
            <label>Start Time</label>
            <input type="datetime-local" v-model="eventData.start" required />
          </div>
          <div class="input-field half">
            <label>Registration Closes</label>
            <input type="datetime-local" v-model="eventData.close_registration" required />
          </div>
        </div>
        
        <div class="input-field">
          <input type="number" v-model="eventData.max_attendees" placeholder="Maximum Attendees" min="1" required />
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="goBack">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update Event' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getEventApi, updateEventApi } from "@/api/api";
import { getToken } from "@/utils/auth";
import { filterProfanity } from "@/utils/profanityFilter";

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const eventData = ref({
  name: '',
  description: '',
  location: '',
  start: '',
  close_registration: '',
  max_attendees: ''
});

onMounted(() => {
  loadEvent();
});

const loadEvent = async () => {
  try {
    const eventId = route.query.id;
    if (!eventId) {
      router.push('/home');
      return;
    }
    
    const res = await getEventApi(eventId);
    if (res.event_id) {
      eventData.value = {
        name: res.name,
        description: res.description,
        location: res.location,
        start: convertTimestampToDatetimeLocal(res.start),
        close_registration: convertTimestampToDatetimeLocal(res.close_registration),
        max_attendees: res.max_attendees
      };
    }
  } catch (error) {
    console.error('Failed to load event:', error);
    alert('Failed to load event');
    router.back();
  }
};

const convertTimestampToDatetimeLocal = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp); // API returns timestamp in milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const handleSubmit = async () => {
  // Validate form
  if (!eventData.value.name.trim()) {
    alert('Please enter event name');
    return;
  }
  
  if (!eventData.value.description.trim()) {
    alert('Please enter event description');
    return;
  }
  
  if (!eventData.value.location.trim()) {
    alert('Please enter location');
    return;
  }
  
  if (!eventData.value.start) {
    alert('Please select start time');
    return;
  }
  
  if (!eventData.value.close_registration) {
    alert('Please select registration close time');
    return;
  }
  
  if (eventData.value.start <= eventData.value.close_registration) {
    alert('Registration close time must be before start time');
    return;
  }
  
  // Check if logged in
  const token = getToken();
  if (!token) {
    alert('Please login first');
    router.push('/login');
    return;
  }
  
  loading.value = true;
  
  try {
    const eventId = route.query.id;
    // Format data according to API
    const submitData = {
      name: filterProfanity(eventData.value.name.trim()),
      description: filterProfanity(eventData.value.description.trim()),
      location: filterProfanity(eventData.value.location.trim()),
      start: new Date(eventData.value.start).getTime(), // Convert to milliseconds timestamp
      close_registration: new Date(eventData.value.close_registration).getTime(),
      max_attendees: parseInt(eventData.value.max_attendees)
    };
    
    const res = await updateEventApi(eventId, submitData);
    console.log('Update event response:', res);
    
    alert('Event updated successfully!');
    router.push({
      path: '/event-detail',
      query: { id: eventId }
    });
  } catch (error) {
    console.error('Update event failed:', error);
    alert('Update failed: ' + (error.response?.data?.error_message || 'Network error'));
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.edit-event-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.edit-event-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.input-field {
  margin-bottom: 1rem;
}

.input-field input,
.input-field textarea {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.input-field textarea {
  border-radius: 10px;
  resize: vertical;
  min-height: 100px;
}

.input-field input:focus,
.input-field textarea:focus {
  border-color: rgb(150, 107, 193);
}

.input-field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: bold;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.input-field.half {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.6rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  min-width: 120px;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: rgb(150, 107, 193);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: rgb(130, 97, 173);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .edit-event-box {
    padding: 1rem;
    margin: 10px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .input-row {
    flex-direction: column;
    gap: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>

