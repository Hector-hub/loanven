import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import database from 'firebase';
import { ref, set } from 'firebase/database';
import { environment } from 'src/environments/environment.prod';
import { BalanceService } from './services/balance.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent  {
  constructor(private alertController:AlertController,private balanceService:BalanceService,private storage: StorageService) {
   
      this.presentAlertPrompt();
    


  }
  AccessCode=null;
  isOpen=true;
 

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Codigo de Acceso',
      inputs: [
        {
          name: 'code',
          type: 'password',
          placeholder: 'Access Code'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: ()=>{
            this.presentAlertPrompt();
          }
        }, 
        {
          text: 'Aceptar',
          handler: (data:any) => {

            this.encryptPassword(data.code).then(encryptedPassword => {
              if(environment.ac.includes(encryptedPassword)){
                this.isOpen=false
                this.storage.set('ac', encryptedPassword);
                this.balanceService.getBalance(encryptedPassword).then((balance:any)=>{
              
                  if(balance.profits>0){

                  }else{
                    set(ref(database, `${encryptedPassword}/balance`), {profits:0})
                  }
                     })
                 }else{
                  this.presentAlertPrompt();
                 }
            });
           
          }
        }
      ]
    });
  
    await alert.present();
  }


  async digestMessage(message:any) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return hash;
  }
  
  async  hashToHex(hash:any) {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  async  encryptPassword(password:any) {
    const hash = await this.digestMessage(password);
    const hashHex = await this.hashToHex(hash);
    return hashHex;
  }
  

  
}
