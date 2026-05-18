import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { WebsiteLinkService } from '../../../services/website-link.service';
import { ProjectService } from '../../../services/project.service';
import { WebsiteLink, WebsiteLinkCreate, WebsiteLinkUpdate } from '../../../models/website-link.model';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-website-links',
  templateUrl: './website-links.component.html',
  styleUrls: ['./website-links.component.scss']
})
export class WebsiteLinksComponent implements OnInit {

  // --- Projects tab ---
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  projectSearch = '';
  projectPasswordMap: { [id: number]: boolean } = {};
  projectColumns = ['clientName', 'title', 'websiteUrl', 'websiteLogin', 'source', 'platform', 'status'];

  // --- Manual links tab ---
  links: WebsiteLink[] = [];
  filteredLinks: WebsiteLink[] = [];
  showForm = false;
  editingId: number | null = null;
  linkPasswordMap: { [id: number]: boolean } = {};
  linkSearch = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  linkColumns = ['clientName', 'websiteUrl', 'login', 'password', 'reference', 'notes', 'status', 'actions'];

  // --- All Data tab ---
  allDataSearch = '';
  allDataPasswordMap: { [key: string]: boolean } = {};
  allDataColumns = ['type', 'clientName', 'websiteUrl', 'login', 'source', 'status'];

  // --- Shared state ---
  linkForm!: FormGroup;
  isLoading = false;
  isSendingEmail = false;
  referenceSources = ['Fiverr', 'Upwork', 'Direct', 'LinkedIn', 'Referral', 'Other'];

  constructor(
    private linkService: WebsiteLinkService,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    forkJoin({
      projects: this.projectService.getProjects(0, 1000),
      links: this.linkService.getAll()
    }).subscribe({
      next: ({ projects, links }) => {
        this.projects = projects.items.filter(p => p.websiteUrl || p.websiteLogin);
        this.filteredProjects = [...this.projects];
        this.links = links;
        this.applyLinkFilter();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load data', 'Close', { duration: 4000 });
        this.isLoading = false;
      }
    });
  }

  // --- Project tab filtering ---
  applyProjectSearch(): void {
    const q = this.projectSearch.toLowerCase().trim();
    this.filteredProjects = q
      ? this.projects.filter(p =>
          (p.clientName || '').toLowerCase().includes(q) ||
          (p.title || '').toLowerCase().includes(q) ||
          (p.websiteUrl || '').toLowerCase().includes(q) ||
          (p.sourceOfProject || '').toLowerCase().includes(q) ||
          (p.platform || '').toLowerCase().includes(q)
        )
      : [...this.projects];
  }

  toggleProjectPassword(id: number): void {
    this.projectPasswordMap[id] = !this.projectPasswordMap[id];
  }

  // --- Manual link tab ---
  initForm(link?: WebsiteLink): void {
    this.linkForm = this.fb.group({
      clientName: [link?.clientName || '', Validators.required],
      websiteUrl: [link?.websiteUrl || '', [Validators.required, Validators.pattern('https?://.+')]],
      loginUsername: [link?.loginUsername || '', Validators.required],
      loginPassword: [link?.loginPassword || '', Validators.required],
      referenceSource: [link?.referenceSource || '', Validators.required],
      referenceDetail: [link?.referenceDetail || ''],
      notes: [link?.notes || ''],
      isActive: [link?.isActive ?? true]
    });
  }

  applyLinkFilter(): void {
    let result = [...this.links];
    const q = this.linkSearch.toLowerCase().trim();
    if (q) {
      result = result.filter(l =>
        l.clientName.toLowerCase().includes(q) ||
        l.websiteUrl.toLowerCase().includes(q) ||
        l.referenceSource.toLowerCase().includes(q) ||
        (l.referenceDetail || '').toLowerCase().includes(q)
      );
    }
    if (this.filterStatus === 'active') result = result.filter(l => l.isActive);
    if (this.filterStatus === 'inactive') result = result.filter(l => !l.isActive);
    this.filteredLinks = result;
  }

  openAddForm(): void {
    this.editingId = null;
    this.initForm();
    this.showForm = true;
  }

