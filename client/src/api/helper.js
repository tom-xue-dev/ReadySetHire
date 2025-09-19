// Import configuration from centralized config file
import { API_BASE_URL, API_TIMEOUT } from '../config/api.ts';

/**
 * Get the current JWT token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token') || '';
}

/**
 * Helper function to handle API requests with timeout and error handling.
 * It sets the Authorization token and optionally includes the request body.
 *
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object} [body=null] - The request body to send, typically for POST or PATCH.
 * @param {number} [timeout] - Request timeout in milliseconds (uses config default if not provided).
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK or request times out.
 */
export async function apiRequest(endpoint, method = 'GET', body = null, timeout = API_TIMEOUT) {
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const options = {
        method, // Set the HTTP method (GET, POST, PATCH)
        headers: {
            'Content-Type': 'application/json', // Indicate that we are sending JSON data
            'Authorization': `Bearer ${getAuthToken()}` // Include the JWT token for authentication
        },
        signal: controller.signal, // Add signal for timeout control
    };

    // If the method is POST or PATCH, we want the response to include the full representation
    if (method === 'POST' || method === 'PATCH') {
        options.headers['Prefer'] = 'return=representation';
    }

    // If a body is provided, add it to the request
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        // Make the API request and check if the response is OK
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        clearTimeout(timeoutId); // Clear timeout if request completes

        if (response.status === 204) {
            return null;
        }
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Return the response as a JSON object
        return response.json();
    } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error; // Re-throw other errors
    }
}

/**
 * Function to insert a new project into the database.
 *
 * @param {object} project - The project data to insert.
 * @returns {Promise<object>} - The created project object returned by the API.
 */
export async function createInterview(interview) {
    return apiRequest('/interview', 'POST', interview);
}

/**
 * Function to list all jobs.
 *
 * @returns {Promise<Array>} - An array of job objects.
 */
export async function getJobs() {
    const response = await apiRequest('/jobs');
    return response.data || [];
}

/**
 * Function to get a single job by its ID.
 *
 * @param {string} id - The ID of the job to retrieve.
 * @returns {Promise<object>} - The job object matching the ID.
 */
export async function getJob(id) {
    return await apiRequest(`/jobs/${id}`);
}

/**
 * Function to create a new job.
 *
 * @param {object} jobData - The job data to create.
 * @returns {Promise<object>} - The created job object.
 */
export async function createJob(jobData) {
    return await apiRequest('/jobs', 'POST', jobData);
}

/**
 * Function to update a job.
 *
 * @param {string} id - The ID of the job to update.
 * @param {object} jobData - The job data to update.
 * @returns {Promise<object>} - The updated job object.
 */
export async function updateJob(id, jobData) {
    return await apiRequest(`/jobs/${id}`, 'PATCH', jobData);
}

/**
 * Function to delete a job.
 *
 * @param {string} id - The ID of the job to delete.
 * @returns {Promise<void>} - No return value.
 */
export async function deleteJob(id) {
    return await apiRequest(`/jobs/${id}`, 'DELETE');
}

/**
 * Function to list all interviews associated with the current user.
 *
 * @returns {Promise<Array>} - An array of interview objects.
 */
export async function getInterviews() {
    const response = await apiRequest('/interviews');
    // New API returns {data: [], pagination: {}} format
    return response.data || [];
}

/**
 * Function to get a single project by its ID.
 * The url is slightly different from usual RESTFul ...
 * See the operators section https://docs.postgrest.org/en/v12/references/api/tables_views.html
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<object>} - The project object matching the ID.
 */
export async function getInterview(id) {
    return apiRequest(`/interview?id=eq.${id}`);
}

// Update interview by id (PostgREST style)
export async function updateInterview(id, data) {
    return apiRequest(`/interview?id=eq.${id}`, 'PATCH', data);
}

// Delete interview by id
export async function deleteInterview(id) {
    return apiRequest(`/interview?id=eq.${id}`, 'DELETE');
}

// Question APIs - Updated for new API format
export async function getQuestions(interviewId) {
    const response = await apiRequest(`/questions/interview/${interviewId}`);
    // New API returns {data: [], pagination: {}} format
    return response.data || [];
}

export async function createQuestion(question) {
    return apiRequest(`/question`, 'POST', question);
}

export async function updateQuestion(id, data) {
    return apiRequest(`/question?id=eq.${id}`, 'PATCH', data);
}

export async function deleteQuestion(id) {
    return apiRequest(`/question?id=eq.${id}`, 'DELETE');
}

// Applicants APIs (by interview) - Updated for new API format
export async function getApplicantsByInterview(interviewId) {
    const response = await apiRequest(`/applicants/interview/${interviewId}`);
    // New API returns {data: [], pagination: {}} format
    return response.data || [];
}

export async function createApplicant(applicant) {
    return apiRequest(`/applicant`, 'POST', applicant);
}

export async function updateApplicant(id, data) {
    return apiRequest(`/applicant?id=eq.${id}`, 'PATCH', data);
}

export async function deleteApplicant(id) {
    return apiRequest(`/applicant?id=eq.${id}`, 'DELETE');
}

// Applicant Answer APIs - Updated for new API format
export async function getAnswersByApplicant(applicantId) {
    const response = await apiRequest(`/applicant_answers/applicant/${applicantId}`);
    // New API returns {data: [], pagination: {}} format
    return response.data || [];
}

export async function createApplicantAnswer(answer) {
    return apiRequest(`/applicant_answer`, 'POST', answer);
}

export async function updateApplicantAnswer(id, data) {
    return apiRequest(`/applicant_answer?id=eq.${id}`, 'PATCH', data);
}

// Health check endpoint for connection testing
export async function healthCheck() {
    try {
        // Create a controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        // Try a simple endpoint that should always be available
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Connection timeout - server is not responding');
        }
        throw new Error(`Connection failed: ${error.message}`);
    }
}

/**
 * Main function to demonstrate API usage.
 *
 * Creates a new interview, lists all interviews, and retrieves a single interview by ID.
 */
async function main() {
    try {
        // Create a new interview with specific details
        const newInterview = {
            title: 'Front-end Developer Interview',
            job_role: 'Mid-level Front-end Developer',
            description: 'Interview focusing on React, JavaScript fundamentals, and responsive design principles.',
            status: 'Draft', // The interview is not published initially (Draft status)
        };
        const createdInterview = await createInterview(newInterview);
        console.log('Created Interview:', createdInterview);

        // Retrieve and list all interviews associated with your account
        const allInterviews = await getInterviews();
        console.log('All Interviews:', allInterviews);

        // If there are interviews, retrieve the first one by its ID
        if (allInterviews.length > 0) {
            const singleInterview = await getInterview(allInterviews[0].id);
            console.log('Single Interview:', singleInterview);
        }

        // Further functionality for other endpoints like /question can be added here...

    } catch (error) {
        console.error('Error:', error.message); // Log any errors that occur
    }
}

// Do not auto-execute in browser/react environment
// main();
