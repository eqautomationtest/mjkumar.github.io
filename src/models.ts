// models.ts
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
  }
  
  export interface StatusUpdate {
    id: string;
    memberId: string;
    date: string;
    accomplishments: string;
    challenges: string;
    nextSteps: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    additionalNotes: string;
  }
  
  export interface Report {
    startDate: string;
    endDate: string;
    type: 'Biweekly' | 'Monthly';
    generatedOn: string;
    statusUpdates: StatusUpdate[];
  }