  openEditForm(link: WebsiteLink): void {
    this.editingId = link.id;
    this.initForm(link);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  submitForm(): void {
    if (this.linkForm.invalid) return;
    const v = this.linkForm.value;

    if (this.editingId !== null) {
      const payload: WebsiteLinkUpdate = { ...v };
      this.linkService.update(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Updated', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadAll();
        },
        error: () => this.snackBar.open('Failed to update', 'Close', { duration: 4000 })
      });
    } else {
      const payload: WebsiteLinkCreate = { ...v };
      this.linkService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Website link added', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadAll();
        },
        error: () => this.snackBar.open('Failed to add', 'Close', { duration: 4000 })
      });
    }
  }

  toggleActive(link: WebsiteLink): void {
    this.linkService.toggleActive(link.id, !link.isActive).subscribe({
      next: () => {
        link.isActive = !link.isActive;
        this.applyLinkFilter();
        this.snackBar.open(`Marked as ${link.isActive ? 'active' : 'inactive'}`, 'Close', { duration: 2500 });
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 4000 })
    });
  }

  deleteLink(link: WebsiteLink): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Delete Website Link',
        message: `Delete "${link.clientName}" (${link.websiteUrl})?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.linkService.delete(link.id).subscribe({
          next: () => { this.snackBar.open('Deleted', 'Close', { duration: 3000 }); this.loadAll(); },
          error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 4000 })
        });
      }
    });
  }

  toggleLinkPassword(id: number): void {
    this.linkPasswordMap[id] = !this.linkPasswordMap[id];
  }

  get activeCount(): number { return this.links.filter(l => l.isActive).length; }
  get inactiveCount(): number { return this.links.filter(l => !l.isActive).length; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Completed: 'status-completed',
      Started: 'status-started',
      Pending: 'status-pending',
      Hold: 'status-hold',
      Revision: 'status-revision',
      Cancelled: 'status-cancelled'
    };
    return map[status] || '';
  }

  // --- All Data tab ---

  get allDataRows(): AllDataRow[] {
    const q = this.allDataSearch.toLowerCase().trim();
    const rows: AllDataRow[] = [
      ...this.projects.map(p => ({
        type: 'project' as const,
        clientName: p.clientName || '—',
        projectTitle: p.title,
        websiteUrl: p.websiteUrl || '',
        login: p.websiteLogin || '',
        password: '',
        source: p.sourceOfProject || '',
        status: p.status,
        statusName: p.statusName,
        isActive: true,
        id: `proj-${p.id}`
      })),
      ...this.links.map(l => ({
        type: 'manual' as const,
        clientName: l.clientName,
        projectTitle: '',
        websiteUrl: l.websiteUrl,
        login: l.loginUsername,
        password: l.loginPassword,
        source: l.referenceSource + (l.referenceDetail ? ' / ' + l.referenceDetail : ''),
        status: '',
        statusName: '',
        isActive: l.isActive,
        id: `link-${l.id}`
      }))
    ];
    if (!q) return rows;
    return rows.filter(r =>
      r.clientName.toLowerCase().includes(q) ||
      r.projectTitle.toLowerCase().includes(q) ||
      r.websiteUrl.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q)
    );
  }

  toggleAllDataPassword(id: string): void {
    this.allDataPasswordMap[id] = !this.allDataPasswordMap[id];
  }

  // --- Download active links as .txt ---
  downloadActiveLinks(): void {
    const content = this.buildReportText();
    const fileName = `active-links-${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Send active links to admin email ---
  sendActiveLinksEmail(): void {
    this.isSendingEmail = true;
    this.linkService.sendActiveLinksEmail().subscribe({
      next: (adminEmail) => {
        this.isSendingEmail = false;
        this.snackBar.open(`Report sent to ${adminEmail}`, 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.isSendingEmail = false;
        const msg = err?.error?.message || 'Failed to send email';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  private buildReportText(): string {
    const now = new Date();
    const sep = '='.repeat(60);
    const line = '-'.repeat(60);
    const lines: string[] = [];

    lines.push('ACTIVE WEBSITE LINKS REPORT');
    lines.push(`Generated: ${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`);
    lines.push(sep);
    lines.push('');

    lines.push('SECTION 1: FROM PROJECTS');
    lines.push(line);
    const projLinks = this.projects.filter(p => p.websiteUrl);
    if (projLinks.length === 0) {
      lines.push('  (no project website links found)');
    } else {
      projLinks.forEach((p, i) => {
        lines.push(`  [${i + 1}] ${p.clientName || 'Unknown'} — ${p.title}`);
        lines.push(`       URL   : ${p.websiteUrl}`);
        if (p.websiteLogin) lines.push(`       Login : ${p.websiteLogin}`);
        if (p.sourceOfProject) lines.push(`       Source: ${p.sourceOfProject}`);
        lines.push('');
      });
    }

    lines.push('');
    lines.push('SECTION 2: MANUAL ENTRIES (Active)');
    lines.push(line);
    const activeLinks = this.links.filter(l => l.isActive);
    if (activeLinks.length === 0) {
      lines.push('  (no active manual entries found)');
    } else {
      activeLinks.forEach((l, i) => {
        lines.push(`  [${i + 1}] ${l.clientName}`);
        lines.push(`       URL     : ${l.websiteUrl}`);
        lines.push(`       Username: ${l.loginUsername}`);
        lines.push(`       Password: ${l.loginPassword}`);
        lines.push(`       Source  : ${l.referenceSource}${l.referenceDetail ? ' / ' + l.referenceDetail : ''}`);
        if (l.notes) lines.push(`       Notes   : ${l.notes}`);
        lines.push('');
      });
    }

    // Section 3 — collect all URLs from both sources
    const allUrls: string[] = [
      ...projLinks.map(p => p.websiteUrl).filter(Boolean),
      ...activeLinks.map(l => l.websiteUrl).filter(Boolean)
    ];

    lines.push('');
    lines.push('SECTION 3: JUST URLs');
    lines.push(line);
    if (allUrls.length === 0) {
      lines.push('  (no URLs found)');
    } else {
      allUrls.forEach((url, i) => lines.push(`${i + 1}. ${url}`));
    }

    lines.push(sep);
    lines.push(`Total from projects : ${projLinks.length}`);
    lines.push(`Total manual (active): ${activeLinks.length}`);
    lines.push(sep);

    return lines.join('\n');
  }
}

// Shape used by the All Data tab
interface AllDataRow {
  type: 'project' | 'manual';
  clientName: string;
  projectTitle: string;
  websiteUrl: string;
  login: string;
  password: string;
  source: string;
  status: string;
  statusName: string;
  isActive: boolean;
  id: string;
}
