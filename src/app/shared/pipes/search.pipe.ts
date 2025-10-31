import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appSearch',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform<T>(items: T[] | null, searchText: string, searchFields: string[] = []): T[] {
    if (!items || !searchText) {
      return items || [];
    }

    const searchLower = searchText.toLowerCase().trim();

    return items.filter(item => {
      if (!searchFields || searchFields.length === 0) {
        // If no specific fields provided, search all string properties
        return this.searchAllProperties(item, searchLower);
      } else {
        // Search only in specified fields
        return searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      }
    });
  }

  private searchAllProperties(item: any, searchText: string): boolean {
    if (typeof item !== 'object' || item === null) {
      return item && item.toString().toLowerCase().includes(searchText);
    }

    return Object.keys(item).some(key => {
      const value = item[key];
      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === 'object') {
        return this.searchAllProperties(value, searchText);
      }

      return value.toString().toLowerCase().includes(searchText);
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
}