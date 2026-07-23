export type DealsStackParamList = {
  DealsList: undefined;
  DealDetail: { id: string };
};

export type OrganizationsStackParamList = {
  OrganizationsList: undefined;
  OrganizationDetail: { id: string };
  PersonDetail: { id: string };
};

export type PersonsStackParamList = {
  PersonsList: undefined;
  PersonDetail: { id: string };
  OrganizationDetail: { id: string };
};

export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
};

export type AccountStackParamList = {
  Account: undefined;
};

export type MainTabParamList = {
  Deals: undefined;
  Organizations: undefined;
  Persons: undefined;
  Activities: undefined;
  Account: undefined;
};
