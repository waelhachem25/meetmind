export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5237";

export type Meeting = {
  id: number;
  title: string;
  dateUtc: string;
  status: number;
  createdAt: string;
  transcript?: Transcript;
  minutes?: Minutes;
};

export type Transcript = {
  id: number;
  meetingId: number;
  version: number;
  text: string;
  isEdited: boolean;
  editedAt?: string;
};

export type ActionItem = {
  id: number;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: number;
};

export type Subscription = {
  plan: string;
  status: string;
  meetingsThisMonth: number;
  meetingsLimit: number;
  meetingsRemaining: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  isUnlimited: boolean;
};

export type Minutes = {
  id: number;
  meetingId: number;
  version: number;
  agenda: string[];
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
};

export const MeetingStatus = {
  0: "Uploaded",
  1: "Transcribing",
  2: "Summarizing",
  3: "Completed",
  4: "Failed",
} as const;

export async function listMeetings(): Promise<Meeting[]> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/meetings`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

export async function getMeeting(id: number): Promise<Meeting> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/meetings/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch meeting");
  return res.json();
}

export async function createMeeting(title: string, dateUtc: string): Promise<Meeting> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/meetings`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ 
      title, 
      dateUtc,
      durationMinutes: 60,
      location: "Virtual",
      participants: "Team"
    }),
  });
  
  if (!res.ok) {
    // Try to parse error JSON
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create meeting");
    } catch (e) {
      // If JSON parsing fails, throw generic error
      if (e instanceof Error && e.message !== "Failed to create meeting") {
        throw e;
      }
      throw new Error("Failed to create meeting");
    }
  }
  
  return res.json();
}

export async function getSubscription(): Promise<Subscription> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/subscription`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
}

export async function verifySubscription(): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/payment/verify-subscription`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to verify subscription");
}

export async function uploadAudioFile(
  meetingId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ uploaded: boolean; assetId: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", `${API_URL}/api/uploads/${meetingId}`);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
}

export async function getTranscript(meetingId: number): Promise<Transcript | null> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/meetings/${meetingId}/transcript`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch transcript");
  return res.json();
}

export async function getMinutes(meetingId: number): Promise<Minutes | null> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/meetings/${meetingId}/minutes`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch minutes");
  return res.json();
}