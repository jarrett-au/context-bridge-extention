export interface SiteAdapter {
  name: string;
  match(url: string): boolean;
  init(): void;
}
