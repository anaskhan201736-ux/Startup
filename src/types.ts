export type BookCondition = 'Like New' | 'Very Good' | 'Good' | 'Fair';

export type ClassLevel = 
  | 'All'
  | 'Class 1 (1st Std)'
  | 'Class 2 (2nd Std)'
  | 'Class 3 (3rd Std)'
  | 'Class 4 (4th Std)'
  | 'Class 5 (5th Std)'
  | 'Class 6 (6th Std)'
  | 'Class 7 (7th Std)'
  | 'Class 8 (8th Std)'
  | 'Class 9 (9th Std)'
  | 'Class 10 (10th Std)';

export type SubjectCategory =
  | 'All'
  | 'Mathematics'
  | 'Science'
  | 'Social Studies'
  | 'English'
  | 'Hindi'
  | 'Environmental Studies (EVS)'
  | 'Computer Studies'
  | 'Physics (Class 9-10)'
  | 'Chemistry (Class 9-10)'
  | 'Biology (Class 9-10)'
  | 'History & Civics'
  | 'Geography'
  | 'Other';

export interface Book {
  id: string;
  title: string;          // Book name
  author?: string;
  classLevel: string;     // Class
  subject: string;        // Subject
  condition: BookCondition; // Condition
  pickupLocation: string; // Location
  photoUrl?: string;      // Book photo (data URL)
  whatsappContact: string; // WhatsApp contact
  donorName?: string;
  editionYear?: string;
  notes?: string;
  coverPalette?: {
    bg: string;
    text: string;
    border: string;
  };
  createdAt: string;
  status: 'available' | 'taken' | 'claimed';
}

