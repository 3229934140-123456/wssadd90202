export interface Category {
  id: string
  name: string
  icon: string
  sortOrder: number
  projectCount: number
}

export interface Project {
  id: string
  name: string
  categoryId: string
  schemeCount: number
}

export interface FoodItem {
  id: string
  name: string
  reason: string
  severity: 'high' | 'medium' | 'low'
}

export interface RecoveryStage {
  id: string
  name: string
  dayRange: [number, number]
  description: string
  prohibitedFoods: string[]
  recommendedFoods: string[]
}

export interface SchemeVersion {
  id: string
  version: number
  modifiedBy: string
  modifyReason: string
  effectiveTime: string
  createdAt: string
}

export interface Scheme {
  id: string
  name: string
  categoryId: string
  prohibitedFoods: FoodItem[]
  recommendedFoods: FoodItem[]
  reminderFrequency: 'daily' | 'every3days' | 'weekly' | 'custom'
  customFrequency?: string
  recoveryStages: RecoveryStage[]
  specialPopulationNotes: string
  status: 'draft' | 'published' | 'archived'
  versions: SchemeVersion[]
  createdAt: string
  updatedAt: string
}

export interface DoctorOrder {
  id: string
  projectId: string
  projectName: string
  doctorName: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Store {
  id: string
  name: string
  region: string
  isActive: boolean
}

export interface StoreDistribution {
  id: string
  schemeId: string
  schemeName: string
  storeIds: string[]
  status: 'pending' | 'active' | 'expired'
  allowRegionalDiff: boolean
  distributedAt: string
  distributedBy: string
}

export interface HolidayReminder {
  id: string
  holiday: string
  startDate: string
  endDate: string
  content: string
}

export interface MiniAppConfig {
  homepageCopy: string
  brandTone: string
  holidayReminders: HolidayReminder[]
}

export interface QAItem {
  id: string
  question: string
  answer: string
  relatedProjectIds: string[]
  relatedProjectNames: string[]
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface MonthlyData {
  month: string
  activationRate: number
  readRate: number
  riskFeedbackCount: number
}

export interface StoreMetrics {
  storeId: string
  storeName: string
  region: string
  activationRate: number
  readRate: number
  riskFeedbackCount: number
  monthlyTrend: MonthlyData[]
}

export interface OptimizationSuggestion {
  id: string
  storeId: string
  storeName: string
  submitter: string
  content: string
  relatedSchemeId: string
  relatedSchemeName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
