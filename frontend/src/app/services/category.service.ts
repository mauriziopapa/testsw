import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CacheService } from '../core/cache.service';

import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CategoryResponse } from '../models/category.response';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient, private cacheService: CacheService) {}

  findAll(): Observable<CategoryResponse> {
    let catResp = new CategoryResponse();
    let cat1 = new Category();
    cat1.title = 'Produzione';
    let cat2 = new Category();
    cat2.title = 'Amministrazione';
    catResp.categories.push(cat1, cat2);
    return of(catResp);
  }
}
