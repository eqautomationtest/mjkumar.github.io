export class ReportGenerator {
    constructor(statusService) {
        this.statusService = statusService;
    }
    generateBiweeklyReport(startDate, endDate) {
        const statusUpdates = this.statusService.getStatusUpdatesByDateRange(startDate, endDate);
        const report = {
            startDate,
            endDate,
            type: 'Biweekly',
            generatedOn: new Date().toISOString(),
            statusUpdates
        };
        this.statusService.saveReport(report);
        return report;
    }
    generateMonthlyReport(startDate, endDate) {
        const statusUpdates = this.statusService.getStatusUpdatesByDateRange(startDate, endDate);
        const report = {
            startDate,
            endDate,
            type: 'Monthly',
            generatedOn: new Date().toISOString(),
            statusUpdates
        };
        this.statusService.saveReport(report);
        return report;
    }
    formatReportAsHTML(report) {
        const teamMembers = this.statusService.getTeamMembers();
        // Group status updates by team member
        const updatesByMember = {};
        report.statusUpdates.forEach(update => {
            if (!updatesByMember[update.memberId]) {
                updatesByMember[update.memberId] = [];
            }
            updatesByMember[update.memberId].push(update);
        });
        // Generate HTML
        let html = `
      <div class="report">
        <h2>${report.type} Report</h2>
        <p>Period: ${this.formatDate(report.startDate)} to ${this.formatDate(report.endDate)}</p>
        <p>Generated: ${this.formatDate(report.generatedOn)}</p>
        
        <div class="report-summary">
          <h3>Summary</h3>
          <p>Team Members Reporting: ${Object.keys(updatesByMember).length}</p>
          <p>Total Status Updates: ${report.statusUpdates.length}</p>
          <p>High Risk Items: ${report.statusUpdates.filter(u => u.riskLevel === 'High').length}</p>
        </div>
        
        <div class="report-details">
          <h3>Team Member Details</h3>
    `;
        // Add each team member's data
        Object.keys(updatesByMember).forEach(memberId => {
            const member = teamMembers.find(m => m.id === memberId);
            const updates = updatesByMember[memberId];
            if (member) {
                html += `
          <div class="member-section">
            <h4>${member.name} - ${member.role}</h4>
            <p>Department: ${member.department}</p>
            
            <div class="status-updates">
              <h5>Status Updates</h5>
              <ul>
        `;
                updates.forEach(update => {
                    html += `
            <li>
              <div class="update-date">${this.formatDate(update.date)}</div>
              <div class="update-content">
                <p><strong>Accomplishments:</strong> ${update.accomplishments}</p>
                <p><strong>Challenges:</strong> ${update.challenges}</p>
                <p><strong>Next Steps:</strong> ${update.nextSteps}</p>
                <p><strong>Risk Level:</strong> <span class="risk-${update.riskLevel.toLowerCase()}">${update.riskLevel}</span></p>
                ${update.additionalNotes ? `<p><strong>Notes:</strong> ${update.additionalNotes}</p>` : ''}
              </div>
            </li>
          `;
                });
                html += `
              </ul>
            </div>
          </div>
        `;
            }
        });
        html += `
        </div>
      </div>
    `;
        return html;
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
//# sourceMappingURL=reportGenerator.js.map