export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
  categories?: Category[];
}
