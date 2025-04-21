// app.ts
import { TeamMember, StatusUpdate } from './models';
import { StatusService } from './statusService';
import { ReportGenerator } from './reportGenerator';

class TeamStatusApp {
  private statusService: StatusService;
  private reportGenerator: ReportGenerator;
  
  constructor() {
    this.statusService = new StatusService();
    this.reportGenerator = new ReportGenerator(this.statusService);
    this.initializeApp();
  }

  private initializeApp(): void {
    this.setupTabNavigation();
    this.loadTeamMembers();
    this.setupEventListeners();
  }

  private setupTabNavigation(): void {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and content
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const targetId = (tab as HTMLElement).dataset.target;
        document.getElementById(targetId!)?.classList.add('active');
        
        // Special handling for certain tabs
        if (targetId === 'status-tab') {
          this.loadTeamMembersForStatusForm();
        } else if (targetId === 'reports-tab') {
          this.setupReportDateRanges();
        }
      });
    });
    
    // Activate first tab by default
    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');
  }

  private loadTeamMembers(): void {
    const membersList = document.getElementById('team-members-list');
    if (!membersList) return;
    
    const members = this.statusService.getTeamMembers();
    membersList.innerHTML = '';
    
    if (members.length === 0) {
      membersList.innerHTML = '<p>No team members added yet.</p>';
      return;
    }
    
    members.forEach(member => {
      const memberElement = document.createElement('div');
      memberElement.className = 'member-card';
      memberElement.innerHTML = `
        <h3>${member.name}</h3>
        <p><strong>Role:</strong> ${member.role}</p>
        <p><strong>Department:</strong> ${member.department}</p>
        <div class="card-actions">
          <button class="edit-member" data-id="${member.id}">Edit</button>
          <button class="delete-member" data-id="${member.id}">Delete</button>
          <button class="view-status" data-id="${member.id}">View Status</button>
        </div>
      `;
      membersList.appendChild(memberElement);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.edit-member').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        this.editTeamMember(id!);
      });
    });
    
    document.querySelectorAll('.delete-member').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        this.deleteTeamMember(id!);
      });
    });
    
    document.querySelectorAll('.view-status').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        this.viewMemberStatus(id!);
      });
    });
  }

  private loadTeamMembersForStatusForm(): void {
    const memberSelect = document.getElementById('status-member') as HTMLSelectElement;
    if (!memberSelect) return;
    
    const members = this.statusService.getTeamMembers();
    memberSelect.innerHTML = '<option value="">Select Team Member</option>';
    
    members.forEach(member => {
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      memberSelect.appendChild(option);
    });
  }

  private setupReportDateRanges(): void {
    // Set default date ranges for reports
    const today = new Date();
    
    // For bi-weekly report: last 2 weeks
    const biweeklyStart = new Date();
    biweeklyStart.setDate(today.getDate() - 14);
    
    (document.getElementById('biweekly-start-date') as HTMLInputElement).value = 
      this.formatDateForInput(biweeklyStart);
    (document.getElementById('biweekly-end-date') as HTMLInputElement).value = 
      this.formatDateForInput(today);
    
    // For monthly report: current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    (document.getElementById('monthly-start-date') as HTMLInputElement).value = 
      this.formatDateForInput(monthStart);
    (document.getElementById('monthly-end-date') as HTMLInputElement).value = 
      this.formatDateForInput(monthEnd);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private setupEventListeners(): void {
    // Team Member Form
    document.getElementById('team-member-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTeamMember();
    });
    
    // Status Update Form
    document.getElementById('status-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveStatusUpdate();
    });
    
    // Report Generation
    document.getElementById('generate-biweekly')?.addEventListener('click', () => {
      this.generateReport('Biweekly');
    });
    
    document.getElementById('generate-monthly')?.addEventListener('click', () => {
      this.generateReport('Monthly');
    });
    
    // Data Import/Export
    document.getElementById('export-data')?.addEventListener('click', () => {
      this.exportData();
    });
    
    document.getElementById('import-data')?.addEventListener('click', () => {
      this.importData();
    });
  }

  private saveTeamMember(): void {
    const nameInput = document.getElementById('member-name') as HTMLInputElement;
    const roleInput = document.getElementById('member-role') as HTMLInputElement;
    const departmentInput = document.getElementById('member-department') as HTMLInputElement;
    const idInput = document.getElementById('member-id') as HTMLInputElement;
    
    const member: TeamMember = {
      id: idInput.value,
      name: nameInput.value,
      role: roleInput.value,
      department: departmentInput.value
    };
    
    this.statusService.saveTeamMember(member);
    
    // Reset form and reload list
    (document.getElementById('team-member-form') as HTMLFormElement).reset();
    idInput.value = '';
    this.loadTeamMembers();
    
    alert('Team member saved successfully!');
  }

  private editTeamMember(id: string): void {
    const member = this.statusService.getTeamMembers().find(m => m.id === id);
    if (!member) return;
    
    // Populate form with member data
    (document.getElementById('member-id') as HTMLInputElement).value = member.id;
    (document.getElementById('member-name') as HTMLInputElement).value = member.name;
    (document.getElementById('member-role') as HTMLInputElement).value = member.role;
    (document.getElementById('member-department') as HTMLInputElement).value = member.department;
    
    // Switch to the team tab
    document.querySelector('.tab-button[data-target="team-tab"]')?.dispatchEvent(new Event('click'));
    
    // Focus on the name field
    (document.getElementById('member-name') as HTMLInputElement).focus();
  }

  private deleteTeamMember(id: string): void {
    if (confirm('Are you sure you want to delete this team member? All associated status updates will also be deleted.')) {
      this.statusService.deleteTeamMember(id);
      this.loadTeamMembers();
      alert('Team member deleted successfully!');
    }
  }

  private viewMemberStatus(id: string): void {
    const member = this.statusService.getTeamMembers().find(m => m.id === id);
    const statusUpdates = this.statusService.getStatusUpdatesByMember(id);
    
    const modalContent = document.getElementById('modal-content');
    if (!modalContent || !member) return;
    
    modalContent.innerHTML = `
      <h2>${member.name}'s Status Updates</h2>
      <p><strong>Role:</strong> ${member.role}</p>
      <p><strong>Department:</strong> ${member.department}</p>
      
      <div class="status-history">
        <h3>Status History</h3>
        ${this.renderStatusUpdates(statusUpdates)}
      </div>
    `;
    
    document.getElementById('modal')?.classList.add('show');
  }

  private renderStatusUpdates(updates: StatusUpdate[]): string {
    if (updates.length === 0) {
      return '<p>No status updates available.</p>';
    }
    
    // Sort updates by date (newest first)
    updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let html = '<div class="updates-list">';
    
    updates.forEach(update => {
      const date = new Date(update.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      html += `
        <div class="update-item">
          <div class="update-header">
            <span class="update-date">${date}</span>
            <span class="risk-level risk-${update.riskLevel.toLowerCase()}">${update.riskLevel} Risk</span>
          </div>
          <div class="update-body">
            <p><strong>Accomplishments:</strong> ${update.accomplishments}</p>
            <p><strong>Challenges:</strong> ${update.challenges}</p>
            <p><strong>Next Steps:</strong> ${update.nextSteps}</p>
            ${update.additionalNotes ? `<p><strong>Additional Notes:</strong> ${update.additionalNotes}</p>` : ''}
          </div>
          <div class="update-actions">
            <button class="edit-status" data-id="${update.id}">Edit</button>
            <button class="delete-status" data-id="${update.id}">Delete</button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // Add event listeners after rendering
    setTimeout(() => {
      document.querySelectorAll('.edit-status').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).dataset.id;
          this.editStatusUpdate(id!);
        });
      });
      
      document.querySelectorAll('.delete-status').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = (e.currentTarget as HTMLElement).dataset.id;
          this.deleteStatusUpdate(id!);
        });
      });
    }, 0);
    
    return html;
  }

  private saveStatusUpdate(): void {
    const memberIdInput = document.getElementById('status-member') as HTMLSelectElement;
    const dateInput = document.getElementById('status-date') as HTMLInputElement;
    const accomplishmentsInput = document.getElementById('status-accomplishments') as HTMLTextAreaElement;
    const challengesInput = document.getElementById('status-challenges') as HTMLTextAreaElement;
    const nextStepsInput = document.getElementById('status-next-steps') as HTMLTextAreaElement;
    const riskLevelInput = document.getElementById('status-risk') as HTMLSelectElement;
    const notesInput = document.getElementById('status-notes') as HTMLTextAreaElement;
    const idInput = document.getElementById('status-id') as HTMLInputElement;
    
    const status: StatusUpdate = {
      id: idInput.value,
      memberId: memberIdInput.value,
      date: dateInput.value,
      accomplishments: accomplishmentsInput.value,
      challenges: challengesInput.value,
      nextSteps: nextStepsInput.value,
      riskLevel: riskLevelInput.value as 'Low' | 'Medium' | 'High',
      additionalNotes: notesInput.value
    };
    
    this.statusService.saveStatusUpdate(status);
    
    // Reset form
    (document.getElementById('status-form') as HTMLFormElement).reset();
    idInput.value = '';
    
    // Set today's date
    dateInput.value = this.formatDateForInput(new Date());
    
    alert('Status update saved successfully!');
  }

  private editStatusUpdate(id: string): void {
    const update = this.statusService.getStatusUpdates().find(s => s.id === id);
    if (!update) return;
    
    // Populate form with status data
    (document.getElementById('status-id') as HTMLInputElement).value = update.id;
    (document.getElementById('status-member') as HTMLSelectElement).value = update.memberId;
    (document.getElementById('status-date') as HTMLInputElement).value = update.date;
    (document.getElementById('status-accomplishments') as HTMLTextAreaElement).value = update.accomplishments;
    (document.getElementById('status-challenges') as HTMLTextAreaElement).value = update.challenges;
    (document.getElementById('status-next-steps') as HTMLTextAreaElement).value = update.nextSteps;
    (document.getElementById('status-risk') as HTMLSelectElement).value = update.riskLevel;
    (document.getElementById('status-notes') as HTMLTextAreaElement).value = update.additionalNotes;
    
    // Close modal if open
    document.getElementById('modal')?.classList.remove('show');
    
    // Switch to the status tab
    document.querySelector('.tab-button[data-target="status-tab"]')?.dispatchEvent(new Event('click'));
  }

  private deleteStatusUpdate(id: string): void {
    if (confirm('Are you sure you want to delete this status update?')) {
      this.statusService.deleteStatusUpdate(id);
      
      // Close modal and reopen with updated data
      document.getElementById('modal')?.classList.remove('show');
      
      // If we were in a member view, refresh it
      const statusModal = document.querySelector('.update-item .delete-status');
      if (statusModal) {
        const memberId = this.statusService.getStatusUpdates().find(s => s.id === id)?.memberId;
        if (memberId) {
          this.viewMemberStatus(memberId);
        }
      }
      
      alert('Status update deleted successfully!');
    }
  }

  private generateReport(type: 'Biweekly' | 'Monthly'): void {
    let startDate: string, endDate: string;
    
    if (type === 'Biweekly') {
      startDate = (document.getElementById('biweekly-start-date') as HTMLInputElement).value;
      endDate = (document.getElementById('biweekly-end-date') as HTMLInputElement).value;
    } else {
      startDate = (document.getElementById('monthly-start-date') as HTMLInputElement).value;
      endDate = (document.getElementById('monthly-end-date') as HTMLInputElement).value;
    }
    
    let report;
    if (type === 'Biweekly') {
      report = this.reportGenerator.generateBiweeklyReport(startDate, endDate);
    } else {
      report = this.reportGenerator.generateMonthlyReport(startDate, endDate);
    }
    
    // Display the report
    const reportHTML = this.reportGenerator.formatReportAsHTML(report);
    const reportOutput = document.getElementById('report-output');
    if (reportOutput) {
      reportOutput.innerHTML = reportHTML;
    }
  }

  private exportData(): void {
    const data = this.statusService.exportData();
    
    // Create a download link
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-status-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private importData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = this.statusService.importData(content);
        
        if (success) {
          alert('Data imported successfully!');
          this.loadTeamMembers();
        } else {
          alert('Failed to import data. Please check file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TeamStatusApp();
});