export type MaidProfile = {
  id: string;
  name: string;
  initials: string;
  state: string;
  area: string;
  gender: "Female" | "Male";
  arrangement: "Live-in" | "Daily" | "Weekends";
  salaryMin: number;
  salaryMax: number;
  experience: string;
  experienceYears: number;
  skills: string[];
  qualifications: string[];
  languages: string[];
  interests: string[];
  availability: string;
  about: string;
};

export const maidProfiles: MaidProfile[] = [
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    initials: "AO",
    state: "Lagos",
    area: "Lekki",
    gender: "Female",
    arrangement: "Live-in",
    salaryMin: 120000,
    salaryMax: 150000,
    experience: "4 years’ experience",
    experienceYears: 4,
    skills: ["Cleaning", "Laundry", "Cooking"],
    qualifications: ["Home care and hygiene course (sample)", "First aid basics (sample)"],
    languages: ["English", "Igbo"],
    interests: ["Trying new recipes", "Gardening"],
    availability: "Available this month",
    about:
      "Experienced with daily home routines, laundry care, and preparing simple family meals.",
  },
  {
    id: "chioma-eze",
    name: "Chioma Eze",
    initials: "CE",
    state: "Lagos",
    area: "Ikeja",
    gender: "Female",
    arrangement: "Daily",
    salaryMin: 100000,
    salaryMax: 130000,
    experience: "3 years’ experience",
    experienceYears: 3,
    skills: ["Cleaning", "Childcare", "Laundry"],
    qualifications: ["Childcare fundamentals (sample)", "Home safety basics (sample)"],
    languages: ["English", "Igbo"],
    interests: ["Reading", "Music"],
    availability: "Available now",
    about:
      "Comfortable with a daily commute and helping families keep a tidy, child-friendly home.",
  },
  {
    id: "aisha-bello",
    name: "Aisha Bello",
    initials: "AB",
    state: "Lagos",
    area: "Yaba",
    gender: "Female",
    arrangement: "Weekends",
    salaryMin: 60000,
    salaryMax: 80000,
    experience: "2 years’ experience",
    experienceYears: 2,
    skills: ["Cleaning", "Cooking"],
    qualifications: ["Food hygiene basics (sample)"],
    languages: ["English", "Hausa"],
    interests: ["Cooking", "Football"],
    availability: "Available weekends",
    about:
      "Available for weekend cleaning and meal preparation, with a focus on consistent routines.",
  },
  {
    id: "blessing-adeyemi",
    name: "Blessing Adeyemi",
    initials: "BA",
    state: "Lagos",
    area: "Surulere",
    gender: "Female",
    arrangement: "Daily",
    salaryMin: 110000,
    salaryMax: 140000,
    experience: "5 years’ experience",
    experienceYears: 5,
    skills: ["Cleaning", "Laundry", "Cooking", "Childcare"],
    qualifications: ["Early childhood care course (sample)", "First aid basics (sample)"],
    languages: ["English", "Yoruba"],
    interests: ["Singing", "Baking"],
    availability: "Available in 2 weeks",
    about:
      "Has experience supporting busy households with cleaning, laundry, and supervised childcare.",
  },
  {
    id: "grace-nwosu",
    name: "Grace Nwosu",
    initials: "GN",
    state: "Lagos",
    area: "Ajah",
    gender: "Female",
    arrangement: "Live-in",
    salaryMin: 130000,
    salaryMax: 160000,
    experience: "6 years’ experience",
    experienceYears: 6,
    skills: ["Cleaning", "Cooking", "Childcare"],
    qualifications: ["Home management training (sample)", "Child safety basics (sample)"],
    languages: ["English", "Igbo"],
    interests: ["Crafts", "Cooking"],
    availability: "Available now",
    about:
      "Seeking a live-in role and experienced in household upkeep and caring for young children.",
  },
  {
    id: "kemi-ojo",
    name: "Kemi Ojo",
    initials: "KO",
    state: "Lagos",
    area: "Lekki",
    gender: "Female",
    arrangement: "Weekends",
    salaryMin: 65000,
    salaryMax: 85000,
    experience: "3 years’ experience",
    experienceYears: 3,
    skills: ["Cleaning", "Laundry"],
    qualifications: ["Laundry care course (sample)"],
    languages: ["English", "Yoruba"],
    interests: ["Walking", "Films"],
    availability: "Available weekends",
    about:
      "Available on weekends for home cleaning and laundry, with flexible start dates.",
  },
  {
    id: "tomiwa-adebayo",
    name: "Tomiwa Adebayo",
    initials: "TA",
    state: "Oyo",
    area: "Ibadan",
    gender: "Male",
    arrangement: "Daily",
    salaryMin: 90000,
    salaryMax: 120000,
    experience: "4 years’ experience",
    experienceYears: 4,
    skills: ["Cleaning", "Cooking", "Laundry"],
    qualifications: ["Food hygiene basics (sample)", "Home care course (sample)"],
    languages: ["English", "Yoruba"],
    interests: ["Reading", "Gardening"],
    availability: "Available now",
    about:
      "Experienced in household routines, meal preparation, and keeping shared spaces organized.",
  },
  {
    id: "ronke-oladipo",
    name: "Ronke Oladipo",
    initials: "RO",
    state: "Oyo",
    area: "Ibadan",
    gender: "Female",
    arrangement: "Live-in",
    salaryMin: 100000,
    salaryMax: 135000,
    experience: "5 years’ experience",
    experienceYears: 5,
    skills: ["Childcare", "Cooking", "Cleaning"],
    qualifications: ["Childcare fundamentals (sample)", "First aid basics (sample)"],
    languages: ["English", "Yoruba"],
    interests: ["Sewing", "Cooking"],
    availability: "Available within 2 weeks",
    about:
      "Enjoys supporting families with childcare, simple meals, and a steady daily routine.",
  },
  {
    id: "zainab-sulaiman",
    name: "Zainab Sulaiman",
    initials: "ZS",
    state: "Oyo",
    area: "Ogbomoso",
    gender: "Female",
    arrangement: "Daily",
    salaryMin: 80000,
    salaryMax: 105000,
    experience: "3 years’ experience",
    experienceYears: 3,
    skills: ["Cleaning", "Laundry"],
    qualifications: ["Home hygiene training (sample)"],
    languages: ["English", "Yoruba", "Hausa"],
    interests: ["Music", "Walking"],
    availability: "Available this month",
    about:
      "Looking for a daily position and brings practical experience with cleaning and laundry.",
  },
  {
    id: "funmi-oluwaseun",
    name: "Funmi Oluwaseun",
    initials: "FO",
    state: "Oyo",
    area: "Oyo",
    gender: "Female",
    arrangement: "Weekends",
    salaryMin: 55000,
    salaryMax: 75000,
    experience: "2 years’ experience",
    experienceYears: 2,
    skills: ["Cooking", "Cleaning"],
    qualifications: ["Basic food preparation course (sample)"],
    languages: ["English", "Yoruba"],
    interests: ["Baking", "Community events"],
    availability: "Available weekends",
    about:
      "Available for weekend household support, including meal preparation and general cleaning.",
  },
];

export function getMaidProfile(id: string): MaidProfile | undefined {
  return maidProfiles.find((profile) => profile.id === id);
}
