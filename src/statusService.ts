// statusService.ts
import { TeamMember, StatusUpdate, Report } from './models';

export class StatusService {
  private readonly MEMBERS_KEY = 'team_members';
  private readonly STATUS_KEY = 'status_updates';
  private readonly REPORTS_KEY = 'generated_reports';

  // Team Member Methods
  public getTeamMembers(): TeamMember[] {
    const data = localStorage.getItem(this.MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  public saveTeamMember(member: TeamMember): void {
    const members = this.getTeamMembers();
    
    // Generate random ID if not provided
    if (!member.id) {
      member.id = this.generateId();
    }
    
    // Update if exists, otherwise add
    const index = members.findIndex(m => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
  }

  public deleteTeamMember(id: string): void {
    const members = this.getTeamMembers().filter(m => m.id !== id);
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
    
    // Also remove associated status updates
    const updates = this.getStatusUpdates().filter(s => s.memberId !== id);
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(updates));
  }

  // Status Update Methods
  public getStatusUpdates(): StatusUpdate[] {
    const data = localStorage.getItem(this.STATUS_KEY);
    return data ? JSON.parse(data) : [];
  }

  public getStatusUpdatesByMember(memberId: string): StatusUpdate[] {
    return this.getStatusUpdates().filter(s => s.memberId === memberId);
  }

  public getStatusUpdatesByDateRange(startDate: string, endDate: string): StatusUpdate[] {
    return this.getStatusUpdates().filter(s => {
      const updateDate = new Date(s.date);
      return updateDate >= new Date(startDate) && updateDate <= new Date(endDate);
    });
  }

  public saveStatusUpdate(status: StatusUpdate): void {
    const updates = this.getStatusUpdates();
    
    // Generate random ID if not provided
    if (!status.id) {
      status.id = this.generateId();
    }
    
    // Update if exists, otherwise add
    const index = updates.findIndex(s => s.id === status.id);
    if (index >= 0) {
      updates[index] = status;
    } else {
      updates.push(status);
    }
    
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(updates));
  }

  public deleteStatusUpdate(id: string): void {
    const updates = this.getStatusUpdates().filter(s => s.id !== id);
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(updates));
  }

  // Report Methods
  public getReports(): Report[] {
    const data = localStorage.getItem(this.REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  public saveReport(report: Report): void {
    const reports = this.getReports();
    reports.push(report);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
  }

  // Helper Methods
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Export data as JSON
  public exportData(): string {
    const data = {
      teamMembers: this.getTeamMembers(),
      statusUpdates: this.getStatusUpdates(),
      reports: this.getReports()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON
  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.teamMembers) {
        localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(data.teamMembers));
      }
      if (data.statusUpdates) {
        localStorage.setItem(this.STATUS_KEY, JSON.stringify(data.statusUpdates));
      }
      if (data.reports) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(data.reports));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}