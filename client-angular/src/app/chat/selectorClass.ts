import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { take } from "rxjs";

@Injectable({
    providedIn: 'root',
  })
export class SelectorClass{
    constructor(private store: Store){}

    select(selectMethod: (data?: any) => any): any{
        let valueForReturn: any;
        this.store.select(selectMethod).pipe(take(1)).subscribe(value => {
            valueForReturn = value;
        });

        return valueForReturn;
    }
}