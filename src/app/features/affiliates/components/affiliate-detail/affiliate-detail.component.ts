import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AffiliateService } from '../../../../core/services/affiliate.service';
import { Affiliate } from '../../../../core/models/affiliate.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-affiliate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './affiliate-detail.component.html',
  styleUrl: './affiliate-detail.component.scss'
})
export class AffiliateDetailComponent implements OnInit {
  affiliate$!: Observable<Affiliate>;
  affiliateId: string = '';

  constructor(
    private affiliateService: AffiliateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.affiliateId = params['id'];
      if (this.affiliateId) {
        this.affiliate$ = this.affiliateService.getAffiliateById(this.affiliateId);
      }
    });
  }

  goBack() {
    this.router.navigate(['/affiliates']);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getTierClass(tier: string): string {
    return tier.toLowerCase();
  }
}
