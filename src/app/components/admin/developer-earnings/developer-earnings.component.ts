import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard.service';
import { DeveloperEarning } from '../../../models/dashboard.model';

@Component({
  selector: 'app-developer-earnings',
  templateUrl: './developer-earnings.component.html',
  styleUrls: ['./developer-earnings.component.scss']
})
export class DeveloperEarningsComponent implements OnInit {
  displayedColumns: string[] = ['developerName', 'totalEarnings', 'paidAmount', 'pendingAmount', 'completedProjects', 'actions'];
  dataSource = new MatTableDataSource<DeveloperEarning>([]);
  isLoading = false;
  totalEarnings = 0;
  totalPaid = 0;
  totalPending = 0;

  dateFilterForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initDateFilterForm();
    this.loadDeveloperEarnings();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initDateFilterForm() {
    this.dateFilterForm = this.formBuilder.group({
      startDate: [null],
      endDate: [null]
    });
  }

  loadDeveloperEarnings() {
    this.isLoading = true;

    const startDate = this.dateFilterForm.value.startDate;
    const endDate = this.dateFilterForm.value.endDate;

    this.dashboardService.getDeveloperEarnings(startDate, endDate)
      .subscribe({
        next: (earnings) => {
          this.dataSource.data = earnings;
          this.calculateTotals(earnings);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load developer earnings', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }
  calculateTotals(earnings: DeveloperEarning[]) {
    this.totalEarnings = earnings.reduce((sum, dev) => sum + dev.totalEarnings, 0);
    this.totalPaid = earnings.reduce((sum, dev) => sum + dev.paidAmount, 0);
    this.totalPending = earnings.reduce((sum, dev) => sum + dev.pendingAmount, 0);
  }

  applyFilter() {
    this.loadDeveloperEarnings();
  }

  resetFilter() {
    this.dateFilterForm.reset();
    this.loadDeveloperEarnings();
  }
  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Update totals based on filtered data
    this.updateTotalsFromFilteredData();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Updates the summary totals based on currently filtered data
   * This ensures totals reflect what's currently visible in the table
   */
  updateTotalsFromFilteredData(): void {
    // Create a MatTableDataSource instance to leverage its filtering capability
    const tempDataSource = new MatTableDataSource<DeveloperEarning>(this.dataSource.data);
    tempDataSource.filter = this.dataSource.filter;

    // Get the filtered data
    const filteredData = tempDataSource.filteredData;

    // Recalculate totals based on filtered data
    this.totalEarnings = filteredData.reduce((sum, item) => sum + item.totalEarnings, 0);
    this.totalPaid = filteredData.reduce((sum, item) => sum + item.paidAmount, 0);
    this.totalPending = filteredData.reduce((sum, item) => sum + item.pendingAmount, 0);

  }
  generateReport(){}
  viewDetails(earning:any){
    console.log("asdddddddddasdddddddddddd")
  }
  downloadStatement(data:any){}
  processPayment(data:any){}
}
