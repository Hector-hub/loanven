import { Injectable } from '@angular/core';
import database from 'firebase';
import { ref, set,get, child, update, push } from 'firebase/database';
import { ClientI } from '../models/client.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private storage: StorageService) { 
     }
  ac:string=''
 public  async getClients(){
  await this.storage.get('ac')?.then((result:string)=>{
    this.ac=result
        })

    const dbRef = ref(database);
    return get(child(dbRef, `${this.ac}/clients`))
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

  public async addClient(clientData:ClientI,clients:Array<ClientI>){
    await this.storage.get('ac')?.then((result:string)=>{
      this.ac=result
          })
    const newPostKey = push(child(ref(database), `${this.ac}/clients`)).key;
    clientData.id=newPostKey?newPostKey:'';
    set(ref(database, `${this.ac}/clients`), [...clients,clientData])
  }
}
