import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AffiliateService } from '../../../../core/services/affiliate.service';
import { Affiliate } from '../../../../core/models/affiliate.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-affiliate-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-list.component.html',
  styleUrl: './affiliate-list.component.scss'
})
export class AffiliateListComponent implements OnInit {
  affiliates$!: Observable<Affiliate[]>;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedTier: string = '';
  sortBy: string = 'name';

  statuses = ['pending', 'active', 'suspended', 'inactive'];
  tiers = ['bronze', 'silver', 'gold', 'platinum'];

  constructor(private affiliateService: AffiliateService) {}

  ngOnInit() {
    this.loadAffiliates();
  }

  loadAffiliates() {
    this.affiliates$ = this.affiliateService.getAffiliates();
  }

  getFilteredAffiliates(affiliates: Affiliate[]): Affiliate[] {
    let filtered = affiliates;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(a => a.status === this.selectedStatus);
    }

    if (this.selectedTier) {
      filtered = filtered.filter(a => a.tier === this.selectedTier);
    }

    switch (this.sortBy) {
      case 'earnings':
        filtered.sort((a, b) => b.totalEarnings - a.totalEarnings);
        break;
      case 'conversions':
        filtered.sort((a, b) => b.totalConversions - a.totalConversions);
        break;
      case 'tier':
        const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
        filtered.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }

  approveAffiliate(id: string) {
    if (confirm('Approve this affiliate?')) {
      this.affiliateService.approveAffiliate(id).subscribe(() => {
        this.loadAffiliates();
      });
    }
  }

  suspendAffiliate(id: string) {
    const reason = prompt('Enter suspension reason:');
    if (reason) {
      this.affiliateService.suspendAffiliate(id, reason).subscribe(() => {
        this.loadAffiliates();
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status}`;
  }

  getTierBadgeClass(tier: string): string {
    return `tier-${tier}`;
  }
}
