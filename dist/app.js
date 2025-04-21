import { StatusService } from './statusService';
import { ReportGenerator } from './reportGenerator';
class TeamStatusApp {
    constructor() {
        this.statusService = new StatusService();
        this.reportGenerator = new ReportGenerator(this.statusService);
        this.initializeApp();
    }
    initializeApp() {
        this.setupTabNavigation();
        this.loadTeamMembers();
        this.setupEventListeners();
    }
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                var _a;
                // Remove active class from all tabs and content
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const targetId = tab.dataset.target;
                (_a = document.getElementById(targetId)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                // Special handling for certain tabs
                if (targetId === 'status-tab') {
                    this.loadTeamMembersForStatusForm();
                }
                else if (targetId === 'reports-tab') {
                    this.setupReportDateRanges();
                }
            });
        });
        // Activate first tab by default
        tabs[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
    loadTeamMembers() {
        const membersList = document.getElementById('team-members-list');
        if (!membersList)
            return;
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
                const id = e.currentTarget.dataset.id;
                this.editTeamMember(id);
            });
        });
        document.querySelectorAll('.delete-member').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteTeamMember(id);
            });
        });
        document.querySelectorAll('.view-status').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewMemberStatus(id);
            });
        });
    }
    loadTeamMembersForStatusForm() {
        const memberSelect = document.getElementById('status-member');
        if (!memberSelect)
            return;
        const members = this.statusService.getTeamMembers();
        memberSelect.innerHTML = '<option value="">Select Team Member</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
    }
    setupReportDateRanges() {
        // Set default date ranges for reports
        const today = new Date();
        // For bi-weekly report: last 2 weeks
        const biweeklyStart = new Date();
        biweeklyStart.setDate(today.getDate() - 14);
        document.getElementById('biweekly-start-date').value =
            this.formatDateForInput(biweeklyStart);
        document.getElementById('biweekly-end-date').value =
            this.formatDateForInput(today);
        // For monthly report: current month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        document.getElementById('monthly-start-date').value =
            this.formatDateForInput(monthStart);
        document.getElementById('monthly-end-date').value =
            this.formatDateForInput(monthEnd);
    }
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
    setupEventListeners() {
        var _a, _b, _c, _d, _e, _f;
        // Team Member Form
        (_a = document.getElementById('team-member-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeamMember();
        });
        // Status Update Form
        (_b = document.getElementById('status-form')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStatusUpdate();
        });
        // Report Generation
        (_c = document.getElementById('generate-biweekly')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.generateReport('Biweekly');
        });
        (_d = document.getElementById('generate-monthly')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.generateReport('Monthly');
        });
        // Data Import/Export
        (_e = document.getElementById('export-data')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            this.exportData();
        });
        (_f = document.getElementById('import-data')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            this.importData();
        });
    }
    saveTeamMember() {
        const nameInput = document.getElementById('member-name');
        const roleInput = document.getElementById('member-role');
        const departmentInput = document.getElementById('member-department');
        const idInput = document.getElementById('member-id');
        const member = {
            id: idInput.value,
            name: nameInput.value,
            role: roleInput.value,
            department: departmentInput.value
        };
        this.statusService.saveTeamMember(member);
        // Reset form and reload list
        document.getElementById('team-member-form').reset();
        idInput.value = '';
        this.loadTeamMembers();
        alert('Team member saved successfully!');
    }
    editTeamMember(id) {
        var _a;
        const member = this.statusService.getTeamMembers().find(m => m.id === id);
        if (!member)
            return;
        // Populate form with member data
        document.getElementById('member-id').value = member.id;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-role').value = member.role;
        document.getElementById('member-department').value = member.department;
        // Switch to the team tab
        (_a = document.querySelector('.tab-button[data-target="team-tab"]')) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('click'));
        // Focus on the name field
        document.getElementById('member-name').focus();
    }
    deleteTeamMember(id) {
        if (confirm('Are you sure you want to delete this team member? All associated status updates will also be deleted.')) {
            this.statusService.deleteTeamMember(id);
            this.loadTeamMembers();
            alert('Team member deleted successfully!');
        }
    }
    viewMemberStatus(id) {
        var _a;
        const member = this.statusService.getTeamMembers().find(m => m.id === id);
        const statusUpdates = this.statusService.getStatusUpdatesByMember(id);
        const modalContent = document.getElementById('modal-content');
        if (!modalContent || !member)
            return;
        modalContent.innerHTML = `
      <h2>${member.name}'s Status Updates</h2>
      <p><strong>Role:</strong> ${member.role}</p>
      <p><strong>Department:</strong> ${member.department}</p>
      
      <div class="status-history">
        <h3>Status History</h3>
        ${this.renderStatusUpdates(statusUpdates)}
      </div>
    `;
        (_a = document.getElementById('modal')) === null || _a === void 0 ? void 0 : _a.classList.add('show');
    }
    renderStatusUpdates(updates) {
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
                    const id = e.currentTarget.dataset.id;
                    this.editStatusUpdate(id);
                });
            });
            document.querySelectorAll('.delete-status').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    this.deleteStatusUpdate(id);
                });
            });
        }, 0);
        return html;
    }
    saveStatusUpdate() {
        const memberIdInput = document.getElementById('status-member');
        const dateInput = document.getElementById('status-date');
        const accomplishmentsInput = document.getElementById('status-accomplishments');
        const challengesInput = document.getElementById('status-challenges');
        const nextStepsInput = document.getElementById('status-next-steps');
        const riskLevelInput = document.getElementById('status-risk');
        const notesInput = document.getElementById('status-notes');
        const idInput = document.getElementById('status-id');
        const status = {
            id: idInput.value,
            memberId: memberIdInput.value,
            date: dateInput.value,
            accomplishments: accomplishmentsInput.value,
            challenges: challengesInput.value,
            nextSteps: nextStepsInput.value,
            riskLevel: riskLevelInput.value,
            additionalNotes: notesInput.value
        };
        this.statusService.saveStatusUpdate(status);
        // Reset form
        document.getElementById('status-form').reset();
        idInput.value = '';
        // Set today's date
        dateInput.value = this.formatDateForInput(new Date());
        alert('Status update saved successfully!');
    }
    editStatusUpdate(id) {
        var _a, _b;
        const update = this.statusService.getStatusUpdates().find(s => s.id === id);
        if (!update)
            return;
        // Populate form with status data
        document.getElementById('status-id').value = update.id;
        document.getElementById('status-member').value = update.memberId;
        document.getElementById('status-date').value = update.date;
        document.getElementById('status-accomplishments').value = update.accomplishments;
        document.getElementById('status-challenges').value = update.challenges;
        document.getElementById('status-next-steps').value = update.nextSteps;
        document.getElementById('status-risk').value = update.riskLevel;
        document.getElementById('status-notes').value = update.additionalNotes;
        // Close modal if open
        (_a = document.getElementById('modal')) === null || _a === void 0 ? void 0 : _a.classList.remove('show');
        // Switch to the status tab
        (_b = document.querySelector('.tab-button[data-target="status-tab"]')) === null || _b === void 0 ? void 0 : _b.dispatchEvent(new Event('click'));
    }
    deleteStatusUpdate(id) {
        var _a, _b;
        if (confirm('Are you sure you want to delete this status update?')) {
            this.statusService.deleteStatusUpdate(id);
            // Close modal and reopen with updated data
            (_a = document.getElementById('modal')) === null || _a === void 0 ? void 0 : _a.classList.remove('show');
            // If we were in a member view, refresh it
            const statusModal = document.querySelector('.update-item .delete-status');
            if (statusModal) {
                const memberId = (_b = this.statusService.getStatusUpdates().find(s => s.id === id)) === null || _b === void 0 ? void 0 : _b.memberId;
                if (memberId) {
                    this.viewMemberStatus(memberId);
                }
            }
            alert('Status update deleted successfully!');
        }
    }
    generateReport(type) {
        let startDate, endDate;
        if (type === 'Biweekly') {
            startDate = document.getElementById('biweekly-start-date').value;
            endDate = document.getElementById('biweekly-end-date').value;
        }
        else {
            startDate = document.getElementById('monthly-start-date').value;
            endDate = document.getElementById('monthly-end-date').value;
        }
        let report;
        if (type === 'Biweekly') {
            report = this.reportGenerator.generateBiweeklyReport(startDate, endDate);
        }
        else {
            report = this.reportGenerator.generateMonthlyReport(startDate, endDate);
        }
        // Display the report
        const reportHTML = this.reportGenerator.formatReportAsHTML(report);
        const reportOutput = document.getElementById('report-output');
        if (reportOutput) {
            reportOutput.innerHTML = reportHTML;
        }
    }
    exportData() {
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
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                var _a;
                const content = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                const success = this.statusService.importData(content);
                if (success) {
                    alert('Data imported successfully!');
                    this.loadTeamMembers();
                }
                else {
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
//# sourceMappingURL=app.js.map