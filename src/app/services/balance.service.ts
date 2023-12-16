import { Injectable } from '@angular/core';
import database from 'firebase';
import { child, get, ref } from 'firebase/database';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  constructor(private storage: StorageService) { 

     this.storage.get('ac')?.then((result:string)=>{
      this.ac=result
          })
  }
  ac:string='';
  public async getBalance(ac:string=''){
   await this.storage.get('ac')?.then((result:string)=>{
      this.ac=result
          })
    const dbRef = ref(database);
    return get(child(dbRef, `${this.ac!==''&&this.ac!==null?this.ac:ac}/balance`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          return [];
        }
      })
      .catch(() => {
        return [];
      });
  };
}
