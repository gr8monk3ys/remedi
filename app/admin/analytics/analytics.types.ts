export interface SearchStat {
  query: string;
  count: number;
}

export interface EventStat {
  type: string;
  count: number;
}

export interface RemedyStat {
  id: string;
  name: string;
  count: number;
}

export interface Analytics {
  users: {
    total: number;
    newDay: number;
    newWeek: number;
    newMonth: number;
    activeDay: number;
    activeWeek: number;
  };
  searches: {
    total: number;
    day: number;
    week: number;
    top: SearchStat[];
  };
  events: EventStat[];
  activation: {
    landingViews: number;
    landingCtaClicks: number;
    searches: number;
    remedyViews: number;
    favorites: number;
    reviews: number;
    pricingViews: number;
    pricingSelections: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    rates: {
      ctaToPricing: number;
      pricingToCheckout: number;
      checkoutToPaid: number;
      landingToCheckout: number;
    };
  };
  cohorts: {
    weekStart: string;
    signups: number;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week0Pct: number;
    week1Pct: number;
    week2Pct: number;
    week3Pct: number;
    week4Pct: number;
  }[];
  remedies: {
    total: number;
    topViewed: RemedyStat[];
  };
}
