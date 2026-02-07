import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Affiliate, AffiliateFilter, AffiliateStats } from '../models/affiliate.model';
import { AffiliateLink } from '../models/affiliate-link.model';
import { Commission, CommissionStats } from '../models/commission.model';
import { Payout } from '../models/payout.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  private affiliatesSubject = new BehaviorSubject<Affiliate[]>([]);
  public affiliates$ = this.affiliatesSubject.asObservable();

  private linksSubject = new BehaviorSubject<AffiliateLink[]>([]);
  public links$ = this.linksSubject.asObservable();

  private commissionsSubject = new BehaviorSubject<Commission[]>([]);
  public commissions$ = this.commissionsSubject.asObservable();

  private payoutsSubject = new BehaviorSubject<Payout[]>([]);
  public payouts$ = this.payoutsSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockAffiliates = this.mockDataService.getMockAffiliates();
    const mockLinks = this.mockDataService.getMockAffiliateLinks();
    const mockCommissions = this.mockDataService.getMockCommissions();
    const mockPayouts = this.mockDataService.getMockPayouts();

    this.affiliatesSubject.next(mockAffiliates);
    this.linksSubject.next(mockLinks);
    this.commissionsSubject.next(mockCommissions);
    this.payoutsSubject.next(mockPayouts);
  }

  getAffiliates(filter?: AffiliateFilter): Observable<Affiliate[]> {
    return this.affiliates$.pipe(
      map(affiliates => this.applyAffiliateFilters(affiliates, filter)),
      delay(500)
    );
  }

  getAffiliateById(id: string): Observable<Affiliate> {
    return this.affiliates$.pipe(
      map(affiliates => {
        const affiliate = affiliates.find(a => a.id === id);
        if (!affiliate) throw new Error(`Affiliate with id ${id} not found`);
        return affiliate;
      }),
      delay(300)
    );
  }

  createAffiliate(affiliate: Affiliate): Observable<Affiliate> {
    const newAffiliate = {
      ...affiliate,
      id: `aff${Date.now()}`,
      createdAt: new Date(),
      status: 'pending' as const
    };
    const currentAffiliates = this.affiliatesSubject.value;
    this.affiliatesSubject.next([...currentAffiliates, newAffiliate]);
    return of(newAffiliate).pipe(delay(500));
  }

  updateAffiliate(id: string, updatedAffiliate: Partial<Affiliate>): Observable<Affiliate> {
    const currentAffiliates = this.affiliatesSubject.value;
    const index = currentAffiliates.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Affiliate with id ${id} not found`);

    const affiliate = { ...currentAffiliates[index], ...updatedAffiliate, id };
    const newAffiliates = [...currentAffiliates];
    newAffiliates[index] = affiliate;
    this.affiliatesSubject.next(newAffiliates);
    return of(affiliate).pipe(delay(400));
  }

  deleteAffiliate(id: string): Observable<void> {
    const currentAffiliates = this.affiliatesSubject.value;
    const filtered = currentAffiliates.filter(a => a.id !== id);
    this.affiliatesSubject.next(filtered);
    return of(undefined).pipe(delay(300));
  }

  approveAffiliate(id: string): Observable<Affiliate> {
    return this.updateAffiliate(id, {
      status: 'active',
      approvedAt: new Date()
    });
  }

  suspendAffiliate(id: string, reason: string): Observable<Affiliate> {
    return this.updateAffiliate(id, {
      status: 'suspended',
      suspendedAt: new Date(),
      suspensionReason: reason
    });
  }

  getAffiliateStats(): Observable<AffiliateStats> {
    return this.affiliates$.pipe(
      map(affiliates => {
        const activeAffiliates = affiliates.filter(a => a.status === 'active');
        return {
          totalAffiliates: affiliates.length,
          activeAffiliates: activeAffiliates.length,
          totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
          totalCommissions: affiliates.reduce((sum, a) => sum + a.nextPaymentDue, 0),
          pendingPayouts: 0,
          topAffiliates: affiliates.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5)
        };
      }),
      delay(400)
    );
  }

  getAffiliateLinks(affiliateId: string): Observable<AffiliateLink[]> {
    return this.links$.pipe(
      map(links => links.filter(l => l.affiliateId === affiliateId)),
      delay(400)
    );
  }

  generateLink(affiliateId: string, productId?: string): Observable<AffiliateLink> {
    return this.getAffiliateById(affiliateId).pipe(
      map(affiliate => {
        const code = `aff_${affiliate.name.substring(0, 3).toLowerCase()}_${Date.now()}`;
        const baseUrl = 'https://marketplace.com';
        const fullLink = productId
          ? `${baseUrl}/product/${productId}?ref=${code}`
          : `${baseUrl}/?ref=${code}`;

        const newLink: AffiliateLink = {
          id: `link${Date.now()}`,
          affiliateId,
          vendorId: affiliate.vendorId,
          productId,
          uniqueCode: code,
          fullLink,
          clicks: 0,
          conversions: 0,
          earnings: 0,
          conversionRate: 0,
          status: 'active',
          createdAt: new Date()
        };

        const currentLinks = this.linksSubject.value;
        this.linksSubject.next([...currentLinks, newLink]);
        return newLink;
      }),
      delay(500)
    );
  }

  getCommissions(affiliateId?: string): Observable<Commission[]> {
    return this.commissions$.pipe(
      map(commissions =>
        affiliateId ? commissions.filter(c => c.affiliateId === affiliateId) : commissions
      ),
      delay(400)
    );
  }

  getCommissionStats(affiliateId: string): Observable<CommissionStats> {
    return this.commissions$.pipe(
      map(commissions => {
        const affiliateCommissions = commissions.filter(c => c.affiliateId === affiliateId);
        const pendingAmount = affiliateCommissions
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        const approvedAmount = affiliateCommissions
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        const paidAmount = affiliateCommissions
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.commissionAmount, 0);

        return {
          pendingAmount,
          approvedAmount,
          paidAmount,
          totalCommissions: affiliateCommissions.length,
          averageCommission: approvedAmount / (affiliateCommissions.length || 1)
        };
      }),
      delay(400)
    );
  }

  getPayouts(affiliateId?: string): Observable<Payout[]> {
    return this.payouts$.pipe(
      map(payouts =>
        affiliateId ? payouts.filter(p => p.affiliateId === affiliateId) : payouts
      ),
      delay(500)
    );
  }

  private applyAffiliateFilters(
    affiliates: Affiliate[],
    filter?: AffiliateFilter
  ): Affiliate[] {
    if (!filter) return affiliates;
    let filtered = affiliates;

    if (filter.search) {
      const lowerSearch = filter.search.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(lowerSearch) ||
          a.email.toLowerCase().includes(lowerSearch)
      );
    }

    if (filter.status) {
      filtered = filtered.filter(a => a.status === filter.status);
    }

    if (filter.tier) {
      filtered = filtered.filter(a => a.tier === filter.tier);
    }

    return filtered;
  }
}