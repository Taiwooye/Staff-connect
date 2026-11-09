export const serviceCategories = [
  {
    id: "childcare",
    icon: "👶",
    label: "Nanny & childcare",
    description: "Thoughtful care for little ones",
    skills: ["Childcare"],
  },
  {
    id: "cleaning",
    icon: "🧹",
    label: "Home cleaning",
    description: "A fresh, comfortable home",
    skills: ["Cleaning", "Laundry"],
  },
  {
    id: "cooking",
    icon: "🍳",
    label: "Cooks & chefs",
    description: "Everyday meals, made easier",
    skills: ["Cooking"],
  },
  {
    id: "drivers",
    icon: "🚗",
    label: "Drivers",
    description: "Reliable help on the road",
    skills: ["Driving", "Errands", "Vehicle care"],
  },
  {
    id: "gardeners",
    icon: "🌿",
    label: "Gardeners",
    description: "Care for your outdoor spaces",
    skills: ["Lawn care", "Plant care", "Garden maintenance"],
  },
  {
    id: "elderly-care",
    icon: "🧓",
    label: "Elderly care",
    description: "Dependable day-to-day support",
    skills: [
      "Companionship",
      "Mobility assistance",
      "Personal care",
      "Meal support",
    ],
  },
  {
    id: "pet-care",
    icon: "🐕",
    label: "Pet care",
    description: "Kind care for furry family",
    skills: ["Dog walking", "Pet feeding", "Pet sitting", "Grooming"],
  },
  {
    id: "home-maintenance",
    icon: "🔧",
    label: "Home maintenance",
    description: "A hand with the little fixes",
    skills: ["Repairs", "Plumbing", "Electrical", "Painting"],
  },
] as const;

export const allHouseholdSkills = [
  "Cleaning",
  "Laundry",
  "Cooking",
  "Childcare",
] as const;

export const serviceFilters = [
  {
    id: "all",
    label: "All household help",
    skills: allHouseholdSkills,
  },
  ...serviceCategories,
] as const;

export type ServiceCategoryId = (typeof serviceFilters)[number]["id"];

export function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return serviceFilters.some((service) => service.id === value);
}
